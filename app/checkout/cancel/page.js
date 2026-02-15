import { Suspense } from 'react';
import { CheckoutCancelContent, LoadingFallback } from './page-client';

export default function CheckoutCancelPage({ searchParams }) {
  const bookingIds = searchParams?.bookings;
  const sessionId = searchParams?.session_id;
  
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CheckoutCancelContent bookingIds={bookingIds} sessionId={sessionId} />
    </Suspense>
  );
}

