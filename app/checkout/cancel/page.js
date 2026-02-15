import { Suspense } from 'react';
import { CheckoutCancelContent, LoadingFallback } from './page-client';

// Force dynamic rendering to avoid static generation issues with useSearchParams
export const dynamic = 'force-dynamic';

export default function CheckoutCancelPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CheckoutCancelContent />
    </Suspense>
  );
}

