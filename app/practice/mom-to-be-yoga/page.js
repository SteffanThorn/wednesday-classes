'use client';

import FloatingParticles from '@/components/FloatingParticle';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import { useLanguage } from '@/hooks/useLanguage';

const MomToBeYogaPage = () => {
  const { t, mounted } = useLanguage();

  const getText = (key, fallback) => {
    return mounted && t(key) !== key ? t(key) : fallback;
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <FloatingParticles />
      
      <div className="relative z-10">
        <Header />
        
        {/* Hero Section */}
        <HeroSection
          titleEn="Energy Ring Yoga"
          titleZh="能量环瑜伽"
          subtitleEn="A transformative practice using energy rings to activate your body's energy centers and promote holistic healing."
          subtitleZh="使用能量环激活身体能量中心，促进整体疗愈的变革性练习。"
        />

        {/* Content Section */}
        <section className="px-6 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="p-8 rounded-3xl bg-gradient-to-br from-glow-teal/10 to-glow-cyan/10 
                          border border-glow-teal/20 animate-fade-in-up">
              <h2 className="font-display text-3xl md:text-4xl text-glow-subtle mb-6">
                {getText('energyRingJourney', 'Activate Your Inner Energy')}
              </h2>
              <div className="space-y-6 text-muted-foreground leading-relaxed">
                <p className="animate-fade-in-up animation-delay-200">
                  {getText('energyRingDesc1', 'Energy Ring Yoga is an innovative practice that combines traditional yoga poses with specialized energy rings designed to activate and balance your body\'s energy centers. This unique approach helps you connect with your inner vitality and promote healing on all levels.')}
                </p>
                <p className="animate-fade-in-up animation-delay-400">
                  {getText('energyRingDesc2', 'The energy rings work with your body\'s natural energy flow, helping to release blockages, strengthen the immune system, and enhance overall well-being. Through gentle movement and conscious breathing, you will experience a deeper connection with yourself.')}
                </p>
                <p className="animate-fade-in-up animation-delay-600">
                  {getText('energyRingDesc3', 'Our experienced instructors will guide you through practices that help you harness the power of your energy centers, promoting physical strength, mental clarity, and emotional balance.')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="px-6 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-glow-cyan/10 to-glow-purple/10 
                            border border-glow-cyan/20 animate-fade-in-up">
                <h3 className="text-xl font-medium text-glow-cyan mb-3">
                  {getText('energyBalance', 'Energy Balance')}
                </h3>
                <p className="text-muted-foreground">
                  {getText('energyBalanceDesc', 'Activate and harmonize your body\'s energy centers for optimal vitality.')}
                </p>
              </div>
              <div className="p-6 rounded-2xl bg-gradient-to-br from-glow-purple/10 to-glow-teal/10 
                            border border-glow-purple/20 animate-fade-in-up animation-delay-200">
                <h3 className="text-xl font-medium text-glow-purple mb-3">
                  {getText('physicalStrength', 'Physical Strength')}
                </h3>
                <p className="text-muted-foreground">
                  {getText('physicalStrengthDesc', 'Build core strength and flexibility while working with the energy rings.')}
                </p>
              </div>
              <div className="p-6 rounded-2xl bg-gradient-to-br from-glow-teal/10 to-glow-cyan/10 
                            border border-glow-teal/20 animate-fade-in-up animation-delay-400">
                <h3 className="text-xl font-medium text-glow-teal mb-3">
                  {getText('mentalClarity', 'Mental Clarity')}
                </h3>
                <p className="text-muted-foreground">
                  {getText('mentalClarityDesc', 'Clear mental fog and find inner peace through focused breathing.')}
                </p>
              </div>
              <div className="p-6 rounded-2xl bg-gradient-to-br from-glow-cyan/10 to-glow-teal/10 
                            border border-glow-cyan/20 animate-fade-in-up animation-delay-600">
                <h3 className="text-xl font-medium text-glow-cyan mb-3">
                  {getText('emotionalHealing', 'Emotional Healing')}
                </h3>
                <p className="text-muted-foreground">
                  {getText('emotionalHealingDesc', 'Release emotional blockages and cultivate inner harmony.')}
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
                {getText('beginEnergyJourney', 'Begin Your Energy Journey')}
              </h2>
              <p className="text-muted-foreground mb-6">
                {getText('energyRingCtaDesc', 'Discover the transformative power of Energy Ring Yoga and unlock your body\'s natural healing abilities.')}
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

export default MomToBeYogaPage;
