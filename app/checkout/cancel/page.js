import { Suspense } from 'react';
import { CheckoutCancelContent, LoadingFallback } from './page-client';

// Force dynamic rendering to avoid static generation issues with searchParams
export const dynamic = 'force-dynamic';

// Async component that receives searchParams - must be wrapped in Suspense
async function CheckoutCancelContentWrapper({ searchParams }) {
  const bookingIds = searchParams?.bookings;
  const sessionId = searchParams?.session_id;
  
  // This component accesses searchParams, so it needs to be inside Suspense
  return <CheckoutCancelContent bookingIds={bookingIds} sessionId={sessionId} />;
}

export default function CheckoutCancelPage({ searchParams }) {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CheckoutCancelContentWrapper searchParams={searchParams} />
    </Suspense>
  );
}

