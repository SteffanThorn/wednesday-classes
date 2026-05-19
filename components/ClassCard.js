'use client';

import Link from 'next/link';
import { Clock, Users, Zap } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

const ClassCard = ({
  titleEn,
  titleZh,
  subtitleEn,
  subtitleZh,
  descriptionEn,
  descriptionZh,
  duration,
  level,
  icon: Icon = Zap,
  price,
  href,
  maxCapacity,
  spotsRemaining,
}) => {
  const { t, mounted } = useLanguage();

  const content = (
    <div className="p-6 rounded-3xl border border-glow-cyan/20 bg-card/60 backdrop-blur-sm 
                 hover:border-glow-cyan/40 hover:box-glow transition-all duration-500
                 animate-fade-in-up">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-glow-cyan/30 to-glow-purple/30 
                      flex items-center justify-center border border-glow-cyan/30 box-glow">
          <Icon className="w-6 h-6 text-glow-cyan" />
        </div>
        <div>
          <h3 className="font-display text-2xl text-foreground group-hover:text-glow-subtle 
                       transition-all duration-300">
            {mounted ? (t('language') === 'zh' ? titleZh : titleEn) : titleEn}
          </h3>
          {(subtitleEn || subtitleZh) && (
            <p className="mt-1 text-sm text-glow-cyan/80">
              {mounted ? (t('language') === 'zh' ? subtitleZh : subtitleEn) : subtitleEn}
            </p>
          )}
        </div>
      </div>

      <p className="text-muted-foreground leading-relaxed mb-6 whitespace-pre-line">
        {mounted ? (t('language') === 'zh' ? descriptionZh : descriptionEn) : descriptionEn}
      </p>

      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4 text-glow-cyan" />
          <span>{duration}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="w-4 h-4 text-glow-cyan" />
          <span>{level}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-glow-cyan font-medium">
          <Zap className="w-4 h-4" />
          <span>{price}</span>
        </div>
        {maxCapacity != null && (
          <div className={`flex items-center gap-1.5 text-sm font-medium px-2 py-0.5 rounded-full border ${
            spotsRemaining === 0
              ? 'text-red-400 border-red-400/30 bg-red-400/10'
              : spotsRemaining != null && spotsRemaining <= 3
                ? 'text-amber-400 border-amber-400/30 bg-amber-400/10'
                : 'text-glow-cyan/70 border-glow-cyan/20 bg-glow-cyan/5'
          }`}>
            <Users className="w-3.5 h-3.5" />
            {spotsRemaining === 0
              ? 'Next class full'
              : spotsRemaining != null && spotsRemaining <= 3
                ? `${spotsRemaining} spot${spotsRemaining === 1 ? '' : 's'} left`
                : `Max ${maxCapacity} students`}
          </div>
        )}
      </div>

      <button className="w-full py-3 rounded-xl bg-glow-cyan/10 border border-glow-cyan/30 
                       text-glow-cyan font-medium hover:bg-glow-cyan/20 hover:box-glow
                       transition-all duration-300">
        {mounted ? t('bookNow') : 'Book Now'}
      </button>
    </div>
  );

  // 如果有 href，则将内容包裹在 Link 中
  if (href) {
    return (
      <Link href={href}>
        {content}
      </Link>
    );
  }

  return content;
};

export default ClassCard;

