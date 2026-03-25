import Link from 'next/link';
import styles from '../../success/success.module.css';
import { FIVE_CLASS_PACKAGE_SIZE } from '@/lib/pricing';

export const dynamic = 'force-dynamic';

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
          </div>
        </div>

        <div className={styles.section}>
          <h2>What&apos;s Next?</h2>
          <ul className={styles.nextSteps}>
            <li>📧 Your payment was received successfully</li>
            <li>🎟️ Your package purchase is now recorded</li>
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
