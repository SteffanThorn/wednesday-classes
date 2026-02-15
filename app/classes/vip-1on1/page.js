'use client';

import FloatingParticles from '@/components/FloatingParticle';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import { useLanguage } from '@/hooks/useLanguage';

const VIP1on1Page = () => {
  const { t, mounted } = useLanguage();

  return (
    <div className="min-h-screen relative overflow-hidden">
      <FloatingParticles />
      
      <div className="relative z-10">
        <Header />
        
        {/* Hero Section */}
        <HeroSection
          titleEn="VIP (1 on 1)"
          titleZh="私教课程"
          subtitleEn="Personalized yoga sessions tailored to your unique needs, goals, and level of experience."
          subtitleZh="根据您独特的需求、目标和经验水平量身定制的个性化瑜伽课程。"
        />

        {/* Content Section */}
        <section className="px-6 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="p-8 rounded-3xl bg-gradient-to-br from-glow-teal/10 to-glow-cyan/10 
                          border border-glow-teal/20 animate-fade-in-up">
              <h2 className="font-display text-3xl md:text-4xl text-glow-subtle mb-6">
                {mounted ? t('personalizedJourney') : 'Your Personalized Journey'}
              </h2>
              <div className="space-y-6 text-muted-foreground leading-relaxed">
                <p className="animate-fade-in-up animation-delay-200">
                  {mounted ? t('vipDesc1') : 'Our VIP (1 on 1) sessions offer the most personalized yoga experience possible. Each session is designed specifically for you, taking into account your unique body, goals, and aspirations. Whether you are a beginner or an experienced practitioner, you will receive individualized attention and guidance.'}
                </p>
                <p className="animate-fade-in-up animation-delay-400">
                  {mounted ? t('vipDesc2') : 'Your instructor will work with you to create a customized practice that addresses your specific needs - whether that is building strength, increasing flexibility, managing stress, recovering from injury, or deepening your spiritual practice.'}
                </p>
                <p className="animate-fade-in-up animation-delay-600">
                  {mounted ? t('vipDesc3') : 'The private setting allows for deeper exploration and faster progress. You will receive ongoing support, homework guidance, and the flexibility to practice at your own pace in a safe and supportive environment.'}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-6 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="p-8 rounded-3xl bg-gradient-to-br from-glow-purple/10 to-glow-cyan/10 
                          border border-glow-purple/20 box-glow-purple animate-fade-in-up">
              <h2 className="font-display text-3xl md:text-4xl text-glow-subtle mb-4">
                {mounted ? t('startVIP') : 'Begin Your VIP Journey'}
              </h2>
              <p className="text-muted-foreground mb-6">
                {mounted ? t('vipCtaDesc') : 'Experience the transformative power of personalized yoga instruction. Book your private session today.'}
              </p>
              <button className="px-8 py-3 rounded-full bg-glow-cyan/10 border border-glow-cyan/30 
                               text-glow-cyan font-medium hover:bg-glow-cyan/20 hover:box-glow
                               transition-all duration-300">
                {mounted ? t('bookFreeConsultation') : 'Book Free Consultation'}
              </button>
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

export default VIP1on1Page;
