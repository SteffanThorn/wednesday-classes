'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import FloatingParticles from '@/components/FloatingParticle';
import Header from '@/components/Header';
import { AlertCircle, ArrowLeft } from 'lucide-react';

const ErrorContent = () => {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const getErrorMessage = (error) => {
    switch (error) {
      case 'Configuration':
        return 'There is a problem with the server configuration. Please contact the administrator.';
      case 'CredentialsSignin':
        return 'Invalid email or password. Please try again.';
      case 'AccessDenied':
        return 'Access denied. You do not have permission to access this resource.';
      case 'Verification':
        return 'The verification link has expired or has already been used.';
      default:
        return 'An unexpected error occurred. Please try again later.';
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <FloatingParticles />
      
      <div className="relative z-10">
        <Header />
        
        <div className="flex items-center justify-center min-h-[80vh] px-6">
          <div className="max-w-md w-full">
            <div className="p-8 rounded-3xl border border-red-500/30 bg-card/60 backdrop-blur-sm">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 
                              flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-red-400" />
                </div>
                <h1 className="font-display text-2xl text-red-400 mb-2">
                  Authentication Error
                </h1>
              </div>

              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 mb-6">
                <p className="text-red-300 text-sm">
                  {getErrorMessage(error)}
                </p>
              </div>

              {error === 'Configuration' && (
                <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30 mb-6">
                  <p className="text-yellow-300 text-sm">
                    <strong>Server Configuration Issue:</strong><br/>
                    Please ensure the following environment variables are set:
                  </p>
                  <ul className="text-yellow-300 text-sm mt-2 ml-4 list-disc">
                    <li>NEXTAUTH_SECRET</li>
                    <li>NEXTAUTH_URL</li>
                    <li>MONGODB_URI</li>
                  </ul>
                </div>
              )}

              <div className="flex flex-col gap-3">
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
                  href="/"
                  className="w-full py-3 px-6 rounded-xl bg-card/50 border border-glow-cyan/20 
                           text-muted-foreground font-medium hover:bg-card/80
                           transition-all duration-300 text-center"
                >
                  Go to Home Page
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ErrorPage = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen relative overflow-hidden">
        <FloatingParticles />
        <div className="relative z-10">
          <Header />
          <div className="flex items-center justify-center min-h-[80vh]">
            <div className="flex items-center gap-3 text-glow-cyan">
              <span className="w-8 h-8 border-2 border-glow-cyan/30 border-t-glow-cyan rounded-full animate-spin" />
              <span>Loading...</span>
            </div>
          </div>
        </div>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  );
};

export default ErrorPage;

