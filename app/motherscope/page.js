'use client';

import FloatingParticles from '@/components/FloatingParticle';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import { useLanguage } from '@/hooks/useLanguage';

const MotherscopePage = () => {
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
          titleEn="Motherscope"
          titleZh="孕妈探索"
          subtitleEn="A holistic journey of exploration and growth for mothers and mothers-to-be."
          subtitleZh="为准妈妈和新手妈妈提供探索与成长的整体旅程。"
        />

        {/* Content Section */}
        <section className="px-6 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="p-8 rounded-3xl bg-gradient-to-br from-glow-teal/10 to-glow-cyan/10 
                          border border-glow-teal/20 animate-fade-in-up">
              <h2 className="font-display text-3xl md:text-4xl text-glow-subtle mb-6">
                {getText('motherscopeJourney', 'Your Journey of Discovery')}
              </h2>
              <div className="space-y-6 text-muted-foreground leading-relaxed">
                <p className="animate-fade-in-up animation-delay-200">
                  {getText('motherscopeDesc1', 'Motherscope is a comprehensive platform designed to support women through every stage of their motherhood journey. From pregnancy to postpartum, we provide resources, community, and guidance for navigating the beautiful challenges of becoming a mother.')}
                </p>
                <p className="animate-fade-in-up animation-delay-400">
                  {getText('motherscopeDesc2', 'Our approach combines ancient wisdom with modern understanding, offering a holistic perspective on maternal health and well-being. Connect with other mothers, access expert advice, and discover tools for your personal growth.')}
                </p>
                <p className="animate-fade-in-up animation-delay-600">
                  {getText('motherscopeDesc3', 'Whether you are planning pregnancy, currently expecting, or navigating the postpartum period, Motherscope is here to support you with compassion and knowledge.')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="px-6 py-16">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-glow-cyan/10 to-glow-purple/10 
                            border border-glow-cyan/20 animate-fade-in-up">
                <div className="text-4xl mb-4">🤰</div>
                <h3 className="text-xl font-medium text-glow-cyan mb-3">
                  {getText('pregnancySupport', 'Pregnancy Support')}
                </h3>
                <p className="text-muted-foreground">
                  {getText('pregnancySupportDesc', 'Comprehensive resources for your pregnancy journey, from conception to birth.')}
                </p>
              </div>
              <div className="p-6 rounded-2xl bg-gradient-to-br from-glow-purple/10 to-glow-teal/10 
                            border border-glow-purple/20 animate-fade-in-up animation-delay-200">
                <div className="text-4xl mb-4">🧘</div>
                <h3 className="text-xl font-medium text-glow-purple mb-3">
                  {getText('mindfulnessPractices', 'Mindfulness Practices')}
                </h3>
                <p className="text-muted-foreground">
                  {getText('mindfulnessPracticesDesc', 'Gentle exercises and meditations designed for mothers at any stage.')}
                </p>
              </div>
              <div className="p-6 rounded-2xl bg-gradient-to-br from-glow-teal/10 to-glow-cyan/10 
                            border border-glow-teal/20 animate-fade-in-up animation-delay-400">
                <div className="text-4xl mb-4">👥</div>
                <h3 className="text-xl font-medium text-glow-teal mb-3">
                  {getText('communityConnection', 'Community Connection')}
                </h3>
                <p className="text-muted-foreground">
                  {getText('communityConnectionDesc', 'Connect with other mothers who understand your journey.')}
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
                {getText('beginMotherscopeJourney', 'Begin Your Motherscope Journey')}
              </h2>
              <p className="text-muted-foreground mb-6">
                {getText('motherscopeCtaDesc', 'Join our supportive community and discover the resources available for your motherhood journey.')}
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

export default MotherscopePage;
