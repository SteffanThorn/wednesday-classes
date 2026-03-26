'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, KeyRound, Eye, EyeOff, Check, AlertCircle } from 'lucide-react';

function AccountSetupInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [state, setState] = useState('loading'); // loading | ready | success | error
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [tokenError, setTokenError] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (!token) {
      setState('error');
      setTokenError('No token found. Please use the link sent to your email.');
      return;
    }

    fetch(`/api/account-setup?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setState('error');
          setTokenError(data.error);
        } else {
          setUserName(data.name);
          setUserEmail(data.email);
          setState('ready');
        }
      })
      .catch(() => {
        setState('error');
        setTokenError('Something went wrong. Please try again or contact your instructor.');
      });
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (password.length < 8) {
      setFormError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/account-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || 'Something went wrong.');
        return;
      }

      setState('success');
      // Give user a moment to see the success message, then go to health intake
      setTimeout(() => router.push('/health-intake'), 2000);
    } catch {
      setFormError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-xs tracking-[0.3em] text-glow-cyan/70 uppercase mb-2">Inner Light Yoga</p>
          <h1 className="font-display text-3xl text-glow-subtle mb-2">Set Up Your Account</h1>
        </div>

        {/* Loading */}
        {state === 'loading' && (
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin text-glow-cyan" />
            <p>Verifying your link…</p>
          </div>
        )}

        {/* Error */}
        {state === 'error' && (
          <div className="p-5 rounded-2xl bg-red-500/10 border border-red-500/20 text-center space-y-2">
            <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
            <p className="text-red-400">{tokenError}</p>
          </div>
        )}

        {/* Success */}
        {state === 'success' && (
          <div className="p-6 rounded-2xl bg-green-500/10 border border-green-500/20 text-center space-y-3">
            <div className="w-14 h-14 mx-auto rounded-full bg-green-500/20 flex items-center justify-center">
              <Check className="w-7 h-7 text-green-400" />
            </div>
            <h2 className="text-lg font-medium text-foreground">Password set!</h2>
            <p className="text-muted-foreground text-sm">
              Taking you to your health form…
            </p>
            <Loader2 className="w-5 h-5 animate-spin text-glow-cyan mx-auto" />
          </div>
        )}

        {/* Form */}
        {state === 'ready' && (
          <div className="p-6 rounded-3xl bg-card border border-glow-cyan/20 space-y-6">
            <div>
              <p className="text-sm text-muted-foreground">Welcome,</p>
              <p className="text-lg font-medium text-foreground">{userName}</p>
              <p className="text-sm text-muted-foreground">{userEmail}</p>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">
              Your instructor has created an account for you. Please choose a password to activate it — you'll then be asked to complete a short health form before your first class.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-muted-foreground mb-1">
                  <KeyRound className="w-3.5 h-3.5 inline mr-1" />
                  New password <span className="text-glow-cyan">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    placeholder="At least 8 characters"
                    className="w-full px-3 py-2 pr-10 rounded-xl bg-card/50 border border-glow-cyan/20 focus:border-glow-cyan/50 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-1">
                  Confirm password <span className="text-glow-cyan">*</span>
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Repeat your password"
                  className="w-full px-3 py-2 rounded-xl bg-card/50 border border-glow-cyan/20 focus:border-glow-cyan/50 focus:outline-none"
                />
              </div>

              {formError && (
                <p className="text-sm text-red-400">{formError}</p>
              )}

              <button
                type="submit"
                disabled={submitting || !password || !confirmPassword}
                className="w-full py-3 rounded-2xl bg-glow-cyan/10 border border-glow-cyan/30 text-glow-cyan font-medium
                           hover:bg-glow-cyan/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed
                           flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Setting password…</>
                ) : (
                  <><Check className="w-4 h-4" /> Activate my account</>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AccountSetupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-glow-cyan" />
      </div>
    }>
      <AccountSetupInner />
    </Suspense>
  );
}
