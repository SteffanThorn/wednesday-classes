'use client';

import FloatingParticles from '@/components/FloatingParticle';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import { useLanguage } from '@/hooks/useLanguage';

const OutdoorYogaPage = () => {
  const { t, mounted } = useLanguage();

  return (
    <div className="min-h-screen relative overflow-hidden">
      <FloatingParticles />
      
      <div className="relative z-10">
        <Header />
        
        {/* Hero Section */}
        <HeroSection
          titleEn="Outdoor Yoga"
          titleZh="户外瑜伽"
          subtitleEn="Connect with nature while practicing yoga in beautiful outdoor settings."
          subtitleZh="在美丽的户外环境中练习瑜伽，与大自然连接。"
        />

        {/* Content Section */}
        <section className="px-6 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="p-8 rounded-3xl bg-gradient-to-br from-glow-teal/10 to-glow-cyan/10 
                          border border-glow-teal/20 animate-fade-in-up">
              <h2 className="font-display text-3xl md:text-4xl text-glow-subtle mb-6">
                {mounted ? t('naturePractice') : 'Yoga in Nature\'s Embrace'}
              </h2>
              <div className="space-y-6 text-muted-foreground leading-relaxed">
                <p className="animate-fade-in-up animation-delay-200">
                  {mounted ? t('outdoorYogaDesc1') : 'There is something magical about practicing yoga outdoors. The fresh air, natural light, and connection with the earth enhance the benefits of your practice and create a deeper sense of well-being.'}
                </p>
                <p className="animate-fade-in-up animation-delay-400">
                  {mounted ? t('outdoorYogaDesc2') : 'Our outdoor yoga sessions are held in carefully selected locations that offer both beauty and tranquility. Whether in a park, beach, or garden, you will experience yoga in a way that feels harmonious with the natural world.'}
                </p>
                <p className="animate-fade-in-up animation-delay-600">
                  {mounted ? t('outdoorYogaDesc3') : 'Practicing outdoors brings an extra dimension to your yoga practice, helping you feel more grounded, alive, and connected to the rhythms of nature. It is a wonderful way to combine exercise, meditation, and environmental connection.'}
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
                {mounted ? t('experienceOutdoors') : 'Experience Yoga Outdoors'}
              </h2>
              <p className="text-muted-foreground mb-6">
                {mounted ? t('outdoorYogaCtaDesc') : 'Join our outdoor yoga sessions and discover the joy of practicing in nature\'s playground.'}
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

export default OutdoorYogaPage;
