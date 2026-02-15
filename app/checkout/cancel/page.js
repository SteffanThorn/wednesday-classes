import { Suspense } from 'react';
import { CheckoutCancelContent, LoadingFallback } from './page-client';

// Force dynamic rendering to avoid prerender errors
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

function CheckoutCancelContentWrapper({ searchParams }) {
  // Handle both promise and object searchParams
  const bookingIds = searchParams?.bookings || null;
  const sessionId = searchParams?.session_id || null;
  
  return <CheckoutCancelContent bookingIds={bookingIds} sessionId={sessionId} />;
}

export default function CheckoutCancelPage({ searchParams }) {
  // During prerender, searchParams might be empty
  const params = searchParams || {};
  
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CheckoutCancelContentWrapper searchParams={params} />
    </Suspense>
  );
}
