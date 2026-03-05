'use client';

import FloatingParticles from '@/components/FloatingParticle';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import ClassCard from '@/components/ClassCard';
import { Zap, Heart, Sun } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useState } from 'react';

const ClassesPage = () => {
  const { t, mounted } = useLanguage();
  const [isWaitlistLoading, setIsWaitlistLoading] = useState(false);
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [waitlistMessage, setWaitlistMessage] = useState('');

  const handleWaitlistSubmit = async (e) => {
    e.preventDefault();
    setIsWaitlistLoading(true);
    setWaitlistMessage('');

    try {
      const response = await fetch('/api/motherscope/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: waitlistEmail })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to join waitlist');
      }

      setWaitlistMessage('Success! Check your email for next steps.');
      setWaitlistEmail('');
    } catch (err) {
      setWaitlistMessage(err.message || 'Error joining waitlist. Please try again.');
    } finally {
      setIsWaitlistLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <FloatingParticles />
      
      <div className="relative z-10">
        <Header />
        
        {/* Hero Section */}
        <HeroSection
          titleEn="Classes"
          titleZh="课程"
          subtitleEn="Book A Class That Suits You"
          subtitleZh="预订适合您的课程"
        />

        {/* Classes Section */}
        <section className="px-6 py-16">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Beginner Yoga - Wednesday */}
              <ClassCard
                icon={Zap}
                titleEn="Beginner Yoga"
                titleZh="初级瑜伽"
                descriptionEn="6pm Every Wednesday"
                descriptionZh="每周三晚上6点"
                duration="60 min"
                level="Beginner"
                price="$15/class"
                additionalInfo="B.Y.O mat"
                href="/book-classes"
              />

              {/* Beginner Yoga - Thursday */}
              <ClassCard
                icon={Sun}
                titleEn="Beginner Yoga"
                titleZh="初级瑜伽"
                descriptionEn="12pm Every Thursday"
                descriptionZh="每周四中午12点"
                duration="60 min"
                level="Beginner"
                price="$15/class"
                additionalInfo="B.Y.O mat"
                href="/book-classes"
              />

              {/* Motherscope - Waitlist */}
              <div className="p-6 rounded-3xl border border-glow-purple/30 bg-card/60 backdrop-blur-sm hover:box-glow transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-glow-purple/20 to-glow-cyan/20 flex items-center justify-center">
                    <Heart className="w-6 h-6 text-glow-purple" />
                  </div>
                  <h3 className="font-display text-2xl text-glow-subtle">Motherscope</h3>
                </div>
                
                <div className="space-y-4 mb-6">
                  <p className="text-muted-foreground">Many mothers experience a range of side effects including:</p>
                  <ul className="space-y-2 text-muted-foreground ml-4">
                    <li>• Pelvic discomfort</li>
                    <li>• Core weakness</li>
                    <li>• Urinary leakage</li>
                  </ul>
                  <p className="text-foreground">But these are common and treatable with the right support.</p>
                  <p className="text-foreground">Yoga helps you re-awaken the deep core muscles and rebuild stability & safety.</p>
                </div>
                
                {/* Waitlist Form */}
                <form onSubmit={handleWaitlistSubmit} className="space-y-3">
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={waitlistEmail}
                    onChange={(e) => setWaitlistEmail(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-background border border-glow-cyan/30 text-foreground 
                             placeholder-muted-foreground focus:outline-none focus:border-glow-cyan/60 transition-colors"
                    required
                  />
                  <button
                    type="submit"
                    disabled={isWaitlistLoading || !waitlistEmail.trim()}
                    className="w-full py-3 px-6 rounded-xl bg-glow-purple/20 border border-glow-purple/40 
                             text-glow-purple font-medium hover:bg-glow-purple/30 hover:box-glow 
                             transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isWaitlistLoading ? 'Sending...' : 'Join the Waitlist'}
                  </button>
                  {waitlistMessage && (
                    <p className={`text-sm text-center ${
                      waitlistMessage.includes('Success') 
                        ? 'text-glow-cyan' 
                        : 'text-red-500'
                    }`}>
                      {waitlistMessage}
                    </p>
                  )}
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative z-10 py-12 px-6 border-t border-border/30">
          <div className="max-w-7xl mx-auto text-center">
            <p className="mt-2 text-xs text-muted-foreground/60">
              {mounted ? t('footerMotto') : 'Breathe deeply. Move gently. Live fully.'}
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default ClassesPage;

