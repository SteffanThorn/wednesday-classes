
import { Suspense } from 'react';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import dbConnect from '@/lib/mongodb';
import Booking from '@/lib/models/Booking';
import Stripe from 'stripe';
import styles from './success.module.css';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const dynamic = 'force-dynamic';

async function getCheckoutSessionDetails(sessionId) {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items'],
    });
    
    return {
      id: session.id,
      status: session.status,
      paymentStatus: session.payment_status,
      amountTotal: session.amount_total / 100,
      customerEmail: session.customer_email,
      currency: session.currency?.toUpperCase(),
      lineItems: session.line_items?.data || [],
    };
  } catch (error) {
    console.error('Error retrieving Stripe session:', error);
    return null;
  }
}

async function getPaymentIntentDetails(paymentIntentId) {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    return {
      id: paymentIntent.id,
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency?.toUpperCase(),
    };
  } catch (error) {
    console.error('Error retrieving Stripe payment intent:', error);
    return null;
  }
}

async function getBookingsForSession(sessionId) {
  try {
    await dbConnect();
    
    const bookings = await Booking.find({ 
      checkoutSessionId: sessionId 
    }).sort({ classDate: 1 });
    
    return bookings;
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return [];
  }
}

async function getBookingsForPaymentIntent(paymentIntentId) {
  try {
    await dbConnect();
    
    // Try to find bookings by paymentIntentId
    const bookings = await Booking.find({ 
      paymentIntentId: paymentIntentId 
    }).sort({ classDate: 1 });
    
    // If not found by paymentIntentId, try by stripePaymentId
    if (bookings.length === 0) {
      const bookingsByStripeId = await Booking.find({ 
        stripePaymentId: paymentIntentId 
      }).sort({ classDate: 1 });
      return bookingsByStripeId;
    }
    
    return bookings;
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return [];
  }
}

async function getBookingsById(bookingId) {
  try {
    await dbConnect();
    
    // Handle single booking ID
    const booking = await Booking.findById(bookingId);
    return booking ? [booking] : [];
  } catch (error) {
    console.error('Error fetching booking:', error);
    return [];
  }
}

async function getBookingsByIds(bookingIds) {
  try {
    await dbConnect();
    
    const bookings = await Booking.find({ 
      _id: { $in: bookingIds } 
    }).sort({ classDate: 1 });
    
    return bookings;
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return [];
  }
}

function LoadingSkeleton() {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.spinner}></div>
      <p>Loading your booking details...</p>
    </div>
  );
}

function BookingDetails({ searchParams }) {
  const sessionId = searchParams?.session_id;
  const paymentIntentId = searchParams?.payment_intent;
  const bookingId = searchParams?.booking_id;
  const bookingIdsStr = searchParams?.booking_ids;
  
  // Handle Stripe Checkout session
  if (sessionId) {
    return getCheckoutSessionDetails(sessionId).then(async (session) => {
      const bookings = await getBookingsForSession(sessionId);
      
      if (!session) {
        return (
          <div className={styles.errorContainer}>
            <h2>Unable to retrieve booking details</h2>
            <p>Please contact support if you believe this is an error.</p>
            <Link href="/dashboard" className={styles.button}>
              Go to Dashboard
            </Link>
          </div>
        );
      }
      
      return <BookingDetailsContent session={session} bookings={bookings} />;
    });
  }
  
  // Handle Stripe Elements payment (direct payment intent)
  if (paymentIntentId) {
    return getPaymentIntentDetails(paymentIntentId).then(async (paymentIntent) => {
      let bookings = [];
      
      // Try to find bookings by various methods
      if (bookingIdsStr) {
        const bookingIds = bookingIdsStr.split(',');
        bookings = await getBookingsByIds(bookingIds);
      } else if (bookingId) {
        bookings = await getBookingsById(bookingId);
      } else {
        // Try to find by payment intent
        bookings = await getBookingsForPaymentIntent(paymentIntentId);
      }
      
      if (!paymentIntent) {
        return (
          <div className={styles.errorContainer}>
            <h2>Unable to retrieve payment details</h2>
            <p>Please contact support if you believe this is an error.</p>
            <Link href="/dashboard" className={styles.button}>
              Go to Dashboard
            </Link>
          </div>
        );
      }
      
      // Create a session-like object for the content component
      const session = {
        id: paymentIntent.id,
        status: paymentIntent.status,
        paymentStatus: 'paid',
        amountTotal: paymentIntent.amount,
        customerEmail: bookings[0]?.userEmail || 'N/A',
        currency: paymentIntent.currency,
        lineItems: [],
      };
      
      return <BookingDetailsContent session={session} bookings={bookings} isPaymentIntent />;
    });
  }
  
  // No session or payment intent found
  return (
    <div className={styles.errorContainer}>
      <h2>No Session Found</h2>
      <p>We couldn't find your checkout session.</p>
      <Link href="/" className={styles.button}>
        Go Home
      </Link>
    </div>
  );
}

