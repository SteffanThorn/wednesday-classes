'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import FloatingParticles from '@/components/FloatingParticle';
import Header from '@/components/Header';
import { Mail, Lock, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';

const SigninPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result.error) {
        throw new Error(result.error);
      }

      // Redirect to dashboard on success
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError(err.message || 'Invalid email or password');
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
                Welcome Back
              </h1>
              <p className="text-muted-foreground">
                Sign in to access your bookings
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
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                    Password
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
                      className="w-full pl-12 pr-4 py-3 rounded-xl bg-card/50 border border-glow-cyan/20 
                               focus:border-glow-cyan/50 focus:box-glow outline-none transition-all
                               text-foreground placeholder:text-muted-foreground/50"
                      placeholder="Your password"
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
                      Signing in...
                    </span>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-muted-foreground text-sm">
                  Don't have an account?{' '}
                  <Link 
                    href="/auth/signup" 
                    className="text-glow-cyan hover:text-glow-cyan/80 transition-colors"
                  >
                    Create one
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SigninPage;

