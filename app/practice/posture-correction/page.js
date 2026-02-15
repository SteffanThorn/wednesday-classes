'use client';

import FloatingParticles from '@/components/FloatingParticle';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import { useLanguage } from '@/hooks/useLanguage';

const PostureCorrectionPage = () => {
  const { t, mounted } = useLanguage();

  return (
    <div className="min-h-screen relative overflow-hidden">
      <FloatingParticles />
      
      <div className="relative z-10">
        <Header />
        
        {/* Hero Section */}
        <HeroSection
          titleEn="Posture Correction"
          titleZh="体态矫正"
          subtitleEn="Strengthen core muscles and realign spine for improved posture and reduced pain."
          subtitleZh="强化核心肌肉和脊柱排列，改善姿势并减少疼痛。"
        />

        {/* Content Section */}
        <section className="px-6 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="p-8 rounded-3xl bg-gradient-to-br from-glow-teal/10 to-glow-cyan/10 
                          border border-glow-teal/20 animate-fade-in-up">
              <h2 className="font-display text-3xl md:text-4xl text-glow-subtle mb-6">
                {mounted ? t('standTall') : 'Stand Tall & Live Pain-Free'}
              </h2>
              <div className="space-y-6 text-muted-foreground leading-relaxed">
                <p className="animate-fade-in-up animation-delay-200">
                  {mounted ? t('postureDesc1') : 'Poor posture can lead to chronic pain, reduced mobility, and decreased energy. Our posture correction program addresses the root causes of misalignment through targeted exercises and mindful movement practices.'}
                </p>
                <p className="animate-fade-in-up animation-delay-400">
                  {mounted ? t('postureDesc2') : 'Through a combination of strengthening exercises, flexibility work, and body awareness training, you will learn to release tension, strengthen weak muscles, and establish new patterns of movement that support optimal spinal alignment.'}
                </p>
                <p className="animate-fade-in-up animation-delay-600">
                  {mounted ? t('postureDesc3') : 'Our holistic approach considers the entire body as an interconnected system, addressing not just symptoms but the underlying imbalances that contribute to poor posture and pain.'}
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
                {mounted ? t('transformYourPosture') : 'Transform Your Posture'}
              </h2>
              <p className="text-muted-foreground mb-6">
                {mounted ? t('postureCtaDesc') : 'Experience the freedom of standing tall and living without pain. Start your transformation today.'}
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

export default PostureCorrectionPage;