function BookingDetailsContent({ session, bookings, isPaymentIntent = false }) {
  const amountTotal = session.amountTotal || session.amount || 0;
  const currency = session.currency || 'NZD';
  
  return (
    <div className={styles.container}>
      <div className={styles.successHeader}>
        <div className={styles.checkmark}>✓</div>
        <h1>Payment Successful!</h1>
        <p className={styles.confirmationEmail}>
          A confirmation email has been sent to <strong>{session.customerEmail}</strong>
        </p>
      </div>

      <div className={styles.section}>
        <h2>Order Summary</h2>
        <div className={styles.orderDetails}>
          <div className={styles.detailRow}>
            <span>Order Number:</span>
            <span className={styles.orderNumber}>{session.id.slice(-12)}</span>
          </div>
          <div className={styles.detailRow}>
            <span>Amount Paid:</span>
            <span className={styles.amount}>${amountTotal.toFixed(2)} {currency}</span>
          </div>
          <div className={styles.detailRow}>
            <span>Classes Booked:</span>
            <span>{bookings.length}</span>
          </div>
        </div>
      </div>

      {bookings.length > 0 && (
        <div className={styles.section}>
          <h2>Your Classes</h2>
          <div className={styles.classesList}>
            {bookings.map((booking, index) => (
              <div key={booking._id?.toString() || index} className={styles.classCard}>
                <div className={styles.classInfo}>
                  <h3>{booking.className}</h3>
                  <p>{new Date(booking.classDate).toLocaleDateString('en-NZ', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</p>
                  <p>{booking.classTime}</p>
                  <p className={styles.location}>{booking.location}</p>
                </div>
                <div className={styles.classPrice}>
                  ${booking.amount?.toFixed(2) || '0.00'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {bookings.length === 0 && session.lineItems?.length > 0 && (
        <div className={styles.section}>
          <h2>Items Purchased</h2>
          <div className={styles.classesList}>
            {session.lineItems.map((item, index) => (
              <div key={item.id || index} className={styles.classCard}>
                <div className={styles.classInfo}>
                  <h3>{item.description || item.product?.name}</h3>
                  <p className={styles.quantity}>Quantity: {item.quantity}</p>
                </div>
                <div className={styles.classPrice}>
                  ${((item.amount_total || item.amount) / 100).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={styles.section}>
        <h2>What&apos;s Next?</h2>
        <ul className={styles.nextSteps}>
          <li>📧 Check your email for confirmation and class details</li>
          <li>📅 Add the classes to your calendar</li>
          <li>👕 Bring comfortable clothing and a yoga mat</li>
          <li>🚗 Plan your arrival - we recommend coming 10 minutes early</li>
        </ul>
      </div>

      <div className={styles.actions}>
        <Link href="/dashboard" className={styles.primaryButton}>
          View My Bookings
        </Link>
        <Link href="/classes" className={styles.secondaryButton}>
          Book More Classes
        </Link>
      </div>
    </div>
  );
}

export default async function CheckoutSuccessPage({ searchParams }) {
  // In Next.js App Router, searchParams is a Promise - await it to get the actual params
  const params = await searchParams;
  
  // If no params, show error
  if (!params || (!params?.session_id && !params?.payment_intent)) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <h2>No Session Found</h2>
          <p>We couldn&apos;t find your checkout session.</p>
          <Link href="/" className={styles.button}>
            Go Home
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <main className={styles.main}>
      <Suspense fallback={<LoadingSkeleton />}>
        <BookingDetails searchParams={params} />
      </Suspense>
    </main>
  );
}

