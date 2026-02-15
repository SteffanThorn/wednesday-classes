'use client';

import FloatingParticles from '@/components/FloatingParticle';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import { useLanguage } from '@/hooks/useLanguage';

const FullMoonCeremonyPage = () => {
  const { t, mounted } = useLanguage();

  return (
    <div className="min-h-screen relative overflow-hidden">
      <FloatingParticles />
      
      <div className="relative z-10">
        <Header />
        
        {/* Hero Section */}
        <HeroSection
          titleEn="Full Moon Ceremony"
          titleZh="满月仪式"
          subtitleEn="Honor the lunar cycle with a sacred ceremony designed for release, intention-setting, and community connection."
          subtitleZh="通过一个旨在释放、设定意图和社区连接的神圣仪式来庆祝月球周期。"
        />

        {/* Content Section */}
        <section className="px-6 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="p-8 rounded-3xl bg-gradient-to-br from-glow-teal/10 to-glow-cyan/10 
                          border border-glow-teal/20 animate-fade-in-up">
              <h2 className="font-display text-3xl md:text-4xl text-glow-subtle mb-6">
                {mounted ? t('lunarMagic') : 'Embrace the Lunar Energy'}
              </h2>
              <div className="space-y-6 text-muted-foreground leading-relaxed">
                <p className="animate-fade-in-up animation-delay-200">
                  {mounted ? t('fullMoonDesc1') : 'The full moon has been honored across cultures and throughout history as a time of heightened energy and spiritual significance. Our Full Moon Ceremonies are designed to help you harness this powerful lunar energy for personal transformation.'}
                </p>
                <p className="animate-fade-in-up animation-delay-400">
                  {mounted ? t('fullMoonDesc2') : 'During the ceremony, you will participate in guided meditations, chanting, and rituals that help release what no longer serves you and set powerful intentions for the cycle ahead. The energy of the group amplifies the effects of the practice.'}
                </p>
                <p className="animate-fade-in-up animation-delay-600">
                  {mounted ? t('fullMoonDesc3') : 'This is a time for community, connection, and celebration. Whether you come alone or with friends, you will leave feeling cleansed, renewed, and inspired for the weeks ahead.'}
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
                {mounted ? t('joinCeremony') : 'Join the Ceremony'}
              </h2>
              <p className="text-muted-foreground mb-6">
                {mounted ? t('fullMoonCtaDesc') : 'Experience the magic of the full moon in community and begin your transformation.'}
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

export default FullMoonCeremonyPage;
