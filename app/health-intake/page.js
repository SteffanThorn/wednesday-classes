'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Loader2 } from 'lucide-react';
import HealthIntakeForm from '@/components/HealthIntakeForm';

export const dynamic = 'force-dynamic';

export default function HealthIntakePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [alreadyDone, setAlreadyDone] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/health-intake');
      return;
    }

    fetch('/api/health-intake')
      .then((r) => r.json())
      .then((data) => {
        if (data.hasIntake) {
          setAlreadyDone(true);
        }
      })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, [status, router]);

  if (status === 'loading' || checking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-glow-cyan" />
      </div>
    );
  }

  if (alreadyDone) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-sm">
          <div className="w-14 h-14 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
            <svg className="w-7 h-7 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-display text-glow-subtle">Form already completed</h2>
          <p className="text-muted-foreground text-sm">
            You've already submitted your health form. You're all set!
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-5 py-2 rounded-xl bg-glow-cyan/10 border border-glow-cyan/30 text-glow-cyan hover:bg-glow-cyan/20 transition-all"
          >
            Go to dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <HealthIntakeForm
      userName={session?.user?.name || ''}
      userEmail={session?.user?.email || ''}
      onComplete={() => router.push('/dashboard?welcome=1')}
    />
  );
}
