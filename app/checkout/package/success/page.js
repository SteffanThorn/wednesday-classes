import Link from 'next/link';
import Stripe from 'stripe';
import styles from '../../success/success.module.css';
import { FIVE_CLASS_PACKAGE_SIZE } from '@/lib/pricing';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';
import PackagePurchase from '@/lib/models/PackagePurchase';

export const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function processPackageCredits(paymentIntentId) {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (!paymentIntent || paymentIntent.status !== 'succeeded') {
      return { ok: false, message: 'Payment is not completed yet.' };
    }

    if (paymentIntent.metadata?.purchaseType !== 'class_package') {
      return { ok: false, message: 'This payment is not a package purchase.' };
    }

    await dbConnect();

    const existingPurchase = await PackagePurchase.findOne({ paymentIntentId });
    if (existingPurchase) {
      return { ok: true, alreadyProcessed: true, creditsAdded: 0 };
    }

    const userEmail = (paymentIntent.metadata?.userEmail || paymentIntent.receipt_email || '').toLowerCase().trim();
    if (!userEmail) {
      return { ok: false, message: 'Could not determine account email for this purchase.' };
    }

    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return { ok: false, message: 'No matching student account found for this purchase.' };
    }

    user.classCredits = (user.classCredits || 0) + FIVE_CLASS_PACKAGE_SIZE;
    user.classCreditHistory = user.classCreditHistory || [];
    user.classCreditHistory.push({
      change: FIVE_CLASS_PACKAGE_SIZE,
      type: 'purchase',
      description: `${FIVE_CLASS_PACKAGE_SIZE}-class package purchase`,
      paymentIntentId,
    });
    await user.save();

    await PackagePurchase.create({
      paymentIntentId,
      userId: user._id,
      userEmail: user.email,
      packageSize: FIVE_CLASS_PACKAGE_SIZE,
      amount: (paymentIntent.amount || 0) / 100,
    });

    return { ok: true, alreadyProcessed: false, creditsAdded: FIVE_CLASS_PACKAGE_SIZE };
  } catch (error) {
    console.error('Error processing package credits:', error);
    return { ok: false, message: 'Failed to finalize package credits.' };
  }
}

export default async function PackageCheckoutSuccessPage({ searchParams }) {
  const params = await searchParams;
  const paymentIntentId = params?.payment_intent;

  if (!paymentIntentId) {
    return (
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.errorContainer}>
            <h2>No Payment Session Found</h2>
            <p>We couldn&apos;t find your package payment session.</p>
            <Link href="/checkout/package" className={styles.button}>
              Back to Package Checkout
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const processingResult = await processPackageCredits(paymentIntentId);

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.successHeader}>
          <div className={styles.checkmark}>✓</div>
          <h1>Package Payment Successful!</h1>
          <p className={styles.confirmationEmail}>
            Your {FIVE_CLASS_PACKAGE_SIZE}-class package has been purchased.
          </p>
        </div>

        <div className={styles.section}>
          <h2>Order Summary</h2>
          <div className={styles.orderDetails}>
            <div className={styles.detailRow}>
              <span>Order Number:</span>
              <span className={styles.orderNumber}>{paymentIntentId.slice(-12)}</span>
            </div>
            <div className={styles.detailRow}>
              <span>Package:</span>
              <span>{FIVE_CLASS_PACKAGE_SIZE} Class Credits</span>
            </div>
            <div className={styles.detailRow}>
              <span>Credits Added:</span>
              <span>
                {processingResult.ok
                  ? (processingResult.alreadyProcessed ? 'Already applied' : `+${processingResult.creditsAdded}`)
                  : 'Pending'}
              </span>
            </div>
          </div>
        </div>

        {!processingResult.ok && (
          <div className={styles.errorContainer}>
            <p>{processingResult.message}</p>
            <p>Please contact admin if credits are not reflected in your account.</p>
          </div>
        )}

        <div className={styles.section}>
          <h2>What&apos;s Next?</h2>
          <ul className={styles.nextSteps}>
            <li>📧 Your payment was received successfully</li>
            <li>🎟️ Credits are now available for admin attendance confirmation</li>
            <li>📅 Book classes from your dashboard</li>
          </ul>
        </div>

        <div className={styles.actions}>
          <Link href="/dashboard" className={styles.primaryButton}>
            Go to Dashboard
          </Link>
          <Link href="/classes" className={styles.secondaryButton}>
            View Class Schedule
          </Link>
        </div>
      </div>
    </main>
  );
}
