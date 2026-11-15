'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('e') || '';
  const token = searchParams.get('t') || '';
  const [state, setState] = useState('idle'); // idle | sending | done | error
  const [error, setError] = useState('');

  const confirm = async () => {
    setState('sending');
    setError('');
    try {
      const res = await fetch(`/api/unsubscribe?e=${encodeURIComponent(email)}&t=${encodeURIComponent(token)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: 'link' }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Could not unsubscribe');
      setState('done');
    } catch (err) {
      setError(err.message || 'Could not unsubscribe');
      setState('error');
    }
  };

  const card = 'max-w-md w-full rounded-2xl border border-glow-cyan/20 bg-card/60 p-8 text-center space-y-4';

  if (!email || !token) {
    return (
      <div className={card}>
        <h1 className="font-display text-2xl text-foreground">Unsubscribe</h1>
        <p className="text-muted-foreground text-sm">
          This link is incomplete. Please use the unsubscribe link from the email, or reply to the email with
          &ldquo;Unsubscribe&rdquo;.
        </p>
      </div>
    );
  }

  if (state === 'done') {
    return (
      <div className={card}>
        <h1 className="font-display text-2xl text-foreground">You&apos;re unsubscribed</h1>
        <p className="text-muted-foreground text-sm">
          <strong className="text-foreground">{email}</strong> won&apos;t receive our newsletters any more.
          You&apos;ll still get emails about your own bookings.
        </p>
        <p className="text-muted-foreground text-sm">已退订，之后不会再收到群发邮件。预约相关的邮件仍会照常发送。</p>
        <Link href="/" className="inline-block text-glow-cyan text-sm hover:underline">Back to INNER LIGHT</Link>
      </div>
    );
  }

  return (
    <div className={card}>
      <h1 className="font-display text-2xl text-foreground">Unsubscribe from newsletters?</h1>
      <p className="text-muted-foreground text-sm">
        Stop sending INNER LIGHT newsletters to <strong className="text-foreground break-all">{email}</strong>.
      </p>
      <p className="text-muted-foreground text-sm">确认后，这个邮箱将不再收到我们的群发邮件。</p>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <button
        type="button"
        onClick={confirm}
        disabled={state === 'sending'}
        className="w-full py-3 rounded-xl bg-glow-cyan/15 border border-glow-cyan/40 text-glow-cyan font-medium hover:bg-glow-cyan/25 disabled:opacity-60 transition-colors"
      >
        {state === 'sending' ? 'Unsubscribing…' : 'Unsubscribe / 确认退订'}
      </button>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 bg-background">
      <Suspense fallback={null}>
        <UnsubscribeContent />
      </Suspense>
    </div>
  );
}
