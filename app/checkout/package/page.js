'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import PaymentForm from '@/components/PaymentForm';
import HealthIntakeForm from '@/components/HealthIntakeForm';
import { ArrowLeft, Loader2, AlertCircle, CheckCircle, Gift } from 'lucide-react';
import { FIVE_CLASS_PACKAGE_PRICE, FIVE_CLASS_PACKAGE_SIZE } from '@/lib/pricing';

export const dynamic = 'force-dynamic';

export default function PackageCheckoutPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [clientSecret, setClientSecret] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [needsIntake, setNeedsIntake] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=' + encodeURIComponent('/checkout/package'));
      return;
    }

    const init = async () => {
      try {
        setIsLoading(true);
        setError('');

        // Check if user has completed intake form
        const intakeRes = await fetch('/api/health-intake');
        const intakeData = await intakeRes.json();
        if (!intakeData.hasIntake) {
          setNeedsIntake(true);
          setIsLoading(false);
          return;
        }

        const response = await fetch('/api/package-payment-intent', { method: 'POST' });
        const data = await response.json();

        if (!response.ok || !data.clientSecret) {
          throw new Error(data.error || 'Failed to initialise package checkout');
        }

        setClientSecret(data.clientSecret);
      } catch (err) {
        setError(err.message || 'Failed to initialise package checkout');
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, [status, router]);

  const handlePaymentSuccess = (paymentIntent) => {
    setTimeout(() => {
      router.push(`/checkout/package/success?payment_intent=${encodeURIComponent(paymentIntent.id)}`);
    }, 1200);
  };

  const handlePaymentError = (message) => {
    setError(typeof message === 'string' ? message : 'Payment failed');
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-glow-cyan animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Preparing package checkout...</p>
        </div>
      </div>
    );
  }

  // Show intake form fullscreen if not yet completed
  if (needsIntake) {
    return (
      <div className="min-h-screen bg-background overflow-y-auto">
        <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-background/90 backdrop-blur border-b border-glow-cyan/20">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-glow-cyan transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
          <p className="text-xs text-muted-foreground">Step 1 of 2 — Health Form</p>
        </div>
        <HealthIntakeForm
          userName={session?.user?.name || ''}
          userEmail={session?.user?.email || ''}
          onComplete={async () => {
            setNeedsIntake(false);
            setIsLoading(true);
            try {
              const response = await fetch('/api/package-payment-intent', { method: 'POST' });
              const data = await response.json();
              if (!response.ok || !data.clientSecret) throw new Error(data.error || 'Failed to initialise');
              setClientSecret(data.clientSecret);
            } catch (err) {
              setError(err.message);
            } finally {
              setIsLoading(false);
            }
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-lg mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-muted-foreground hover:text-glow-cyan transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Go Back
        </button>

        <div className="p-6 rounded-3xl bg-card border border-glow-cyan/30 mb-6">
          <h1 className="text-2xl font-display text-glow-cyan mb-4">5-Class Package</h1>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-foreground">
              <Gift className="w-4 h-4 text-glow-cyan" />
              <span className="font-medium">Includes {FIVE_CLASS_PACKAGE_SIZE} class credits</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="w-3 h-3 text-green-400" />
              1 credit = 1 class
            </div>

            <div className="pt-3 mt-3 border-t border-glow-cyan/20 flex items-center justify-between">
              <span className="text-muted-foreground">Total</span>
              <span className="text-3xl font-display text-glow-cyan">${FIVE_CLASS_PACKAGE_PRICE.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-card border border-glow-cyan/30">
          <h2 className="text-lg font-medium text-foreground mb-4">Payment Details</h2>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <PaymentForm
            clientSecret={clientSecret}
            amount={FIVE_CLASS_PACKAGE_PRICE}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
            language="en"
          />
        </div>
      </div>
    </div>
  );
}
