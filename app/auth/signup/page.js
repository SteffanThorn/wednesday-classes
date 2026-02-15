'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import FloatingParticles from '@/components/FloatingParticle';
import Header from '@/components/Header';
import { Mail, Lock, User, Phone, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';

const SignupPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'An error occurred');
      }

      setSuccess(true);
      
      // Redirect to sign in after 2 seconds
      setTimeout(() => {
        router.push('/auth/signin');
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <FloatingParticles />
        <div className="relative z-10">
          <Header />
          <div className="flex items-center justify-center min-h-[60vh] px-6">
            <div className="max-w-md w-full text-center">
              <div className="p-8 rounded-3xl bg-gradient-to-br from-glow-cyan/20 to-glow-purple/20 
                            border border-glow-cyan/30 box-glow">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-glow-cyan/20 
                              flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-glow-cyan" />
                </div>
                <h2 className="font-display text-2xl text-glow-subtle mb-2">
                  Account Created!
                </h2>
                <p className="text-muted-foreground mb-4">
                  Your account has been created successfully. Redirecting to sign in...
                </p>
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
                Create Account
              </h1>
              <p className="text-muted-foreground">
                Join us for your yoga journey
              </p>
            </div>

            <div className="p-8 rounded-3xl border border-glow-cyan/20 bg-card/60 backdrop-blur-sm 
                          animate-fade-in-up animation-delay-200">
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 
                               flex items-center gap-3 text-red-400">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}

                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-4 py-3 rounded-xl bg-card/50 border border-glow-cyan/20 
                               focus:border-glow-cyan/50 focus:box-glow outline-none transition-all
                               text-foreground placeholder:text-muted-foreground/50"
                      placeholder="Your full name"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                    Email Address *
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
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3 rounded-xl bg-card/50 border border-glow-cyan/20 
                               focus:border-glow-cyan/50 focus:box-glow outline-none transition-all
                               text-foreground placeholder:text-muted-foreground/50"
                      placeholder="+64 27 123 4567"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                    Password *
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
                      Creating account...
                    </span>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-muted-foreground text-sm">
                  Already have an account?{' '}
                  <Link 
                    href="/auth/signin" 
                    className="text-glow-cyan hover:text-glow-cyan/80 transition-colors"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </div>

            <p className="mt-6 text-center text-xs text-muted-foreground/60">
              By creating an account, you agree to our{' '}
              <Link href="/privacy" className="text-glow-cyan hover:underline">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;

