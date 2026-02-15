import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import Stripe from 'stripe';
import dbConnect from '@/lib/mongodb';
import Booking from '@/lib/models/Booking';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Create Stripe Checkout Session
 * 
 * Creates a Stripe Checkout Session for one or multiple class bookings.
 * Supports both single class and bulk purchases.
 * 
 * POST /api/create-checkout-session
 * Body: { bookingIds: string[] } - Array of booking IDs to purchase
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
    const { bookingIds } = body;

    if (!bookingIds || !Array.isArray(bookingIds) || bookingIds.length === 0) {
      return NextResponse.json(
        { error: 'Booking IDs are required' },
        { status: 400 }
      );
    }

    // Connect to database
    await dbConnect();

    // Fetch all bookings
    const bookings = await Booking.find({ 
      _id: { $in: bookingIds } 
    });

    if (bookings.length === 0) {
      return NextResponse.json(
        { error: 'No bookings found' },
        { status: 404 }
      );
    }

    // Verify all bookings belong to the authenticated user
    for (const booking of bookings) {
      if (booking.userEmail !== session.user.email) {
        return NextResponse.json(
          { error: `Unauthorized - Booking ${booking._id} does not belong to you` },
          { status: 403 }
        );
      }
    }

    // Check all bookings are in valid state
    const invalidBookings = bookings.filter(b => 
      b.paymentStatus === 'completed' || 
      b.paymentStatus === 'processing' ||
      b.status === 'confirmed' ||
      b.status === 'cancelled'
    );

    if (invalidBookings.length > 0) {
      return NextResponse.json(
        { error: 'Some bookings are already paid, processing, or cancelled' },
        { status: 400 }
      );
    }

    // Calculate total amount
    const totalAmount = bookings.reduce((sum, b) => sum + b.amount, 0);

    // Prepare line items for Stripe Checkout
    const lineItems = bookings.map((booking) => ({
      price_data: {
        currency: 'nzd',
        product_data: {
          name: booking.className,
          description: `${booking.classDate.toLocaleDateString()} at ${booking.classTime} - ${booking.location}`,
          metadata: {
            bookingId: booking._id.toString(),
          },
        },
        unit_amount: Math.round(booking.amount * 100), // Convert to cents
      },
      quantity: 1,
    }));

    // Create Stripe Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: session.user.email,
      line_items: lineItems,
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/checkout/cancel?bookings=${bookingIds.join(',')}`,
      metadata: {
        bookingIds: bookingIds.join(','),
        userId: session.user.id || 'unknown',
        userEmail: session.user.email,
        totalBookings: bookings.length.toString(),
        totalAmount: totalAmount.toString(),
      },
      payment_intent_data: {
        metadata: {
          bookingIds: bookingIds.join(','),
          userEmail: session.user.email,
        },
      },
      expires_at: Math.floor(Date.now() / 1000) + (30 * 60), // 30 minutes expiry
    });

    // Update all bookings with checkout session ID and mark as processing
    await Booking.updateMany(
      { _id: { $in: bookingIds } },
      { 
        $set: { 
          checkoutSessionId: checkoutSession.id,
          paymentStatus: 'processing',
          updatedAt: new Date()
        }
      }
    );

    console.log(`Checkout session created: ${checkoutSession.id} for ${bookings.length} booking(s)`);

    // Return session URL for redirect
    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
      totalAmount: totalAmount,
      bookingCount: bookings.length,
      message: 'Checkout session created successfully',
    });

  } catch (error) {
    console.error('Error creating checkout session:', error);
    
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
      { error: 'Failed to create checkout session. Please try again.' },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to retrieve checkout session status
 * 
 * GET /api/create-checkout-session?session_id=xxx
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
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Retrieve session from Stripe
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);

    return NextResponse.json({
      sessionId: checkoutSession.id,
      status: checkoutSession.status,
      paymentStatus: checkoutSession.payment_status,
      amountTotal: checkoutSession.amount_total / 100,
      customerEmail: checkoutSession.customer_email,
    });

  } catch (error) {
    console.error('Error retrieving checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve checkout session' },
      { status: 500 }
    );
  }
}

