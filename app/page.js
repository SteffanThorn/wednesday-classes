'use client';

// dynamic rendering for booking modal and user state
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import FloatingParticles from '@/components/FloatingParticle';
import Header from '@/components/Header';
import BookingModal from '@/components/BookingModal';
import YogaBenefitsColumn from '@/components/YogaBenefitsColumn';
import TeacherStoryColumn from '@/components/TeacherStoryColumn';
import ArticleSection from '@/components/ArticleSection';
// import TestimonialsColumn from '@/components/TestimonialsColumn'; // Temporarily disabled - confirming with students
import { useLanguage } from '@/hooks/useLanguage';

const Index = () => {
  const { language, t, mounted } = useLanguage();
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect logged-in users to the correct dashboard
  useEffect(() => {
    if (status === 'authenticated') {
      router.push(session?.user?.role === 'admin' ? '/admin' : '/dashboard');
    }
  }, [status, session, router]);

  // Show loading while checking session
  if (status === 'loading') {
    return (
      <div className="min-h-screen relative overflow-hidden">
        <FloatingParticles />
        <div className="relative z-10">
          <Header />
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex items-center gap-3 text-glow-cyan">
              <span className="w-8 h-8 border-2 border-glow-cyan/30 border-t-glow-cyan rounded-full animate-spin" />
              <span>Loading...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If not authenticated, show the landing page (redirect will happen for authenticated users)
  return (
    <div className="min-h-screen relative overflow-hidden">
      <FloatingParticles />
      
      <div className="relative z-10">
        <Header />
        
        {/* Hero Section */}
        <section className="px-6 pt-8 pb-4">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-light 
                         text-glow animate-fade-in-up">
              {language === 'zh' ? (
                <>
                  寻找你<span className="gradient-text">内心的光</span>
                </>
              ) : (
                <>
                  Find Your <span className="gradient-text">Inner Light</span>
                </>
              )}
            </h1>
            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto 
                        leading-relaxed animate-fade-in-up animation-delay-200">
              {mounted ? t('heroSubtitle') : 'Where ancient wisdom meets modern healing, discover the transformative power of mindful movement in the heart of New Zealand.'}
            </p>
            
            {/* Decorative divider */}
            <div className="mt-12 flex items-center justify-center gap-4 animate-fade-in-up animation-delay-400">
              <div className="h-px w-24 bg-gradient-to-r from-transparent to-glow-cyan/50" />
              <div className="w-2 h-2 rounded-full bg-glow-cyan animate-pulse-glow" />
              <div className="h-px w-24 bg-gradient-to-l from-transparent to-glow-cyan/50" />
            </div>

            {/* Book a Class CTA - opens booking modal with day selection */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 animate-fade-in-up animation-delay-500">
              <button
                type="button"
                onClick={() => setIsBookingModalOpen(true)}
                className="px-8 py-3 bg-gradient-to-r from-glow-cyan/20 to-glow-purple/20 
                             border border-glow-cyan/30 rounded-full text-foreground
                             hover:from-glow-cyan/30 hover:to-glow-purple/30 
                             hover:border-glow-cyan/50 transition-all duration-300
                             hover:shadow-lg hover:shadow-glow-cyan/20"
              >
                Book a Class
              </button>

              <Link
                href="/blog"
                className="px-8 py-3 rounded-full border border-glow-purple/30 text-glow-subtle
                           hover:bg-glow-purple/10 hover:border-glow-purple/50 transition-all duration-300"
              >
                {language === 'zh' ? '阅读 Blog' : 'Read the Blog'}
              </Link>
            </div>
          </div>
        </section>

        {/* Booking Modal for homepage CTA - supports day selection */}
        <BookingModal
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          classDetails={{
            name: 'Functional Integrative Yoga',
            date: '',
            time: '',
            location: 'Village Valley Centre, Ashhurst',
            price: 15
          }}
          language={mounted ? language : 'en'}
        />

        {/* Two Column Section */}
        <section className="px-6 py-16 md:py-24">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
              <YogaBenefitsColumn />
              <TeacherStoryColumn />
            </div>
          </div>
        </section>

        {/* Testimonials Section - Temporarily disabled */}
        {/* <TestimonialsColumn /> */}

        {/* Blog Section */}
        <section id="blog" className="px-6 py-8 md:py-16">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-4 animate-fade-in-up">
              <h2 className="font-display text-3xl md:text-4xl text-glow-subtle mb-3">
                {language === 'zh' ? 'Blog 博客' : 'Blog'}
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {language === 'zh'
                  ? '阅读最新的瑜伽、疗愈与身心平衡文章。'
                  : 'Read the latest reflections on yoga, healing, and mindful living.'}
              </p>
            </div>

            <ArticleSection
              title={language === 'zh' ? '最新文章' : 'Latest Posts'}
              maxItems={3}
              showEmptyState={true}
            />

            <div className="text-center mt-2">
              <Link
                href="/blog"
                className="inline-flex items-center px-6 py-3 rounded-full bg-glow-cyan/10 border border-glow-cyan/30 text-glow-cyan hover:bg-glow-cyan/20 transition-all duration-300"
              >
                {language === 'zh' ? '查看全部文章' : 'View all posts'}
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-6 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="p-8 rounded-3xl bg-gradient-to-br from-glow-purple/10 to-glow-cyan/10 
                          border border-glow-purple/20 box-glow-purple animate-fade-in-up">
              <h2 className="font-display text-3xl md:text-4xl text-glow-subtle mb-4">
                {mounted ? t('readyToBegin') : 'Ready to Begin?'}
              </h2>
              <p className="text-muted-foreground mb-6">
                {mounted ? t('readyToBeginDesc') : 'Book your first class and take the first step towards inner peace.'}
              </p>
              <button 
                onClick={() => setIsBookingModalOpen(true)}
                className="px-8 py-3 rounded-full bg-glow-cyan/10 border border-glow-cyan/30 
                               text-glow-cyan font-medium hover:bg-glow-cyan/20 hover:box-glow
                               transition-all duration-300 cursor-pointer">
                Book A Class
              </button>
            </div>
          </div>
        </section>

        {/* Footer accent */}
        <footer className="relative z-10 py-12 px-6 border-t border-border/30">
          <div className="max-w-7xl mx-auto text-center">
            <p className="text-sm text-muted-foreground">
              {mounted ? t('copyright') : '© 2026 INNER LIGHT · Auckland, New Zealand'}
            </p>
            <p className="mt-2 text-xs text-muted-foreground/60">
              {mounted ? t('footerMotto') : 'Breathe deeply. Move gently. Live fully.'}
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;

