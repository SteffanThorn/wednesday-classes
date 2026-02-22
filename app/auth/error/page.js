'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import FloatingParticles from '@/components/FloatingParticle';
import Header from '@/components/Header';
import { AlertCircle, ArrowLeft } from 'lucide-react';

const ErrorPage = () => {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  useEffect(() => {
    console.error('Auth error:', error);
  }, [error]);

  const getErrorMessage = (error) => {
    switch (error) {
      case 'Configuration':
        return 'There is a problem with the server configuration.';
      case 'Credentials':
        return 'Invalid email or password. Please try again.';
      case 'AccessDenied':
        return 'You do not have permission to access this resource.';
      case 'Verification':
        return 'Your verification link has expired or has already been used.';
      default:
        return 'An unexpected error occurred. Please try again.';
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
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 border border-red-500/30 
                           flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
              
              <h1 className="font-display text-4xl md:text-5xl font-light text-glow-subtle mb-4">
                Oops!
              </h1>
              <p className="text-muted-foreground">
                {getErrorMessage(error)}
              </p>
            </div>

            <div className="p-8 rounded-3xl border border-glow-cyan/20 bg-card/60 backdrop-blur-sm 
                          animate-fade-in-up animation-delay-200">
              {error === 'Configuration' ? (
                <div className="space-y-4">
                  <p className="text-muted-foreground text-sm">
                    The authentication system needs to be configured. This is usually a server configuration issue.
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Please contact the administrator or try again later.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-muted-foreground text-sm">
                    Please check your credentials and try again, or use the forgot password option.
                  </p>
                </div>
              )}

              <div className="mt-6 flex flex-col gap-3">
                <Link
                  href="/auth/signin"
                  className="w-full py-3 px-6 rounded-xl bg-glow-cyan/20 border border-glow-cyan/40 
                           text-glow-cyan font-medium hover:bg-glow-cyan/30 hover:box-glow
                           transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Sign In
                </Link>
                
                <Link
                  href="/auth/forgot-password"
                  className="w-full py-3 px-6 rounded-xl bg-muted/20 border border-border/40 
                           text-muted-foreground font-medium hover:bg-muted/40 
                           transition-all duration-300 text-center"
                >
                  Forgot Password?
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;

