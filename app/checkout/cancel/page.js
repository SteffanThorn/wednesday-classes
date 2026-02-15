import { Suspense } from 'react';
import { CheckoutCancelContent, LoadingFallback } from './page-client';

export const dynamic = 'force-dynamic';

function CheckoutCancelContentWrapper({ searchParams }) {
  const bookingIds = searchParams?.bookings;
  const sessionId = searchParams?.session_id;
  
  return <CheckoutCancelContent bookingIds={bookingIds} sessionId={sessionId} />;
}

export default function CheckoutCancelPage({ searchParams }) {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CheckoutCancelContentWrapper searchParams={searchParams} />
    </Suspense>
  );
}

