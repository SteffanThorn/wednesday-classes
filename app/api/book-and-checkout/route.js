import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import Stripe from 'stripe';
import dbConnect from '@/lib/mongodb';
import Booking from '@/lib/models/Booking';
import Coupon from '@/lib/models/Coupon';

// Check for Stripe key at module load time
const hasStripeKey = process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY.startsWith('sk_');

let stripe = null;
if (hasStripeKey) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
}

/**
 * Book and Checkout Endpoint
 * 
 * Creates a booking and immediately initiates Stripe checkout.
 * This is used for the Wednesday Classes booking flow.
 * 
 * POST /api/book-and-checkout
 * Body: {
 *   className: string,
 *   classDate: string (ISO date) - for single date booking,
 *   selectedDates: string[] - for multi-date booking,
 *   classTime: string,
 *   location: string,
 *   amount: number,
 *   userName?: string,
 *   userEmail?: string (optional - uses session email if not provided)
 * }
 */
export async function POST(request) {
  console.log('=== /api/book-and-checkout called ===');
  
  try {
    // Check for Stripe key
    console.log('Checking Stripe config - hasStripeKey:', hasStripeKey);
    
    if (!hasStripeKey || !stripe) {
      console.error('Stripe secret key not configured');
      return NextResponse.json(
        { error: 'Payment system not configured. Please set STRIPE_SECRET_KEY in environment variables.' },
        { status: 500 }
      );
    }

    // Check authentication - user must be logged in to book
    console.log('Getting session...');
    let session;
    try {
      session = await auth();
      console.log('Session obtained, user:', session?.user?.email);
    } catch (authError) {
      console.error('Auth error:', authError);
      return NextResponse.json(
        { error: 'Authentication error. Please sign in again.', requireAuth: true },
        { status: 401 }
      );
    }
    
    if (!session?.user?.email) {
      console.log('No session user email - requiring auth');
      return NextResponse.json(
        { error: 'Please sign in to book a class', requireAuth: true },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    console.log('Request body received:', body);
    const {
      className,
      classDate,
      selectedDates,
      classTime,
      location,
      amount,
      notes,
      bookingType,
      couponCode
    } = body;

    // Validate coupon if provided
    let validatedAmount = amount;
    let appliedCoupon = null;
    
    if (couponCode) {
      const couponResult = await validateAndApplyCoupon(couponCode, amount, selectedDates?.length || 1);
      if (couponResult.error) {
        return NextResponse.json({ error: couponResult.error }, { status: 400 });
      }
      validatedAmount = couponResult.finalAmount;
      appliedCoupon = couponResult.coupon;
    }

    // Validate required fields
    if (!className || !classTime || !location || amount === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Handle multi-date booking
    if (selectedDates && Array.isArray(selectedDates) && selectedDates.length > 0) {
      return await handleMultiDateBooking({
        selectedDates,
        className,
        classTime,
        location,
        amount: validatedAmount,
        notes,
        session,
        stripe,
        couponCode: appliedCoupon?.code,
      });
    }

    // Handle single date booking (original logic)
    if (!classDate) {
      return NextResponse.json(
        { error: 'Missing class date' },
        { status: 400 }
      );
    }

    // Handle "interested" type - just save without payment
    if (bookingType === 'interested') {
      await dbConnect();
      
      const booking = new Booking({
        userId: session.user.id,
        userEmail: session.user.email,
        userName: session.user.name || 'Guest',
        className,
        classDate: new Date(classDate),
        classTime,
        location,
        amount: 0,
        notes: notes || '',
        status: 'interested',
        paymentStatus: 'none',
      });

      await booking.save();

      console.log(`Interested booking created: ${booking._id}`);

      return NextResponse.json({
        success: true,
        bookingId: booking._id.toString(),
        message: 'Interest registered successfully',
        interested: true,
      });
    }

    // Handle "book" type - create booking and initiate payment
    await dbConnect();

    // Use user info from session
    const userEmailAddress = session.user.email;
    const userNameValue = session.user.name || 'Guest';
    const userId = session.user.id;

    // Create the booking
    const booking = new Booking({
      userId: userId,
      userEmail: userEmailAddress,
      userName: userNameValue,
      className,
      classDate: new Date(classDate),
      classTime,
      location,
      amount: parseFloat(validatedAmount),
      notes: notes || '',
      status: 'pending',
      paymentStatus: 'pending',
    });

    await booking.save();

    console.log(`Booking created: ${booking._id}`);

    // Create Stripe Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: userEmailAddress,
      line_items: [
        {
          price_data: {
            currency: 'nzd',
            product_data: {
              name: className,
              description: `${new Date(classDate).toLocaleDateString()} at ${classTime} - ${location}`,
              metadata: {
                bookingId: booking._id.toString(),
              },
            },
            unit_amount: Math.round(validatedAmount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/checkout/success?session_id={CHECKOUT_SESSION_ID}&booking_id=${booking._id}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/wednesday-classes?cancelled=true`,
      metadata: {
        bookingId: booking._id.toString(),
        userEmail: userEmailAddress,
        userName: userNameValue,
        className,
        classDate,
        classTime,
        location,
        amount: validatedAmount.toString(),
      },
      payment_intent_data: {
        metadata: {
          bookingId: booking._id.toString(),
          userEmail: userEmailAddress,
        },
      },
      expires_at: Math.floor(Date.now() / 1000) + (30 * 60), // 30 minutes expiry
    });

    // Update booking with checkout session ID
    booking.checkoutSessionId = checkoutSession.id;
    booking.paymentStatus = 'processing';
    await booking.save();

    console.log(`Checkout session created: ${checkoutSession.id} for booking: ${booking._id}`);

    // Return checkout URL
    return NextResponse.json({
      success: true,
      bookingId: booking._id.toString(),
      checkoutUrl: checkoutSession.url,
      sessionId: checkoutSession.id,
      message: 'Booking created and checkout initiated',
    });

  } catch (error) {
    console.error('Error in book-and-checkout:', error);
    
    // Handle specific Stripe errors
    if (error.type === 'StripeCardError') {
      return NextResponse.json(
        { error: `Card error: ${error.message}` },
        { status: 400 }
      );
    }
    
    if (error.type === 'StripeInvalidRequestError') {
      console.error('Invalid Stripe request:', error);
      return NextResponse.json(
        { error: 'Invalid payment configuration. Please check your Stripe keys.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: `Failed to create booking: ${error.message}` },
      { status: 500 }
    );
  }
}

/**
 * Handle multi-date booking - creates multiple bookings and initiates single Stripe checkout
 */
async function handleMultiDateBooking({ selectedDates, className, classTime, location, amount, notes, session, stripe, couponCode }) {
  console.log('=== Handling multi-date booking ===');
  console.log('Selected dates:', selectedDates);
  console.log('Total amount:', amount);
  console.log('Coupon code:', couponCode);
  
  try {
    await dbConnect();
    
    const userEmailAddress = session.user.email;
    const userNameValue = session.user.name || 'Guest';
    const userId = session.user.id;
    
    // Create bookings for each selected date
    const bookings = [];
    const pricePerClass = amount / selectedDates.length;
    
    for (const date of selectedDates) {
      const booking = new Booking({
        userId: userId,
        userEmail: userEmailAddress,
        userName: userNameValue,
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
      console.log(`Booking created for ${date}: ${booking._id}`);
    }
    
    // Create a single Stripe checkout session for all bookings
    const dateList = selectedDates.map(d => new Date(d).toLocaleDateString('en-NZ', { 
      day: 'numeric', 
      month: 'short' 
    })).join(', ');
    
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: userEmailAddress,
      line_items: [
        {
          price_data: {
            currency: 'nzd',
            product_data: {
              name: `${className} - ${selectedDates.length} classes`,
              description: `Dates: ${dateList} at ${classTime}`,
              metadata: {
                bookingIds: bookings.map(b => b._id.toString()).join(','),
              },
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/checkout/success?session_id={CHECKOUT_SESSION_ID}&booking_ids=${bookings.map(b => b._id.toString()).join(',')}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/wednesday-classes?cancelled=true`,
      metadata: {
        bookingIds: bookings.map(b => b._id.toString()).join(','),
        userEmail: userEmailAddress,
        userName: userNameValue,
        className,
        selectedDates: selectedDates.join(','),
        classTime,
        location,
        amount: amount.toString(),
        totalClasses: selectedDates.length.toString(),
        couponCode: couponCode || '',
      },
      payment_intent_data: {
        metadata: {
          bookingIds: bookings.map(b => b._id.toString()).join(','),
          userEmail: userEmailAddress,
        },
      },
      expires_at: Math.floor(Date.now() / 1000) + (30 * 60), // 30 minutes expiry
    });
    
    // Update all bookings with checkout session ID
    for (const booking of bookings) {
      booking.checkoutSessionId = checkoutSession.id;
      booking.paymentStatus = 'processing';
      await booking.save();
    }
    
    console.log(`Multi-date checkout session created: ${checkoutSession.id} for ${bookings.length} bookings`);
    
    // Return checkout URL
    return NextResponse.json({
      success: true,
      bookingIds: bookings.map(b => b._id.toString()),
      checkoutUrl: checkoutSession.url,
      sessionId: checkoutSession.id,
      message: `${bookings.length} bookings created and checkout initiated`,
    });
    
  } catch (error) {
    console.error('Error in handleMultiDateBooking:', error);
    return NextResponse.json(
      { error: `Failed to create multi-date booking: ${error.message}` },
      { status: 500 }
    );
  }
}

/**
 * Validate and apply coupon
 * Returns the validated amount after applying coupon discount
 */
async function validateAndApplyCoupon(code, originalAmount, numClasses) {
  console.log('=== Validating coupon:', code);
  
  try {
    await dbConnect();
    
    // Find the coupon
    const coupon = await Coupon.findOne({ code: code.toUpperCase().trim() });
    
    if (!coupon) {
      return { error: 'Invalid coupon code' };
    }
    
    // Check if coupon is active
    if (!coupon.active) {
      return { error: 'This coupon is no longer active' };
    }
    
    // Check if coupon has expired
    const now = new Date();
    if (coupon.validUntil && now > new Date(coupon.validUntil)) {
      return { error: 'This coupon has expired' };
    }
    
    // Check if coupon is not yet valid
    if (coupon.validFrom && now < new Date(coupon.validFrom)) {
      return { error: 'This coupon is not yet valid' };
    }
    
    // Check max uses
    if (coupon.maxUses !== null && coupon.currentUses >= coupon.maxUses) {
      return { error: 'This coupon has reached its maximum number of uses' };
    }
    
    // Check minimum classes requirement
    if (coupon.minClasses && numClasses < coupon.minClasses) {
      return { error: `This coupon requires at least ${coupon.minClasses} class(es)` };
    }
    
    // Calculate discount
    let discount = 0;
    if (coupon.discountType === 'percentage') {
      discount = originalAmount * (coupon.discountValue / 100);
    } else {
      discount = coupon.discountValue;
    }
    
    // Ensure discount doesn't exceed original amount
    const finalAmount = Math.max(0, originalAmount - discount);
    
    // Increment coupon usage
    coupon.currentUses += 1;
    await coupon.save();
    
    console.log(`Coupon applied: ${code}, discount: $${discount.toFixed(2)}, final: $${finalAmount.toFixed(2)}`);
    
    return {
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
      },
      finalAmount,
    };
    
  } catch (error) {
    console.error('Error validating coupon:', error);
    return { error: 'Failed to validate coupon' };
  }
}

