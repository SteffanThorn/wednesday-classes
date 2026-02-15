'use client';

import FloatingParticles from '@/components/FloatingParticle';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import { useLanguage } from '@/hooks/useLanguage';

const PainManagementPage = () => {
  const { t, mounted } = useLanguage();

  return (
    <div className="min-h-screen relative overflow-hidden">
      <FloatingParticles />
      
      <div className="relative z-10">
        <Header />
        
        {/* Hero Section */}
        <HeroSection
          titleEn="Pain Management"
          titleZh="疼痛管理"
          subtitleEn="A holistic approach to managing and relieving chronic pain through mindful movement and breathwork."
          subtitleZh="通过正念运动和呼吸练习，整体方法来管理和缓解慢性疼痛。"
        />

        {/* Content Section */}
        <section className="px-6 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="p-8 rounded-3xl bg-gradient-to-br from-glow-teal/10 to-glow-cyan/10 
                          border border-glow-teal/20 animate-fade-in-up">
              <h2 className="font-display text-3xl md:text-4xl text-glow-subtle mb-6">
                {mounted ? t('findRelief') : 'Find Relief & Restore Wellness'}
              </h2>
              <div className="space-y-6 text-muted-foreground leading-relaxed">
                <p className="animate-fade-in-up animation-delay-200">
                  {mounted ? t('painDesc1') : 'Chronic pain affects millions of people and can significantly impact quality of life. Our holistic approach to pain management combines ancient wisdom with modern understanding to help you find relief and reclaim your life.'}
                </p>
                <p className="animate-fade-in-up animation-delay-400">
                  {mounted ? t('painDesc2') : 'Through gentle yoga practices, breathwork, and mindfulness techniques, you will learn to release tension, improve circulation, and change your relationship with pain. These practices empower you to take an active role in your healing journey.'}
                </p>
                <p className="animate-fade-in-up animation-delay-600">
                  {mounted ? t('painDesc3') : 'We address pain holistically, considering the interconnected nature of body, mind, and spirit. Our experienced practitioners will work with you to develop a personalized plan that addresses your unique needs and goals.'}
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
                {mounted ? t('beginHealing') : 'Begin Your Healing Journey'}
              </h2>
              <p className="text-muted-foreground mb-6">
                {mounted ? t('painCtaDesc') : 'Discover how mindful movement can help you manage pain and restore your quality of life.'}
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

export default PainManagementPage;
