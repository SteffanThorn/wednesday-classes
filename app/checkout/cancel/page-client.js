'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import FloatingParticles from '@/components/FloatingParticle';
import { AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';

function CheckoutCancelContent({ bookingIds, sessionId }) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(true);
  const [updateStatus, setUpdateStatus] = useState('processing');

  useEffect(() => {
    const updateBookings = async () => {
      if (!bookingIds) {
        setUpdateStatus('no_bookings');
        setIsUpdating(false);
        return;
      }

      try {
        // Update bookings to "interested" status since payment was cancelled
        const response = await fetch('/api/bookings/cancel-update', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            bookingIds: bookingIds.split(','),
            sessionId: sessionId,
          }),
        });

        if (response.ok) {
          setUpdateStatus('success');
        } else {
          setUpdateStatus('error');
        }
      } catch (error) {
        console.error('Error updating bookings:', error);
        setUpdateStatus('error');
      } finally {
        setIsUpdating(false);
      }
    };

    updateBookings();
  }, [bookingIds, sessionId]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <FloatingParticles />
      
      <div className="relative z-10">
        <Header />
        
        <section className="px-6 pt-16 pb-12">
          <div className="max-w-md mx-auto text-center">
            {isUpdating ? (
              <>
                <Loader2 className="w-16 h-16 text-yellow-400 animate-spin mx-auto mb-4" />
                <h1 className="text-2xl font-display text-foreground mb-2">
                  Processing...
                </h1>
                <p className="text-muted-foreground">
                  Updating your booking status.
                </p>
              </>
            ) : updateStatus === 'success' ? (
              <>
                <div className="w-16 h-16 rounded-full bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-yellow-400" />
                </div>
                <h1 className="text-2xl font-display text-foreground mb-2">
                  Payment Cancelled
                </h1>
                <p className="text-muted-foreground mb-6">
                  No worries! Your booking has been cancelled. You&apos;re welcome to try again anytime.
                </p>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="w-full py-3 rounded-xl bg-glow-cyan/20 border border-glow-cyan/40 
                             text-glow-cyan font-medium hover:bg-glow-cyan/30 transition-all"
                  >
                    Go to Dashboard
                  </button>
                  <button
                    onClick={() => router.push('/wednesday-classes')}
                    className="w-full py-3 rounded-xl bg-muted/20 border border-border/40 
                             text-muted-foreground font-medium hover:bg-muted/40 transition-all
                             flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Browse Classes
                  </button>
                </div>
              </>
            ) : updateStatus === 'no_bookings' ? (
              <>
                <div className="w-16 h-16 rounded-full bg-muted/20 flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-muted-foreground" />
                </div>
                <h1 className="text-2xl font-display text-foreground mb-2">
                  Payment Cancelled
                </h1>
                <p className="text-muted-foreground mb-6">
                  Your payment was cancelled. No booking was created.
                </p>
                <button
                  onClick={() => router.push('/wednesday-classes')}
                  className="w-full py-3 rounded-xl bg-glow-cyan/20 border border-glow-cyan/40 
                           text-glow-cyan font-medium hover:bg-glow-cyan/30 transition-all
                           flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Browse Classes
                </button>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-red-400" />
                </div>
                <h1 className="text-2xl font-display text-foreground mb-2">
                  Something went wrong
                </h1>
                <p className="text-muted-foreground mb-6">
                  We couldn&apos;t update your booking status. Please contact support.
                </p>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="w-full py-3 rounded-xl bg-glow-cyan/20 border border-glow-cyan/40 
                           text-glow-cyan font-medium hover:bg-glow-cyan/30 transition-all"
                >
                  Go to Dashboard
                </button>
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <FloatingParticles />
      <div className="relative z-10">
        <Header />
        <section className="px-6 pt-16 pb-12">
          <div className="max-w-md mx-auto text-center">
            <Loader2 className="w-16 h-16 text-yellow-400 animate-spin mx-auto mb-4" />
            <h1 className="text-2xl font-display text-foreground mb-2">
              Loading...
            </h1>
          </div>
        </section>
      </div>
    </div>
  );
}

export { CheckoutCancelContent, LoadingFallback };

