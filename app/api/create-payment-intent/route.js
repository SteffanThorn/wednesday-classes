import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import Stripe from 'stripe';
import dbConnect from '@/lib/mongodb';
import Booking from '@/lib/models/Booking';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

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
  try {
    // Verify user is authenticated
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in to complete payment' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { bookingId } = body;

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID is required' },
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
    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount / 100, // Convert back to dollars
      currency: paymentIntent.currency.toUpperCase(),
      message: 'Payment intent created successfully',
    });

  } catch (error) {
    console.error('Error creating payment intent:', error);
    
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
        { error: 'Invalid payment configuration' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create payment intent. Please try again.' },
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

