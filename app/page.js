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
                href="/survey"
                className="px-8 py-3 rounded-full border border-glow-purple/30 text-glow-subtle
                           hover:bg-glow-purple/10 hover:border-glow-purple/50 transition-all duration-300"
              >
                {language === 'zh' ? '新学员问卷' : 'New Student Survey'}
              </Link>

              <Link
                href="/blog"
                className="px-8 py-3 rounded-full border border-glow-purple/30 text-glow-subtle
                           hover:bg-glow-purple/10 hover:border-glow-purple/50 transition-all duration-300"
              >
                {language === 'zh' ? '阅读 Blog' : 'Read the Blog'}
              </Link>

              <Link
                href="/energy-assessment"
                className="px-8 py-3 rounded-full border border-glow-cyan/30 text-glow-subtle
                           hover:bg-glow-cyan/10 hover:border-glow-cyan/50 transition-all duration-300"
              >
                {language === 'zh' ? '身体能量测试' : 'Body Energy Test'}
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

        {/* Teaching Philosophy Section */}
        <section className="px-6 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-display text-3xl md:text-4xl text-glow-subtle mb-4 animate-fade-in-up">
              {language === 'zh' ? '教学理念' : 'Teaching Philosophy'}
            </h2>

            <div className="mb-10 flex items-center justify-center gap-4 animate-fade-in-up">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-glow-purple/50" />
              <div className="w-1.5 h-1.5 rounded-full bg-glow-purple animate-pulse-glow" />
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-glow-purple/50" />
            </div>

            <p className="text-muted-foreground leading-loose whitespace-pre-line text-left md:text-center animate-fade-in-up">
              {language === 'zh'
                ? `八年前，我曾以为，那次受伤会结束我的瑜伽之路。

但现在回头看，我才发现：

它并没有结束我的路。

它只是让我走向了另一条路。

它让我开始更深入地理解身体。

教会我更加认真地倾听身体，
教会我耐心，
也教会我如何与身体合作，而不是不断地与它对抗。

而最终，这段经历也让我拥有了更多的知识和经验，去帮助其他人重新找回属于自己的身体和运动能力。

今天，当我带领大家练习瑜伽和身体运动时，我想教给你的，从来不只是如何完成一个体式。

我更希望你能够真正理解自己的身体。

去感受，哪里需要释放。
去觉察，哪里需要更多的稳定。
去重建身体所需要的力量。
去重新建立呼吸、动作与身体之间更深的连接。

因为我相信，真正的疗愈，并不是不断要求身体做得更多。

而是通过觉察、安全感、力量与信任，让身体拥有重新学习运动的空间。

也许，这就是我的伤痛最终教会我的事情：

有时候，那段曾经让我们觉得自己"坏掉了"的经历，最终会变成我们帮助别人疗愈的力量。

我不教你忽略身体，强迫自己去完成动作。

我希望教你倾听身体、理解身体，并与身体一起运动。

这，就是 Inner Light 的核心——
倾听身体。
理解身体。
与身体一起运动。`
                : `Eight years ago, I thought that injury would end my yoga journey.

But looking back now, I realize:

It didn't end my path.

It simply led me onto another one.

It made me understand the body more deeply.

It taught me to listen to my body more carefully,
taught me patience,
and taught me how to work with my body — instead of constantly fighting against it.

And in the end, that experience gave me the knowledge and skill to help others reclaim their own bodies and their capacity to move.

Today, when I guide you through yoga and movement, what I want to teach you was never just how to complete a pose.

What I truly hope is that you come to understand your own body.

To feel where you need to release.
To sense where you need more stability.
To rebuild the strength your body needs.
To reconnect breath, movement, and body more deeply.

Because I believe true healing isn't about demanding more and more from the body.

It's about giving the body room to relearn movement — through awareness, safety, strength, and trust.

Perhaps that is what my injury ultimately taught me:

Sometimes, the experience that once made us feel "broken" becomes the very thing that lets us help others heal.

I don't teach you to ignore your body, or force it through movements.

I want to teach you to listen to your body, understand it, and move together with it.

This is the heart of Inner Light —
Listen to the body.
Understand the body.
Move with the body.`}
            </p>

            {/* Links to Yuki's personal injury-to-therapist story on the blog */}
            <div className="mt-10 animate-fade-in-up">
              <Link
                href="/blog/1788389234891"
                className="inline-flex items-center px-6 py-3 rounded-full bg-glow-purple/10 border border-glow-purple/30 text-glow-subtle hover:bg-glow-purple/20 transition-all duration-300"
              >
                {language === 'zh' ? '阅读我的完整故事 →' : 'Read My Full Story →'}
              </Link>
            </div>
          </div>
        </section>

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
            <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground/80">
              <span>Email: <a href="mailto:innerlightyuki@gmail.com" className="hover:text-glow-cyan transition-colors duration-200">innerlightyuki@gmail.com</a></span>
              <span className="text-muted-foreground/30">·</span>
              <span>Phone: <a href="tel:02108005679" className="hover:text-glow-cyan transition-colors duration-200">021 080 05679</a></span>
            </div>
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

