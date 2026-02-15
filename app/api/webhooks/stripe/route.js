import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import dbConnect from '@/lib/mongodb';
import Booking from '@/lib/models/Booking';
import User from '@/lib/models/User';
import { sendBookingConfirmationEmail, sendPaymentFailedEmail, sendRefundEmail } from '@/lib/email';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Stripe Webhook Handler
 * 
 * This endpoint receives webhook events from Stripe when payment
 * statuses change (e.g., payment succeeded, failed, refunded, etc.)
 * 
 * Based on Express.js webhook pattern with enhancements for Next.js
 */
export async function POST(request) {
  const body = await request.text();
  const signature = headers().get('stripe-signature');

  let event;

  try {
    // Verify that the request actually came from Stripe
    // This is critical for security - prevents fake webhook requests
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(`⚠️  Webhook signature verification failed: ${err.message}`);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // Log the event type for debugging and monitoring
  console.log(`📦 Received webhook event: ${event.type} (ID: ${event.id})`);

  try {
    // Handle the event based on its type
    await handleEvent(event);
    return new NextResponse(JSON.stringify({ received: true }), { status: 200 });
  } catch (err) {
    console.error(`❌ Error handling webhook event ${event.type}: ${err.message}`);
    return new NextResponse(
      JSON.stringify({ error: 'Webhook handler failed' }),
      { status: 500 }
    );
  }
}

/**
 * Process different types of Stripe webhook events
 * 
 * Following the Express.js pattern from the provided code:
 * - Handle payment events (succeeded, failed, canceled)
 * - Handle checkout session events
 * - Handle payment method events
 * - Handle customer events
 */
async function handleEvent(event) {
  switch (event.type) {
    // Checkout events
    case 'checkout.session.completed':
      await handleCheckoutSessionCompleted(event.data.object);
      break;
      
    case 'checkout.session.async_payment_succeeded':
      await handleCheckoutSessionCompleted(event.data.object);
      break;
      
    case 'checkout.session.async_payment_failed':
      await handleCheckoutSessionFailed(event.data.object);
      break;
      
    // Payment intent events
    case 'payment_intent.succeeded':
      await handlePaymentSucceeded(event.data.object);
      break;
      
    case 'payment_intent.payment_failed':
      await handlePaymentFailed(event.data.object);
      break;
      
    case 'payment_intent.canceled':
      await handlePaymentCanceled(event.data.object);
      break;
      
    case 'payment_intent.created':
      await handlePaymentCreated(event.data.object);
      break;
      
    case 'payment_intent.processing':
      await handlePaymentProcessing(event.data.object);
      break;
      
    // Charge events
    case 'charge.refunded':
      await handleRefund(event.data.object);
      break;
      
    case 'charge.succeeded':
      await handleChargeSucceeded(event.data.object);
      break;
      
    case 'charge.failed':
      await handleChargeFailed(event.data.object);
      break;
      
    // Payment method events
    case 'payment_method.attached':
      await handlePaymentMethodAttached(event.data.object);
      break;
      
    case 'payment_method.card_expired':
      await handlePaymentMethodExpired(event.data.object);
      break;
      
    // Customer events
    case 'customer.created':
      await handleCustomerCreated(event.data.object);
      break;
      
    case 'customer.updated':
      await handleCustomerUpdated(event.data.object);
      break;
      
    case 'customer.deleted':
      await handleCustomerDeleted(event.data.object);
      break;
      
    // Subscription events (for future membership implementation)
    case 'customer.subscription.created':
      await handleSubscriptionCreated(event.data.object);
      break;
      
    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object);
      break;
      
    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object);
      break;
      
    // Invoice events
    case 'invoice.payment_succeeded':
      await handleInvoicePaid(event.data.object);
      break;
      
    case 'invoice.payment_failed':
      await handleInvoiceFailed(event.data.object);
      break;
      
    default:
      console.log(`ℹ️  Unhandled event type: ${event.type}`);
  }
}

/**
 * Handle successful payment intent
 * 
 * Following the Express.js pattern: console.log the success message
 * and update the booking status
 */
