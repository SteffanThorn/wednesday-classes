import { Suspense } from 'react';
import Link from 'next/link';
import { CheckoutCancelContent, LoadingFallback } from './page-client';

export const dynamic = 'force-dynamic';

function CheckoutCancelContentWrapper({ bookingIds, sessionId }) {
  return <CheckoutCancelContent bookingIds={bookingIds} sessionId={sessionId} />;
}

export default function CheckoutCancelPage({ searchParams }) {
  const bookingIds = searchParams?.bookings || null;
  const sessionId = searchParams?.session_id || null;
  
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CheckoutCancelContentWrapper bookingIds={bookingIds} sessionId={sessionId} />
    </Suspense>
  );
}

