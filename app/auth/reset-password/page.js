'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import FloatingParticles from '@/components/FloatingParticle';
import Header from '@/components/Header';
import { Lock, LockConfirm, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    // Validate that we have the required params
    if (!token || !email) {
      setValidationError('Invalid reset link. Please request a new password reset.');
      setIsValidating(false);
      return;
    }
    
    setIsValidating(false);
  }, [token, email]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const validatePassword = (pw) => {
    if (pw.length < 8) {
      return 'Password must be at least 8 characters';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate password strength
    const pwError = validatePassword(formData.password);
    if (pwError) {
      setError(pwError);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          token,
          newPassword: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password');
      }

      setSuccess(true);
      
      // Redirect to signin after a short delay
      setTimeout(() => {
        router.push('/auth/signin');
      }, 3000);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Loading state while validating URL params
  if (isValidating) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <FloatingParticles />
        <div className="relative z-10">
          <Header />
          <div className="flex items-center justify-center min-h-[80vh] px-6">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 border-4 border-glow-cyan/30 border-t-glow-cyan rounded-full animate-spin" />
              <p className="text-muted-foreground">Validating reset link...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Invalid link state
  if (validationError) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <FloatingParticles />
        <div className="relative z-10">
          <Header />
          <div className="flex items-center justify-center min-h-[80vh] px-6">
            <div className="max-w-md w-full">
              <div className="p-8 rounded-3xl border border-red-500/30 bg-card/60 backdrop-blur-sm text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/20 border border-red-500/40 
                             flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-red-400" />
                </div>
                <h2 className="text-xl font-medium text-foreground mb-3">Invalid Reset Link</h2>
                <p className="text-muted-foreground mb-6">
                  {validationError}
                </p>
                <Link 
                  href="/auth/forgot-password"
                  className="inline-flex items-center gap-2 text-glow-cyan hover:text-glow-cyan/80 
                           transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Request New Reset Link
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <FloatingParticles />
      
      <div className="relative z-10">
        <Header />
        
        <div className="flex items-center justify-center min-h-[80vh] px-6">
          <div className="max-w-md w-full">
            <div className="text-center mb-8 animate-fade-in-up">
              <h1 className="font-display text-4xl md:text-5xl font-light text-glow-subtle mb-4">
                Reset Password
              </h1>
              <p className="text-muted-foreground">
                Create a new password for your account
              </p>
            </div>

            <div className="p-8 rounded-3xl border border-glow-cyan/20 bg-card/60 backdrop-blur-sm 
                          animate-fade-in-up animation-delay-200">
              {success ? (
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-500/20 border border-green-500/40 
                               flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-green-400" />
                  </div>
                  <h2 className="text-xl font-medium text-foreground mb-3">Password Reset!</h2>
                  <p className="text-muted-foreground mb-6">
                    Your password has been reset successfully.
                  </p>
                  <div className="p-4 rounded-xl bg-card/50 border border-glow-cyan/20">
                    <p className="text-sm text-muted-foreground">
                      Redirecting you to sign in...
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {error && (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 
                                 flex items-center gap-3 text-red-400">
                      <AlertCircle className="w-5 h-5 shrink-0" />
                      <span className="text-sm">{error}</span>
                    </div>
                  )}

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        minLength={8}
                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-card/50 border border-glow-cyan/20 
                                 focus:border-glow-cyan/50 focus:box-glow outline-none transition-all
                                 text-foreground placeholder:text-muted-foreground/50"
                        placeholder="At least 8 characters"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <LockConfirm className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        minLength={8}
                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-card/50 border border-glow-cyan/20 
                                 focus:border-glow-cyan/50 focus:box-glow outline-none transition-all
                                 text-foreground placeholder:text-muted-foreground/50"
                        placeholder="Re-enter your password"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-6 rounded-xl bg-glow-cyan/20 border border-glow-cyan/40 
                             text-glow-cyan font-medium hover:bg-glow-cyan/30 hover:box-glow
                             transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
                             flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-5 h-5 border-2 border-glow-cyan/30 border-t-glow-cyan rounded-full animate-spin" />
                        Resetting...
                      </span>
                    ) : (
                      'Reset Password'
                    )}
                  </button>
                </form>
              )}

              <div className="mt-6 text-center">
                <Link 
                  href="/auth/signin"
                  className="inline-flex items-center gap-2 text-muted-foreground hover:text-glow-cyan 
                           transition-colors text-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Wrap with Suspense for useSearchParams
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen relative overflow-hidden">
        <FloatingParticles />
        <div className="relative z-10">
          <Header />
          <div className="flex items-center justify-center min-h-[80vh] px-6">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 border-4 border-glow-cyan/30 border-t-glow-cyan rounded-full animate-spin" />
              <p className="text-muted-foreground">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}

