'use client';

import FloatingParticles from '@/components/FloatingParticle';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import { useLanguage } from '@/hooks/useLanguage';

const MindfulnessClassPage = () => {
  const { t, mounted } = useLanguage();

  return (
    <div className="min-h-screen relative overflow-hidden">
      <FloatingParticles />
      
      <div className="relative z-10">
        <Header />
        
        {/* Hero Section */}
        <HeroSection
          titleEn="Mindfulness"
          titleZh="正念冥想"
          subtitleEn="Cultivate present-moment awareness and inner peace through guided meditation practices."
          subtitleZh="通过引导式冥想练习培养当下意识和内心平静。"
        />

        {/* Content Section */}
        <section className="px-6 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="p-8 rounded-3xl bg-gradient-to-br from-glow-teal/10 to-glow-cyan/10 
                          border border-glow-teal/20 animate-fade-in-up">
              <h2 className="font-display text-3xl md:text-4xl text-glow-subtle mb-6">
                {mounted ? t('peacefulPresence') : 'Cultivate Peaceful Presence'}
              </h2>
              <div className="space-y-6 text-muted-foreground leading-relaxed">
                <p className="animate-fade-in-up animation-delay-200">
                  {mounted ? t('mindfulnessClassDesc1') : 'Mindfulness meditation is the practice of deliberately bringing attention to the present moment without judgment. In our classes, you will learn various techniques to cultivate this awareness and integrate it into your daily life.'}
                </p>
                <p className="animate-fade-in-up animation-delay-400">
                  {mounted ? t('mindfulnessClassDesc2') : 'Through consistent practice, you will discover how to observe your thoughts and emotions without getting caught in them, creating space for clarity, calm, and compassionate self-understanding.'}
                </p>
                <p className="animate-fade-in-up animation-delay-600">
                  {mounted ? t('mindfulnessClassDesc3') : 'Our experienced instructors guide you through practices suitable for all levels, from beginners to experienced practitioners, helping you develop a sustainable meditation habit that supports your overall well-being.'}
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
                {mounted ? t('startMeditation') : 'Begin Your Meditation Practice'}
              </h2>
              <p className="text-muted-foreground mb-6">
                {mounted ? t('mindfulnessCtaDesc') : 'Join our mindfulness classes and discover the transformative power of being present.'}
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

export default MindfulnessClassPage;
