'use client';

import { Heart, Baby, Sparkles } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

const benefits = [
  {
    icon: Heart,
    titleKey: 'backPainRelief',
    descKey: 'backPainDesc',
  },
  {
    icon: Baby,
    titleKey: 'pregnancySupport',
    descKey: 'pregnancyDesc',
  },
  {
    icon: Sparkles,
    titleKey: 'kneePainRecovery',
    descKey: 'kneePainDesc',
  },
];

const YogaBenefitsColumn = () => {
  const { t, mounted } = useLanguage();

  return (
    <div className="space-y-8">
      <div className="animate-fade-in-up">
        <h2 className="font-display text-4xl md:text-5xl font-light text-glow-subtle mb-4">
          <span className="gradient-text">{mounted ? t('healingThroughMovement').split(' ')[0] : 'Healing'}</span> 
          {mounted ? ' ' + t('healingThroughMovement').split(' ').slice(1).join(' ') : ' Through Movement'}
        </h2>
        <p className="text-muted-foreground text-lg leading-relaxed">
          {mounted ? t('healingSubtitle') : 'Your body holds infinite wisdom. Yoga is the gentle key that unlocks its natural ability to heal, restore, and flourish.'}
        </p>
      </div>

      <div className="space-y-6">
        {benefits.map((benefit, index) => (
          <div 
            key={benefit.titleKey}
            className={`group p-6 rounded-2xl border border-glow-cyan/10 bg-card/50 backdrop-blur-sm 
                       hover:border-glow-cyan/30 hover:box-glow transition-all duration-500
                       animate-fade-in-up`}
            style={{ animationDelay: `${(index + 1) * 200}ms` }}
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-glow-cyan/10 group-hover:bg-glow-cyan/20 
                            transition-colors duration-300">
                <benefit.icon className="w-6 h-6 text-glow-cyan" />
              </div>
              <div className="flex-1">
                <h3 className="font-display text-2xl text-foreground mb-2 group-hover:text-glow-subtle 
                             transition-all duration-300">
                  {mounted ? t(benefit.titleKey) : benefit.titleKey}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {mounted ? t(benefit.descKey) : benefit.descKey}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="animate-fade-in-up animation-delay-800">
        <div className="p-6 rounded-2xl bg-gradient-to-br from-glow-purple/10 to-glow-cyan/10 
                      border border-glow-purple/20 box-glow-purple">
          <p className="font-display text-xl italic text-center text-foreground/90">
            "{mounted ? t('quote') : 'The body achieves what the mind believes.'}"
          </p>
        </div>
      </div>
    </div>
  );
};

export default YogaBenefitsColumn;

