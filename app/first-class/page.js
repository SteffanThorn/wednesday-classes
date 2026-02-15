'use client';

import FloatingParticles from '@/components/FloatingParticle';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import FirstClassBookingForm from '@/components/FirstClassBookingForm';
import { Heart, Star, Zap, Sun, ArrowRight, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

const FirstClassPage = () => {
  const { t, mounted, language } = useLanguage();

  const benefits = [
    {
      icon: Heart,
      titleEn: 'Supportive Environment',
      titleZh: '支持性环境',
      descEn: 'Beginners welcome. No experience needed. All bodies celebrated.',
      descZh: '初学者欢迎。无需经验。尊重所有身体。',
    },
    {
      icon: Star,
      titleEn: 'Experienced Guide',
      titleZh: '经验丰富的导师',
      descEn: 'Yuki has guided hundreds of beginners to find their inner light.',
      descZh: 'Yuki已帮助数百名初学者找到内心的光芒。',
    },
    {
      icon: Zap,
      titleEn: 'Gentle Approach',
      titleZh: '温和的方式',
      descEn: 'Classes that honor your unique pace and journey.',
      descZh: '尊重您独特节奏和旅程的课程。',
    },
  ];

  const whatToExpect = [
    {
      titleEn: 'What to Bring',
      titleZh: '需要带什么',
      descEn: 'Just yourself and comfortable clothing. We provide mats and props.',
      descZh: '只需带上您自己舒适的服装。我们提供瑜伽垫和道具。',
      icon: '🧘',
    },
    {
      titleEn: 'Arrival',
      titleZh: '到达时间',
      descEn: 'Arrive 10 minutes early to settle in and meet your instructor.',
      descZh: '提前10分钟到达，适应环境并认识您的老师。',
      icon: '⏰',
    },
    {
      titleEn: 'First Time',
      titleZh: '第一次上课',
      descEn: 'Tell us it\'s your first class so we can give you extra attention.',
      descZh: '告诉我们这是您的第一次课程，我们会给您额外的关注。',
      icon: '💫',
    },
  ];

  const testimonials = [
    {
      quoteEn: 'As someone who had never done yoga before, I felt so welcomed. Yuki\'s gentle guidance made everything approachable.',
      quoteZh: '作为一个以前从未做过瑜伽的人，我感到非常受欢迎。Yuki温和的指导让一切都变得平易近人。',
      name: 'Sarah M.',
      location: 'Auckland',
    },
    {
      quoteEn: 'The outdoor yoga session was magical. Perfect introduction to mindfulness practice.',
      quoteZh: '户外瑜伽课程真是太神奇了。正念练习的完美介绍。',
      name: 'James L.',
      location: 'Mount Eden',
    },
    {
      quoteEn: 'I was nervous about trying something new, but the supportive environment made it easy to begin my journey.',
      quoteZh: '我对尝试新事物感到紧张，但支持性的环境让我很容易开始我的旅程。',
      name: 'Emma T.',
      date: 'New Lynn',
    },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      <FloatingParticles />
      
      <div className="relative z-10">
        <Header />
        
        {/* Hero Section */}
        <HeroSection
          titleEn="Your First Class"
          titleZh="您的第一堂课"
          subtitleEn="Begin your mindfulness journey with us. A warm welcome awaits."
          subtitleZh="与我们一起开始您的正念之旅。我们热情欢迎您的到来。"
        />

        {/* Special Offer Banner */}
        <section className="px-6 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="p-6 rounded-3xl bg-gradient-to-r from-glow-cyan/10 via-glow-purple/10 to-glow-teal/10 
                          border border-glow-cyan/30 box-glow animate-fade-in-up">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-center md:text-left">
                  <h3 className="font-display text-2xl text-glow-subtle mb-2">
                    {mounted ? t('firstClassOffer') : 'First Class Special'}
                  </h3>
                  <p className="text-muted-foreground">
                    {mounted ? t('firstClassOfferDesc') : 'Try your first class for just $15 and receive a free consultation with Yuki.'}
                  </p>
                </div>
                <div className="text-center">
                  <div className="font-display text-5xl text-glow-cyan">$15</div>
                  <div className="text-sm text-muted-foreground">{mounted ? t('firstClass') : 'First Class'}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="px-6 py-16">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12 animate-fade-in-up">
              <h2 className="font-display text-4xl md:text-5xl font-light text-glow-subtle mb-4">
                {mounted ? t('whyChooseUs') : 'Why Start Here?'}
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {mounted ? t('whyChooseUsDesc') : 'A supportive space for your journey into mindfulness.'}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <div 
                    key={benefit.titleEn}
                    className="p-6 rounded-3xl border border-glow-cyan/20 bg-card/60 backdrop-blur-sm 
                             hover:border-glow-cyan/40 hover:box-glow transition-all duration-500
                             animate-fade-in-up"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-glow-cyan/30 to-glow-purple/30 
                                  flex items-center justify-center border border-glow-cyan/30 box-glow mb-4">
                      <Icon className="w-7 h-7 text-glow-cyan" />
                    </div>
                    <h3 className="font-display text-xl text-foreground mb-2">
                      {mounted ? (language === 'zh' ? benefit.titleZh : benefit.titleEn) : benefit.titleEn}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {mounted ? (language === 'zh' ? benefit.descZh : benefit.descEn) : benefit.descEn}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* What to Expect */}
        <section className="px-6 py-16 bg-card/30">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12 animate-fade-in-up">
              <h2 className="font-display text-4xl md:text-5xl font-light text-glow-subtle mb-4">
                {mounted ? t('whatToExpect') : 'What to Expect'}
              </h2>
              <p className="text-muted-foreground">
                {mounted ? t('whatToExpectDesc') : 'Your first visit made simple.'}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {whatToExpect.map((item, index) => (
                <div 
                  key={item.titleEn}
                  className="p-6 rounded-3xl border border-glow-purple/20 bg-card/60 backdrop-blur-sm 
                           hover:border-glow-purple/40 transition-all duration-500
                           animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <h3 className="font-display text-xl text-foreground mb-2">
                    {mounted ? (language === 'zh' ? item.titleZh : item.titleEn) : item.titleEn}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {mounted ? (language === 'zh' ? item.descZh : item.descEn) : item.descEn}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Booking Form */}
        <section className="px-6 py-16">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12 animate-fade-in-up">
              <h2 className="font-display text-4xl md:text-5xl font-light text-glow-subtle mb-4">
                {mounted ? t('bookingFormTitle') : 'Book Your First Class'}
              </h2>
            </div>

            <div className="p-8 rounded-3xl border border-glow-cyan/20 bg-card/60 backdrop-blur-sm 
                        animate-fade-in-up animation-delay-200">
              <FirstClassBookingForm />
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="px-6 py-16 bg-gradient-to-b from-transparent via-glow-purple/5 to-transparent">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12 animate-fade-in-up">
              <h2 className="font-display text-4xl md:text-5xl font-light text-glow-subtle mb-4">
                {mounted ? t('testimonialsFirstClass') : 'First Class Stories'}
              </h2>
              <p className="text-muted-foreground">
                {mounted ? t('testimonialsFirstClassSubtitle') : 'Hear from others who took their first step with us.'}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <div 
                  key={testimonial.name}
                  className="p-6 rounded-3xl border border-glow-cyan/20 bg-card/60 backdrop-blur-sm 
                           hover:border-glow-cyan/40 transition-all duration-500
                           animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex gap-1 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-4 h-4 text-glow-cyan fill-glow-cyan" />
                    ))}
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4 italic">
                    "{mounted ? (language === 'zh' ? testimonial.quoteZh : testimonial.quoteEn) : testimonial.quoteEn}"
                  </p>
                  <div>
                    <div className="font-medium text-foreground">{testimonial.name}</div>
                    <div className="text-xs text-muted-foreground">{testimonial.location}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="px-6 py-16 pb-24">
          <div className="max-w-3xl mx-auto text-center">
            <div className="p-8 rounded-3xl bg-gradient-to-br from-glow-purple/10 to-glow-cyan/10 
                          border border-glow-purple/20 box-glow-purple animate-fade-in-up">
              <h2 className="font-display text-3xl md:text-4xl text-glow-subtle mb-4">
                {mounted ? t('readyToBegin') : 'Ready to Begin?'}
              </h2>
              <p className="text-muted-foreground mb-6">
                {mounted ? t('readyToBeginDesc') : 'Book your first class and take the first step towards inner peace.'}
              </p>
              <a 
                href="#booking"
                className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-glow-cyan/10 border border-glow-cyan/30 
                         text-glow-cyan font-medium hover:bg-glow-cyan/20 hover:box-glow
                         transition-all duration-300"
              >
                {mounted ? t('bookNow') : 'Book Now'}
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </section>

        {/* Footer */}
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

export default FirstClassPage;

