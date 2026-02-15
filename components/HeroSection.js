'use client';

import { useLanguage } from '@/hooks/useLanguage';

const HeroSection = ({ 
  titleEn, 
  titleZh, 
  subtitleEn, 
  subtitleZh,
  showDivider = true 
}) => {
  const { t, mounted } = useLanguage();

  return (
    <section className="px-6 pt-8 pb-4">
      <div className="max-w-7xl mx-auto text-center">
        <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-light 
                     text-glow animate-fade-in-up">
          {mounted ? (
            t('language') === 'zh' ? (
              <>{titleZh}</>
            ) : (
              <>{titleEn}</>
            )
          ) : (
            <>{titleEn}</>
          )}
        </h1>
        <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto 
                    leading-relaxed animate-fade-in-up animation-delay-200">
          {mounted ? (
            t('language') === 'zh' ? (
              <>{subtitleZh}</>
            ) : (
              <>{subtitleEn}</>
            )
          ) : (
            <>{subtitleEn}</>
          )}
        </p>
        
        {showDivider && (
          <div className="mt-12 flex items-center justify-center gap-4 animate-fade-in-up animation-delay-400">
            <div className="h-px w-24 bg-gradient-to-r from-transparent to-glow-cyan/50" />
            <div className="w-2 h-2 rounded-full bg-glow-cyan animate-pulse-glow" />
            <div className="h-px w-24 bg-gradient-to-l from-transparent to-glow-cyan/50" />
          </div>
        )}
      </div>
    </section>
  );
};

export default HeroSection;

