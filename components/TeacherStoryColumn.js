'use client';

import { MapPin, Compass, Sun } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

const TeacherStoryColumn = () => {
  const { t, mounted } = useLanguage();

  return (
    <div className="space-y-8">
      <div className="animate-fade-in-up animation-delay-200">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="w-4 h-4 text-warm-coral" />
          <span className="text-sm text-muted-foreground tracking-widest uppercase">
            {mounted ? t('fromShanghaiToAuckland') : 'From Shanghai to Auckland'}
          </span>
        </div>
        <h2 className="font-display text-4xl md:text-5xl font-light text-glow-subtle mb-4">
          {mounted ? t('journeyOfPurpose').split(' of ')[0] : 'A Journey'} of 
          <span className="gradient-text"> {mounted ? t('journeyOfPurpose').split(' of ')[1] || 'Purpose' : 'Purpose'}</span>
        </h2>
      </div>

      <div className="animate-fade-in-up animation-delay-400">
        <div className="relative">
          {/* Decorative glow behind image area */}
          <div className="absolute inset-0 bg-glow-cyan/10 rounded-3xl blur-2xl transform -rotate-3" />
          
          <div className="relative p-8 rounded-3xl border border-glow-cyan/20 bg-card/60 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-glow-cyan/30 to-glow-purple/30 
                            flex items-center justify-center border border-glow-cyan/30 box-glow">
                <Sun className="w-8 h-8 text-glow-cyan animate-pulse-glow" />
              </div>
              <div>
                <h3 className="font-display text-2xl text-foreground">
                  {mounted ? t('meiLin') : 'Mei Lin'}
                </h3>
                <p className="text-sm text-glow-cyan">
                  {mounted ? t('yogaTeacherHealer') : 'Yoga Teacher & Healer'}
                </p>
              </div>
            </div>

            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                {mounted ? t('meiLinStory1') : 'Growing up in a small village outside Shanghai, Mei Lin discovered the ancient art of movement through her grandmother\'s tai chi practices at dawn. Those quiet mornings, watching the mist rise over the rice paddies, planted seeds that would bloom decades later.'}
              </p>
              <p>
                {mounted ? t('meiLinStory2') : 'After years in the corporate world left her disconnected from her body and spirit, a chance encounter with a traveling yoga master reignited that childhood wonder. She dedicated herself to deep study, training in India and Thailand.'}
              </p>
              <p>
                {mounted ? t('meiLinStory3') : 'Now calling New Zealand home, Mei Lin weaves Eastern wisdom with modern understanding, helping others find their path back to wholeness—one breath at a time.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="animate-fade-in-up animation-delay-600">
        <div className="flex items-center gap-4 p-5 rounded-2xl border border-glow-teal/20 
                      bg-glow-teal/5 hover:bg-glow-teal/10 transition-colors duration-300">
          <Compass className="w-8 h-8 text-glow-teal flex-shrink-0" />
          <div>
            <h4 className="font-display text-lg text-foreground mb-1">
              {mounted ? t('teachingPhilosophy') : 'Teaching Philosophy'}
            </h4>
            <p className="text-sm text-muted-foreground">
              {mounted ? t('philosophyQuote') : '"Every body has its own story. My role is not to impose, but to listen—helping you discover the healing that already lives within."'}
            </p>
          </div>
        </div>
      </div>

      <div className="animate-fade-in-up animation-delay-800">
        <div className="grid grid-cols-3 gap-4 text-center">
          {[
            { value: "8+", labelKey: 'yearsPractice' },
            { value: "300+", labelKey: 'studentsGuided' },
            { value: "∞", labelKey: 'momentsOfWonder' },
          ].map((stat) => (
            <div 
              key={stat.labelKey}
              className="p-4 rounded-xl bg-card/50 border border-border/50 
                       hover:border-glow-cyan/30 transition-colors duration-300"
            >
              <div className="font-display text-2xl text-glow-cyan mb-1">{stat.value}</div>
              <div className="text-xs text-muted-foreground">
                {mounted ? t(stat.labelKey) : stat.labelKey}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeacherStoryColumn;

