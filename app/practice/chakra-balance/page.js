'use client';

import FloatingParticles from '@/components/FloatingParticle';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import { useLanguage } from '@/hooks/useLanguage';

const ChakraBalancePage = () => {
  const { t, mounted } = useLanguage();

  return (
    <div className="min-h-screen relative overflow-hidden">
      <FloatingParticles />
      
      <div className="relative z-10">
        <Header />
        
        {/* Hero Section */}
        <HeroSection
          titleEn="Chakra Balance"
          titleZh="脉轮平衡"
          subtitleEn="Restore natural energy flow and harmony within your body's interconnected systems."
          subtitleZh="恢复身体相互关联系统内的自然能量流动与和谐。"
        />

        {/* Content Section */}
        <section className="px-6 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="p-8 rounded-3xl bg-gradient-to-br from-glow-teal/10 to-glow-cyan/10 
                          border border-glow-teal/20 animate-fade-in-up">
              <h2 className="font-display text-3xl md:text-4xl text-glow-subtle mb-6">
                {mounted ? t('energyHarmony') : 'Energy Harmony & Balance'}
              </h2>
              <div className="space-y-6 text-muted-foreground leading-relaxed">
                <p className="animate-fade-in-up animation-delay-200">
                  {mounted ? t('chakraDesc1') : 'Chakras are energy centers within our body that influence our physical, emotional, and spiritual well-being. When these energy centers are balanced and open, we experience vitality, clarity, and inner peace.'}
                </p>
                <p className="animate-fade-in-up animation-delay-400">
                  {mounted ? t('chakraDesc2') : 'Through specific yoga postures, breathing exercises, and meditation techniques, we can clear blockages and restore the natural flow of energy through each chakra. This process supports healing on all levels - physical, mental, and spiritual.'}
                </p>
                <p className="animate-fade-in-up animation-delay-600">
                  {mounted ? t('chakraDesc3') : 'Our chakra balancing sessions will guide you through practices designed to activate and align your energy centers, helping you reconnect with your inner wisdom and natural state of harmony.'}
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
                {mounted ? t('restoreBalance') : 'Restore Your Energy Balance'}
              </h2>
              <p className="text-muted-foreground mb-6">
                {mounted ? t('chakraCtaDesc') : 'Experience the transformative power of balanced energy. Book a session to begin your journey to inner harmony.'}
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

export default ChakraBalancePage;
