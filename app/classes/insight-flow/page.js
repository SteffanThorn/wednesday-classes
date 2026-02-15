'use client';

import FloatingParticles from '@/components/FloatingParticle';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import { useLanguage } from '@/hooks/useLanguage';

const InsightFlowPage = () => {
  const { t, mounted } = useLanguage();

  return (
    <div className="min-h-screen relative overflow-hidden">
      <FloatingParticles />
      
      <div className="relative z-10">
        <Header />
        
        {/* Hero Section */}
        <HeroSection
          titleEn="Insight Flow"
          titleZh="内观流"
          subtitleEn="A dynamic yoga practice that synchronizes movement with breath, cultivating inner awareness and fluid energy."
          subtitleZh="一种动态的瑜伽练习，将运动与呼吸同步，培养内在觉知和流畅的能量。"
        />

        {/* Content Section */}
        <section className="px-6 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="p-8 rounded-3xl bg-gradient-to-br from-glow-teal/10 to-glow-cyan/10 
                          border border-glow-teal/20 animate-fade-in-up">
              <h2 className="font-display text-3xl md:text-4xl text-glow-subtle mb-6">
                {mounted ? t('flowWithin') : 'Flow Within, Transform Without'}
              </h2>
              <div className="space-y-6 text-muted-foreground leading-relaxed">
                <p className="animate-fade-in-up animation-delay-200">
                  {mounted ? t('insightFlowDesc1') : 'Insight Flow is a dynamic style of yoga that emphasizes the connection between breath and movement. This practice creates a moving meditation, allowing you to explore the depths of your being while building strength, flexibility, and endurance.'}
                </p>
                <p className="animate-fade-in-up animation-delay-400">
                  {mounted ? t('insightFlowDesc2') : 'As you move through the sequence, you will develop a heightened awareness of your body\'s sensations and the energy flowing within. This mindful movement helps release tension, clear mental clutter, and create a sense of inner peace.'}
                </p>
                <p className="animate-fade-in-up animation-delay-600">
                  {mounted ? t('insightFlowDesc3') : 'Whether you are an experienced practitioner or new to yoga, Insight Flow offers a challenging yet accessible practice that will leave you feeling energized, centered, and deeply connected to yourself.'}
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
                {mounted ? t('startFlowing') : 'Start Your Flow'}
              </h2>
              <p className="text-muted-foreground mb-6">
                {mounted ? t('insightFlowCtaDesc') : 'Experience the transformative power of synchronized breath and movement in our Insight Flow classes.'}
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

export default InsightFlowPage;
