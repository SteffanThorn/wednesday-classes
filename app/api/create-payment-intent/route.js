
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import Stripe from 'stripe';
import dbConnect from '@/lib/mongodb';
import Booking from '@/lib/models/Booking';
import { inferDayFromClassName, isAllowedClassDate } from '@/lib/class-schedule';
import { calculateClassBookingTotal } from '@/lib/pricing';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Log key prefixes for debugging (first few characters only)
console.log('Stripe configuration:', {
  secretKeyPrefix: process.env.STRIPE_SECRET_KEY?.substring(0, 8),
  hasSecretKey: !!process.env.STRIPE_SECRET_KEY,
  nodeEnv: process.env.NODE_ENV,
});

function validateScheduledClassDates(className, selectedDates, classDate) {
  const scheduleDay = inferDayFromClassName(className);
  if (!scheduleDay) {
    return { valid: true };
  }

  const datesToValidate = Array.isArray(selectedDates) && selectedDates.length > 0
    ? selectedDates
    : (classDate ? [classDate] : []);

  if (datesToValidate.length === 0) {
    return {
      valid: false,
      error: 'No class dates were provided for this booking',
    };
  }

  const invalidDates = datesToValidate.filter((d) => !isAllowedClassDate(scheduleDay, d));
  if (invalidDates.length > 0) {
    return {
      valid: false,
      error: `Selected date(s) not available for ${scheduleDay} classes: ${invalidDates.join(', ')}`,
    };
  }

  return { valid: true };
}

function getDayRange(classDateInput) {
  const d = new Date(classDateInput);
  const dayStart = new Date(d);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(d);
  dayEnd.setHours(23, 59, 59, 999);
  return { dayStart, dayEnd };
}

async function findDuplicateBooking({ userEmail, classDate, classTime }) {
  const { dayStart, dayEnd } = getDayRange(classDate);
  return Booking.findOne({
    userEmail: String(userEmail || '').toLowerCase().trim(),
    classDate: { $gte: dayStart, $lte: dayEnd },
    classTime,
    status: { $ne: 'cancelled' },
    paymentStatus: { $nin: ['failed', 'canceled', 'refunded'] },
  }).lean();
}

/**
 * Create Payment Intent Endpoint
 * 
 * Creates a Stripe PaymentIntent for a booking and returns
 * the client secret for frontend Stripe Elements integration.
 * 
 * POST /api/create-payment-intent
 * Body: { bookingId: string }
 */
