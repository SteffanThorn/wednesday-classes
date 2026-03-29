'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import SignOutButton from '@/components/SignOutButton';

export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  async function createDemoOrder() {
    setLoading(true);
    setMessage('');

    try {
      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemName: 'Starter template order', amount: 15 }),
      });
      const orderData = await orderResponse.json();

      if (!orderResponse.ok) {
        setMessage(orderData.error || 'Failed to create order');
        setLoading(false);
        return;
      }

      const checkoutResponse = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: orderData.order.id }),
      });
      const checkoutData = await checkoutResponse.json();

      if (!checkoutResponse.ok) {
        setMessage(checkoutData.error || 'Failed to create checkout session');
        setLoading(false);
        return;
      }

      window.location.href = checkoutData.url;
    } catch (error) {
      setMessage(error.message || 'Something went wrong');
      setLoading(false);
    }
  }

  if (status === 'loading') {
    return <main className="mx-auto flex min-h-screen max-w-5xl items-center px-6">Loading…</main>;
  }

  if (!session?.user) {
    return null;
  }

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 py-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-cyan-300">Dashboard</p>
          <h1 className="mt-2 text-4xl font-semibold">Hello, {session.user.name || session.user.email}</h1>
          <p className="mt-2 text-slate-300">Use this page as the protected area for your next app.</p>
        </div>
        <SignOutButton />
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <section className="card rounded-3xl p-6">
          <h2 className="text-xl font-semibold">Try the payment flow</h2>
          <p className="mt-2 text-sm text-slate-300">
            This creates an order in MongoDB, then starts Stripe Checkout. The webhook updates the order when payment succeeds.
          </p>
          <button type="button" onClick={createDemoOrder} disabled={loading} className="mt-5 rounded-lg bg-violet-500 px-5 py-3 font-medium text-white hover:bg-violet-400 disabled:opacity-60">
            {loading ? 'Working…' : 'Create demo order'}
          </button>
          {message ? <p className="mt-4 text-sm text-amber-200">{message}</p> : null}
        </section>

        <section className="card rounded-3xl p-6">
          <h2 className="text-xl font-semibold">What to customize</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-300">
            <li>Rename the app and update metadata.</li>
            <li>Replace the Order model with your own domain model.</li>
            <li>Adjust email templates and Stripe product naming.</li>
            <li>Build your product pages on top of this auth/payment base.</li>
          </ul>
          <Link href="/" className="mt-5 inline-block text-cyan-300 hover:underline">
            Back to home
          </Link>
        </section>
      </div>
    </main>
  );
}