async function handlePaymentSucceeded(paymentIntent) {
  await dbConnect();
  
  console.log(`✅ PaymentIntent for ${formatAmount(paymentIntent.amount)} succeeded!`);
  console.log(`   PaymentIntent ID: ${paymentIntent.id}`);
  
  // Find booking by multiple possible identifiers
  const booking = await findBookingByPaymentIntent(paymentIntent);
  
  if (booking) {
    await updateBookingPaymentSuccess(booking, paymentIntent);
    console.log(`   Booking ${booking._id} payment completed`);
  } else {
    console.warn(`⚠️  No booking found for payment intent: ${paymentIntent.id}`);
  }
}

/**
 * Handle payment intent creation
 * Log for debugging purposes
 */
async function handlePaymentCreated(paymentIntent) {
  console.log(`💳 PaymentIntent created: ${paymentIntent.id}`);
  console.log(`   Amount: ${formatAmount(paymentIntent.amount)}`);
  console.log(`   Customer: ${paymentIntent.customer || 'N/A'}`);
}

/**
 * Handle payment intent processing
 */
async function handlePaymentProcessing(paymentIntent) {
  await dbConnect();
  
  console.log(`⏳ PaymentIntent processing: ${paymentIntent.id}`);
  
  const booking = await findBookingByPaymentIntent(paymentIntent);
  
  if (booking) {
    booking.paymentStatus = 'processing';
    await booking.save();
    console.log(`   Booking ${booking._id} marked as processing`);
  }
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(paymentIntent) {
  await dbConnect();
  
  console.log(`❌ PaymentIntent failed: ${paymentIntent.id}`);
  console.log(`   Error: ${paymentIntent.last_payment_error?.message || 'Unknown error'}`);
  
  const booking = await findBookingByPaymentIntent(paymentIntent);
  
  if (booking) {
    booking.paymentStatus = 'failed';
    booking.status = 'cancelled';
    booking.paymentError = paymentIntent.last_payment_error?.message || 'Payment failed';
    await booking.save();
    
    // Send payment failed email (non-blocking)
    const formattedDate = new Date(booking.classDate).toLocaleDateString('en-NZ', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    sendPaymentFailedEmail({
      userEmail: booking.userEmail,
      userName: booking.userName,
      className: booking.className,
      classDate: formattedDate,
      classTime: booking.classTime,
      amount: booking.amount,
      bookingId: booking._id.toString()
    }).catch(err => console.error('Failed to send payment failed email:', err));
    
    console.log(`   Booking ${booking._id} payment marked as failed`);
  }
}

/**
 * Handle canceled payment
 */
async function handlePaymentCanceled(paymentIntent) {
  await dbConnect();
  
  console.log(`🚫 PaymentIntent canceled: ${paymentIntent.id}`);
  
  const booking = await findBookingByPaymentIntent(paymentIntent);
  
  if (booking) {
    booking.paymentStatus = 'canceled';
    booking.status = 'cancelled';
    await booking.save();
    console.log(`   Booking ${booking._id} payment canceled`);
  }
}

/**
 * Handle charge succeeded
 */
async function handleChargeSucceeded(charge) {
  console.log(`💰 Charge succeeded: ${charge.id}`);
  console.log(`   Amount: ${formatAmount(charge.amount)}`);
}

/**
 * Handle charge failed
 */
async function handleChargeFailed(charge) {
  console.log(`❌ Charge failed: ${charge.id}`);
  console.log(`   Reason: ${charge.failure_message || 'Unknown'}`);
}

/**
 * Handle refund
 * 
 * Refunds can be partial or full - update accordingly
 */
async function handleRefund(charge) {
  await dbConnect();
  
  console.log(`🔄 Processing refund: ${charge.id}`);
  
  const booking = await Booking.findOne({ 
    stripePaymentId: charge.payment_intent 
  });
  
  if (booking) {
    booking.paymentStatus = 'refunded';
    booking.refundedAt = new Date();
    
    // Check if it's a partial refund
    if (charge.amount_refunded < charge.amount) {
      booking.status = 'partially_refunded';
    } else {
      booking.status = 'refunded';
    }
    
    await booking.save();
    
    // Send refund email (non-blocking)
    const formattedDate = new Date(booking.classDate).toLocaleDateString('en-NZ', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    sendRefundEmail({
      userEmail: booking.userEmail,
      userName: booking.userName,
      className: booking.className,
      classDate: formattedDate,
      classTime: booking.classTime,
      amount: booking.amount,
      refundAmount: charge.amount_refunded / 100,
      bookingId: booking._id.toString()
    }).catch(err => console.error('Failed to send refund email:', err));
    
    console.log(`   Booking ${booking._id} refunded`);
  }
}

/**
 * Handle payment method attached to customer
 * 
 * This handler is based on the Express.js code pattern provided
 * Used when a customer saves a payment method for future use
 */
async function handlePaymentMethodAttached(paymentMethod) {
  console.log(`💳 PaymentMethod attached: ${paymentMethod.id}`);
  console.log(`   Customer: ${paymentMethod.customer}`);
  console.log(`   Type: ${paymentMethod.type}`);
  
  // Optionally save to user record for saved payment methods
  if (paymentMethod.customer) {
    await dbConnect();
    await User.findOneAndUpdate(
      { stripeCustomerId: paymentMethod.customer },
      { 
        $push: { 
          savedPaymentMethods: {
            id: paymentMethod.id,
            type: paymentMethod.type,
            last4: paymentMethod.card?.last4 || '****',
            brand: paymentMethod.card?.brand || 'unknown',
            attachedAt: new Date()
          }
        }
      }
    );
    console.log(`   Payment method saved to customer record`);
  }
}

/**
 * Handle payment method expired
 */
async function handlePaymentMethodExpired(paymentMethod) {
  console.log(`⚠️  PaymentMethod expired: ${paymentMethod.id}`);
  
  // Optionally remove from saved payment methods
  if (paymentMethod.customer) {
    await dbConnect();
    await User.findOneAndUpdate(
      { stripeCustomerId: paymentMethod.customer },
      { $pull: { savedPaymentMethods: { id: paymentMethod.id } } }
    );
  }
}

/**
 * Handle checkout session completed
 * This is the main handler for Stripe Checkout (single + bulk purchases)
 */
async function handleCheckoutSessionCompleted(session) {
  await dbConnect();
  
  console.log(`🎉 Checkout session completed: ${session.id}`);
  console.log(`   Customer: ${session.customer_email || session.customer}`);
  console.log(`   Amount: ${formatAmount(session.amount_total)}`);
  
  // Get booking IDs from metadata
  const bookingIdsStr = session.metadata?.bookingIds;
  
  if (!bookingIdsStr) {
    console.warn(`⚠️  No booking IDs found in session metadata: ${session.id}`);
    return;
  }
  
  const bookingIds = bookingIdsStr.split(',');
  
  // Find all bookings with this checkout session ID
  const bookings = await Booking.find({ 
    _id: { $in: bookingIds },
    checkoutSessionId: session.id
  });
  
  if (bookings.length === 0) {
    console.warn(`⚠️  No bookings found for checkout session: ${session.id}`);
    return;
  }
  
  // Update all bookings to completed
  const now = new Date();
  
  for (const booking of bookings) {
    booking.paymentStatus = 'completed';
    booking.status = 'confirmed';
    booking.stripePaymentId = session.payment_intent || session.id;
    booking.paymentMethod = 'card';
    booking.paidAt = now;
    booking.checkoutSessionId = session.id;
    await booking.save();
    
    // Send booking confirmation email (non-blocking)
    const formattedDate = new Date(booking.classDate).toLocaleDateString('en-NZ', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    sendBookingConfirmationEmail({
      userEmail: booking.userEmail,
      userName: booking.userName,
      className: booking.className,
      classDate: formattedDate,
      classTime: booking.classTime,
      location: booking.location,
      amount: booking.amount,
      bookingId: booking._id.toString()
    }).catch(err => console.error('Failed to send booking confirmation email:', err));
    
    console.log(`   Booking ${booking._id} confirmed`);
  }
  
  console.log(`✅ ${bookings.length} booking(s) confirmed from checkout session ${session.id}`);
}

/**
 * Handle checkout session async payment failed
 */
async function handleCheckoutSessionFailed(session) {
  await dbConnect();
  
  console.log(`❌ Checkout session payment failed: ${session.id}`);
  
  const bookingIdsStr = session.metadata?.bookingIds;
  
  if (bookingIdsStr) {
    const bookingIds = bookingIdsStr.split(',');
    
    await Booking.updateMany(
      { _id: { $in: bookingIds } },
      { 
        $set: { 
          paymentStatus: 'failed',
          status: 'cancelled',
          paymentError: 'Payment failed during async processing'
        }
      }
    );
    
    console.log(`   ${bookingIds.length} booking(s) marked as payment failed`);
  }
}

/**
 * Handle customer created
 */
async function handleCustomerCreated(customer) {
  await dbConnect();
  
  console.log(`👤 Customer created: ${customer.id}`);
  console.log(`   Email: ${customer.email}`);
  
  // Optionally create or update user with Stripe customer ID
  if (customer.email) {
    await User.findOneAndUpdate(
      { email: customer.email },
      { stripeCustomerId: customer.id },
      { upsert: false }
    );
  }
}

/**
 * Handle customer updated
 */
async function handleCustomerUpdated(customer) {
  console.log(`👤 Customer updated: ${customer.id}`);
  
  // Update user record if needed
  if (customer.email) {
    await dbConnect();
    await User.findOneAndUpdate(
      { stripeCustomerId: customer.id },
      { 
        email: customer.email,
        name: customer.name,
        phone: customer.phone
      }
    );
  }
}

/**
 * Handle customer deleted
 */
async function handleCustomerDeleted(customer) {
  await dbConnect();
  
  console.log(`👤 Customer deleted: ${customer.id}`);
  
  await User.findOneAndUpdate(
    { stripeCustomerId: customer.id },
    { $unset: { stripeCustomerId: '' } }
  );
}

/**
 * Handle subscription created
 */
async function handleSubscriptionCreated(subscription) {
  console.log(`📅 Subscription created: ${subscription.id}`);
  console.log(`   Status: ${subscription.status}`);
  console.log(`   Current period end: ${new Date(subscription.current_period_end * 1000).toLocaleDateString()}`);
  // Handle subscription logic if you offer memberships
}

/**
 * Handle subscription updated
 */
async function handleSubscriptionUpdated(subscription) {
  console.log(`📅 Subscription updated: ${subscription.id}`);
  console.log(`   Status: ${subscription.status}`);
}

/**
 * Handle subscription deleted
 */
async function handleSubscriptionDeleted(subscription) {
  console.log(`📅 Subscription deleted: ${subscription.id}`);
  // Handle subscription cancellation
}

/**
 * Handle successful invoice payment
 */
async function handleInvoicePaid(invoice) {
  console.log(`🧾 Invoice paid: ${invoice.id}`);
  console.log(`   Amount: ${formatAmount(invoice.amount_paid)}`);
}

/**
 * Handle failed invoice payment
 */
async function handleInvoiceFailed(invoice) {
  console.log(`❌ Invoice payment failed: ${invoice.id}`);
  console.log(`   Attempt: ${invoice.attempt_count}`);
}

/**
 * Helper: Find booking by payment intent using multiple strategies
 */
async function findBookingByPaymentIntent(paymentIntent) {
  // Try to find booking by payment intent ID
  let booking = await Booking.findOne({ 
    paymentIntentId: paymentIntent.id 
  });
  
  // Also try to find by Stripe payment ID
  if (!booking) {
    booking = await Booking.findOne({ 
      stripePaymentId: paymentIntent.id 
    });
  }
  
  // Try to find by metadata booking ID
  if (!booking && paymentIntent.metadata?.bookingId) {
    booking = await Booking.findById(paymentIntent.metadata.bookingId);
  }
  
  // Try to find by customer email in metadata
  if (!booking && paymentIntent.metadata?.userEmail) {
    booking = await Booking.findOne({
      userEmail: paymentIntent.metadata.userEmail,
      paymentStatus: 'pending',
      status: 'pending'
    });
  }
  
  return booking;
}

/**
 * Helper: Update booking with successful payment info
 */
async function updateBookingPaymentSuccess(booking, paymentIntent) {
  booking.paymentStatus = 'completed';
  booking.status = 'confirmed';
  booking.stripePaymentId = paymentIntent.id;
  booking.paymentMethod = paymentIntent.payment_method_types?.join(', ') || 'card';
  booking.paidAt = new Date();
  
  if (paymentIntent.metadata?.className) {
    booking.className = paymentIntent.metadata.className;
  }
  
  await booking.save();
}

/**
 * Helper: Format amount from cents to readable format
 */
function formatAmount(amountInCents) {
  if (!amountInCents) return '$0.00';
  return new Intl.NumberFormat('en-NZ', {
    style: 'currency',
    currency: 'NZD'
  }).format(amountInCents / 100);
}

