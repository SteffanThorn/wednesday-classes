'use client';

import FloatingParticles from '@/components/FloatingParticle';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import { useLanguage } from '@/hooks/useLanguage';

const MomToBeMindfulnessPage = () => {
  const { t, mounted } = useLanguage();

  return (
    <div className="min-h-screen relative overflow-hidden">
      <FloatingParticles />
      
      <div className="relative z-10">
        <Header />
        
        {/* Hero Section */}
        <HeroSection
          titleEn="Mom-to-be Mindfulness"
          titleZh="孕妈妈正念练习"
          subtitleEn="A gentle practice combining mindfulness meditation with pregnancy-specific exercises for expecting mothers."
          subtitleZh="一种温和的练习，将正念冥想与针对孕期的特定练习相结合，服务于准妈妈们。"
        />

        {/* Content Section */}
        <section className="px-6 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="p-8 rounded-3xl bg-gradient-to-br from-glow-teal/10 to-glow-cyan/10 
                          border border-glow-teal/20 animate-fade-in-up">
              <h2 className="font-display text-3xl md:text-4xl text-glow-subtle mb-6">
                {mounted ? t('mindfulMotherhood') : 'Mindful Motherhood Journey'}
              </h2>
              <div className="space-y-6 text-muted-foreground leading-relaxed">
                <p className="animate-fade-in-up animation-delay-200">
                  {mounted ? t('momMindfulnessDesc1') : 'Pregnancy is a profound time of transformation, and practicing mindfulness can help you navigate this journey with greater ease, connection, and joy. Our Mom-to-be Mindfulness classes are specially designed for expectant mothers at all stages of pregnancy.'}
                </p>
                <p className="animate-fade-in-up animation-delay-400">
                  {mounted ? t('momMindfulnessDesc2') : 'Through gentle breathing exercises, guided visualizations, and body awareness practices, you will learn to connect deeply with your growing baby while nurturing yourself. These practices help reduce stress, anxiety, and pregnancy-related discomforts.'}
                </p>
                <p className="animate-fade-in-up animation-delay-600">
                  {mounted ? t('momMindfulnessDesc3') : 'You will also learn techniques that will serve you during labor and delivery, helping you stay calm and present during the birthing process. Connect with other expectant mothers in a supportive and nurturing environment.'}
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
                {mounted ? t('nurtureYourJourney') : 'Nurture Your Journey'}
              </h2>
              <p className="text-muted-foreground mb-6">
                {mounted ? t('momMindfulnessCtaDesc') : 'Join our Mom-to-be Mindfulness community and experience the benefits of practicing mindfulness during pregnancy.'}
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

export default MomToBeMindfulnessPage;
