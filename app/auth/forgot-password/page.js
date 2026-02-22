'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import FloatingParticles from '@/components/FloatingParticle';
import Header from '@/components/Header';
import { Mail, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';

const ForgotPasswordPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch('/api/auth/request-password-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process request');
      }

      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <FloatingParticles />
      
      <div className="relative z-10">
        <Header />
        
        <div className="flex items-center justify-center min-h-[80vh] px-6">
          <div className="max-w-md w-full">
            <div className="text-center mb-8 animate-fade-in-up">
              <h1 className="font-display text-4xl md:text-5xl font-light text-glow-subtle mb-4">
                Forgot Password?
              </h1>
              <p className="text-muted-foreground">
                No worries, we'll send you reset instructions
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
                  <h2 className="text-xl font-medium text-foreground mb-3">Check your email</h2>
                  <p className="text-muted-foreground mb-6">
                    We sent a password reset link to <br/>
                    <span className="text-foreground font-medium">{formData.email}</span>
                  </p>
                  <div className="p-4 rounded-xl bg-card/50 border border-glow-cyan/20">
                    <p className="text-sm text-muted-foreground">
                      Didn't receive the email? Check your spam filter, or{' '}
                      <button 
                        onClick={() => setSuccess(false)}
                        className="text-glow-cyan hover:text-glow-cyan/80 transition-colors"
                      >
                        try another email address
                      </button>
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
                    <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-card/50 border border-glow-cyan/20 
                                 focus:border-glow-cyan/50 focus:box-glow outline-none transition-all
                                 text-foreground placeholder:text-muted-foreground/50"
                        placeholder="Enter your email"
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
                        Sending...
                      </span>
                    ) : (
                      'Send Reset Link'
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
};

export default ForgotPasswordPage;

