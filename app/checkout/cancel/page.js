import { Suspense } from 'react';
import { CheckoutCancelContent, LoadingFallback } from './page-client';

export const dynamic = 'force-dynamic';

export default function CheckoutCancelPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CheckoutCancelContent />
    </Suspense>
  );
}

