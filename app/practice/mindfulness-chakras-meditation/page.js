'use client';

import FloatingParticles from '@/components/FloatingParticle';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import { useLanguage } from '@/hooks/useLanguage';

const MindfulnessChakrasMeditationPage = () => {
  const { t, mounted } = useLanguage();

  return (
    <div className="min-h-screen relative overflow-hidden">
      <FloatingParticles />
      
      <div className="relative z-10">
        <Header />
        
        {/* Hero Section */}
        <HeroSection
          titleEn="Mindfulness, Chakras & Meditation"
          titleZh="正念、脉轮、冥想"
          subtitleEn="Explore the ancient and powerful connection between mind and body through professional breathing techniques."
          subtitleZh="探索古老而强大的身心连接，通过专业的呼吸技巧唤醒内在能量，脊柱运动释放深层紧张，脉轮清理平衡能量中心，配合深度冥想和催眠疗法。"
        />

        {/* Content Section */}
        <section className="px-6 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="p-8 rounded-3xl bg-gradient-to-br from-glow-teal/10 to-glow-cyan/10 
                          border border-glow-teal/20 animate-fade-in-up">
              <h2 className="font-display text-3xl md:text-4xl text-glow-subtle mb-6">
                {mounted ? t('discoverInnerPeace') : 'Discover Inner Peace'}
              </h2>
              <div className="space-y-6 text-muted-foreground leading-relaxed">
                <p className="animate-fade-in-up animation-delay-200">
                  {mounted ? t('mindfulnessDesc1') : 'Through guided breathing techniques, you will learn to calm the mind and restore inner peace. These practices have been refined over thousands of years and are proven to reduce stress and anxiety effectively.'}
                </p>
                <p className="animate-fade-in-up animation-delay-400">
                  {mounted ? t('mindfulnessDesc2') : 'Chakra balancing work helps clear energy blockages and restore harmony to your body\'s interconnected systems. When our chakras are aligned, we experience greater vitality, clarity, and emotional well-being.'}
                </p>
                <p className="animate-fade-in-up animation-delay-600">
                  {mounted ? t('mindfulnessDesc3') : 'Meditation and mindfulness practices allow you to meet your true self. Through consistent practice, you will develop a deeper understanding of your inner world and learn to live in harmony with your authentic nature.'}
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
                {mounted ? t('readyToBegin') : 'Ready to Begin Your Journey?'}
              </h2>
              <p className="text-muted-foreground mb-6">
                {mounted ? t('beginMindfulnessJourney') : 'Join us for a session and discover the transformative power of mindfulness, chakras, and meditation.'}
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

export default MindfulnessChakrasMeditationPage;