export async function POST(request) {
  let session = null;
  try {
    // Verify user is authenticated
    session = await auth();
    console.log('Auth session check:', { 
      hasSession: !!session, 
      hasUser: !!session?.user, 
      hasEmail: !!session?.user?.email,
      userEmail: session?.user?.email 
    });
    
    if (!session?.user?.email) {
      console.error('Unauthorized: No valid session or email');
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in to complete payment', code: 'NO_SESSION' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { bookingId, amount: requestedAmount, className, classDate, classTime, location, selectedDates, couponCode, notes } = body;

    // Debug logging
    console.log('Create Payment Intent Request:', {
      bookingId,
      requestedAmount,
      className,
      classDate,
      classTime,
      location,
      selectedDates,
      couponCode,
      notes,
      bodyKeys: Object.keys(body),
      rawBody: JSON.stringify(body)
    });

    // If no bookingId, create a new booking from the provided details
    if (!bookingId && requestedAmount && className) {
      console.log('Creating ad-hoc booking with params:', { requestedAmount, className, classDate, selectedDates });
      return await createAdHocBookingAndPaymentIntent({
        session,
        amount: requestedAmount,
        className,
        classDate,
        classTime,
        location,
        selectedDates,
        couponCode,
        notes,
      });
    }

    if (!bookingId) {
      console.error('Missing booking details:', { bookingId, requestedAmount, className });
      return NextResponse.json(
        { error: 'Booking ID or booking details are required', received: { bookingId: !!bookingId, requestedAmount: !!requestedAmount, className: !!className }, code: 'MISSING_FIELDS' },
        { status: 400 }
      );
    }

    // Connect to database
    await dbConnect();

    // Find the booking and verify ownership
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Verify the booking belongs to the authenticated user
    if (booking.userEmail !== session.user.email) {
      return NextResponse.json(
        { error: 'Unauthorized - This booking does not belong to you' },
        { status: 403 }
      );
    }

    // Check if booking is already paid
    if (booking.paymentStatus === 'paid' || booking.paymentStatus === 'completed') {
      return NextResponse.json(
        { error: 'Booking is already paid' },
        { status: 400 }
      );
    }

    // Check if booking is in a valid state for payment
    if (booking.status === 'cancelled') {
      return NextResponse.json(
        { error: 'Cannot pay for a cancelled booking' },
        { status: 400 }
      );
    }

    // Check if a payment intent already exists and is valid
    if (booking.paymentIntentId) {
      // Retrieve the existing payment intent
      const existingPaymentIntent = await stripe.paymentIntents.retrieve(
        booking.paymentIntentId
      );

      // If the payment intent is still valid (not succeeded or canceled), return it
      if (existingPaymentIntent.status !== 'succeeded' && 
          existingPaymentIntent.status !== 'canceled') {
        return NextResponse.json({
          clientSecret: existingPaymentIntent.client_secret,
          paymentIntentId: existingPaymentIntent.id,
          amount: existingPaymentIntent.amount / 100,
          message: 'Existing payment intent retrieved',
        });
      }

      // If the payment intent is expired, create a new one
      console.log(`Creating new payment intent for booking ${bookingId} (previous one expired)`);
    }

    // Create a new PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(booking.amount * 100), // Convert to cents (Stripe expects smallest currency unit)
      currency: 'nzd', // New Zealand Dollar - adjust based on your business location
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        bookingId: bookingId.toString(),
        userId: session.user.id || 'unknown',
        userEmail: booking.userEmail,
        userName: booking.userName,
        className: booking.className,
        classDate: booking.classDate.toISOString(),
        classTime: booking.classTime,
      },
      description: `Yoga class booking: ${booking.className} on ${booking.classDate.toLocaleDateString()} at ${booking.classTime}`,
      receipt_email: booking.userEmail,
      // Optional: Set up return URLs for different scenarios
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/booking/success`,
    });

    // Save the payment intent ID to the booking
    booking.paymentIntentId = paymentIntent.id;
    booking.updatedAt = new Date();
    await booking.save();

    console.log(`Payment intent created: ${paymentIntent.id} for booking: ${bookingId}`);

    // Return the client secret to the frontend
    console.log('Payment intent created successfully:', {
      paymentIntentId: paymentIntent.id,
      clientSecretPrefix: paymentIntent.client_secret?.substring(0, 20),
      amount: paymentIntent.amount,
      status: paymentIntent.status
    });
    
    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount / 100, // Convert back to dollars
      currency: paymentIntent.currency.toUpperCase(),
      message: 'Payment intent created successfully',
    });

  } catch (error) {
    console.error('========== ERROR CREATING PAYMENT INTENT ==========');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Session info at time of error:', { 
      hasSession: !!session, 
      hasUser: !!session?.user, 
      userEmail: session?.user?.email 
    });
    
    // Handle specific error types
    if (error.name === 'ValidationError') {
      console.error('Mongoose validation error:', error.errors);
      return NextResponse.json(
        { error: 'Invalid booking data. Please check your selections.', details: error.message, code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }
    
    if (error.name === 'CastError') {
      console.error('Mongoose cast error (invalid ID format):', error);
      return NextResponse.json(
        { error: 'Invalid booking ID format.', code: 'INVALID_ID' },
        { status: 400 }
      );
    }
    
    if (error.message?.includes('JWT')) {
      console.error('JWT/Auth error detected');
      return NextResponse.json(
        { error: 'Session expired. Please sign in again.', code: 'SESSION_EXPIRED' },
        { status: 401 }
      );
    }
    
    // Handle specific Stripe errors
    if (error.type === 'StripeCardError') {
      return NextResponse.json(
        { error: `Card error: ${error.message}`, code: 'CARD_ERROR' },
        { status: 400 }
      );
    }
    
    if (error.type === 'StripeInvalidRequestError') {
      console.error('Invalid Stripe request:', error);
      return NextResponse.json(
        { error: 'Invalid payment configuration. Please contact support.', code: 'STRIPE_CONFIG_ERROR' },
        { status: 500 }
      );
    }

    // Generic error - include message for debugging
    const errorMessage = process.env.NODE_ENV === 'development' 
      ? error.message 
      : 'Failed to create payment intent. Please try again.';
    
    return NextResponse.json(
      { error: errorMessage, code: 'GENERAL_ERROR' },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to retrieve payment intent status
 * 
 * GET /api/create-payment-intent?bookingId=xxx
 */
export async function GET(request) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('bookingId');

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    if (booking.userEmail !== session.user.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    if (!booking.paymentIntentId) {
      return NextResponse.json(
        { error: 'No payment intent found for this booking' },
        { status: 404 }
      );
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(
      booking.paymentIntentId
    );

    return NextResponse.json({
      paymentIntentId: paymentIntent.id,
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency.toUpperCase(),
      paymentStatus: booking.paymentStatus,
      bookingStatus: booking.status,
    });

  } catch (error) {
    console.error('Error retrieving payment intent:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve payment status' },
      { status: 500 }
    );
  }
}

/**
 * Create a booking and payment intent for ad-hoc bookings
 * Used when user goes directly to checkout without creating a booking first
 */
async function createAdHocBookingAndPaymentIntent({ session, amount, className, classDate, classTime, location, selectedDates, couponCode, notes }) {
  console.log('=== Starting createAdHocBookingAndPaymentIntent ===');
  console.log('Input params:', { amount, className, classDate, classTime, location, selectedDates, couponCode, notes });
  console.log('User from session:', { email: session?.user?.email, name: session?.user?.name, id: session?.user?.id });
  
  // Validate required params
  if (!session?.user?.email) {
    console.error('No user email in session');
    return NextResponse.json(
      { error: 'Unauthorized - No user session found', code: 'NO_SESSION' },
      { status: 401 }
    );
  }
  
  if (!amount || !className) {
    console.error('Missing required params:', { amount, className });
    return NextResponse.json(
      { error: 'Missing required booking information', code: 'MISSING_FIELDS' },
      { status: 400 }
    );
  }

  try {
    await dbConnect();
    console.log('Database connected successfully');
  } catch (dbError) {
    console.error('Database connection failed:', dbError);
    return NextResponse.json(
      { error: 'Database connection failed. Please try again.', code: 'DB_ERROR', details: dbError.message },
      { status: 500 }
    );
  }

  const userEmail = session.user.email;
  const userName = session.user.name || 'Guest';
  const userId = session.user.id;

  const scheduleValidation = validateScheduledClassDates(className, selectedDates, classDate);
  if (!scheduleValidation.valid) {
    return NextResponse.json(
      { error: scheduleValidation.error, code: 'INVALID_CLASS_DATE' },
      { status: 400 }
    );
  }
  
  try {
    // Handle coupon if provided
    let finalAmount = parseFloat(amount);
    let appliedCoupon = null;
    let numClasses = 1;
    
    // Determine number of classes
    if (selectedDates && Array.isArray(selectedDates) && selectedDates.length > 0) {
      numClasses = selectedDates.length;
    } else if (classDate) {
      numClasses = 1;
    }
    
    // Apply package pricing from class count (server-side source of truth)
    const packageBasedAmount = calculateClassBookingTotal(numClasses);
    if (packageBasedAmount > 0) {
      finalAmount = packageBasedAmount;
    }

    // Validate coupon if provided
    if (couponCode) {
      try {
        const Coupon = (await import('@/lib/models/Coupon')).default;
        const coupon = await Coupon.findOne({ code: couponCode.toUpperCase().trim() });
        
        if (coupon && coupon.active) {
          const now = new Date();
          const isValid = (!coupon.validUntil || now <= new Date(coupon.validUntil)) &&
                         (!coupon.validFrom || now >= new Date(coupon.validFrom));
          const hasUses = coupon.maxUses === null || coupon.currentUses < coupon.maxUses;
          const meetsMinClasses = !coupon.minClasses || numClasses >= coupon.minClasses;
          
          if (isValid && hasUses && meetsMinClasses) {
            // Calculate discount
            let discount = 0;
            if (coupon.discountType === 'percentage') {
              discount = finalAmount * (coupon.discountValue / 100);
            } else {
              discount = coupon.discountValue;
            }
            finalAmount = Math.max(0, finalAmount - discount);
            appliedCoupon = {
              code: coupon.code,
              discountType: coupon.discountType,
              discountValue: coupon.discountValue
            };
            
            // Increment coupon usage
            coupon.currentUses += 1;
            await coupon.save();
          }
        }
      } catch (couponErr) {
        console.error('Error validating coupon:', couponErr);
        // Continue without coupon
      }
    }

    // Handle multi-date booking
    if (selectedDates && Array.isArray(selectedDates) && selectedDates.length > 0) {
      return await createMultiDateBookingAndPaymentIntent({
        session,
        selectedDates,
        className,
        classTime,
        location,
        amount: finalAmount,
        notes: notes || '',
        appliedCoupon,
      });
    }

    // Single date booking
    const duplicateBooking = await findDuplicateBooking({
      userEmail,
      classDate: classDate ? new Date(classDate) : new Date(),
      classTime: classTime || 'TBD',
    });

    if (duplicateBooking) {
      return NextResponse.json(
        {
          error: 'You already have a booking for this class session.',
          code: 'DUPLICATE_BOOKING',
          duplicate: {
            bookingId: duplicateBooking._id.toString(),
            classDate: duplicateBooking.classDate,
            classTime: duplicateBooking.classTime,
            status: duplicateBooking.status,
            paymentStatus: duplicateBooking.paymentStatus,
          },
        },
        { status: 409 }
      );
    }

    // Create a new booking
    const booking = new Booking({
      userId: userId,
      userEmail: userEmail,
      userName: userName,
      className,
      classDate: classDate ? new Date(classDate) : new Date(),
      classTime: classTime || 'TBD',
      location: location || 'TBD',
      amount: finalAmount,
      notes: notes || '',
      status: 'pending',
      paymentStatus: 'pending',
    });

    await booking.save();
    console.log(`Ad-hoc booking created: ${booking._id}`);

    // Create a PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(booking.amount * 100),
      currency: 'nzd',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        bookingId: booking._id.toString(),
        userId: userId || 'unknown',
        userEmail: booking.userEmail,
        userName: booking.userName,
        className: booking.className,
        classDate: booking.classDate.toISOString(),
        classTime: booking.classTime,
      },
      description: `Yoga class booking: ${booking.className}`,
      receipt_email: booking.userEmail,
    });

    // Save payment intent ID to booking
    booking.paymentIntentId = paymentIntent.id;
    booking.updatedAt = new Date();
    await booking.save();

    console.log(`Payment intent created: ${paymentIntent.id} for ad-hoc booking: ${booking._id}`);

    // Return the client secret and booking details
    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency.toUpperCase(),
      bookingId: booking._id.toString(),
      className: booking.className,
      classDate: booking.classDate.toISOString(),
      classTime: booking.classTime,
      location: booking.location,
      message: 'Payment intent created successfully',
    });
  } catch (innerError) {
    console.error('Error in ad-hoc booking creation:', innerError);
    return NextResponse.json(
      { error: 'Failed to create booking: ' + innerError.message, code: 'BOOKING_CREATION_ERROR' },
      { status: 500 }
    );
  }
}

/**
 * Create multiple bookings for multi-date booking and a single payment intent
 */
async function createMultiDateBookingAndPaymentIntent({ session, selectedDates, className, classTime, location, amount, notes, appliedCoupon }) {
  const userEmail = session.user.email;
  const userName = session.user.name || 'Guest';
  const userId = session.user.id;
  
  const pricePerClass = amount / selectedDates.length;
  
  // Create bookings for each selected date
  const bookings = [];
  
  for (const date of selectedDates) {
    const duplicateBooking = await findDuplicateBooking({
      userEmail,
      classDate: date,
      classTime,
    });

    if (duplicateBooking) {
      return NextResponse.json(
        {
          error: 'One of the selected classes is already booked. Duplicate booking is not allowed.',
          code: 'DUPLICATE_BOOKING',
          duplicate: {
            bookingId: duplicateBooking._id.toString(),
            classDate: duplicateBooking.classDate,
            classTime: duplicateBooking.classTime,
            status: duplicateBooking.status,
            paymentStatus: duplicateBooking.paymentStatus,
          },
        },
        { status: 409 }
      );
    }

    const booking = new Booking({
      userId: userId,
      userEmail: userEmail,
      userName: userName,
      className,
      classDate: new Date(date),
      classTime,
      location,
      amount: pricePerClass,
      notes: notes || '',
      status: 'pending',
      paymentStatus: 'pending',
    });
    
    await booking.save();
    bookings.push(booking);
    console.log(`Multi-date booking created for ${date}: ${booking._id}`);
  }
  
  const bookingIds = bookings.map(b => b._id.toString());
  
  // Create a single PaymentIntent for all bookings
  const dateList = selectedDates.map(d => new Date(d).toLocaleDateString('en-NZ', { 
    day: 'numeric', 
    month: 'short' 
  })).join(', ');
  
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency: 'nzd',
    automatic_payment_methods: {
      enabled: true,
    },
    metadata: {
      bookingIds: bookingIds.join(','),
      userId: userId || 'unknown',
      userEmail: userEmail,
      userName: userName,
      className: className,
      selectedDates: selectedDates.join(','),
      classTime: classTime,
    },
    description: `${className} - ${selectedDates.length} classes`,
    receipt_email: userEmail,
  });

  // Save payment intent ID to all bookings
  for (const booking of bookings) {
    booking.paymentIntentId = paymentIntent.id;
    booking.updatedAt = new Date();
    await booking.save();
  }

  console.log(`Payment intent created: ${paymentIntent.id} for ${bookings.length} multi-date bookings`);

  // Return the client secret and booking details
  return NextResponse.json({
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
    amount: amount,
    currency: paymentIntent.currency.toUpperCase(),
    bookingIds: bookingIds,
    primaryBookingId: bookings[0]._id.toString(),
    className: className,
    selectedDates: selectedDates,
    classTime: classTime,
    location: location,
    message: 'Payment intent created successfully for multi-date booking',
  });
}

