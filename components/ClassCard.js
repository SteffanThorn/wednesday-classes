'use client';

import Link from 'next/link';
import { Clock, Users, Zap } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

const ClassCard = ({ 
  titleEn,
  titleZh,
  descriptionEn,
  descriptionZh,
  duration,
  level,
  icon: Icon = Zap,
  price,
  href
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
        <h3 className="font-display text-2xl text-foreground group-hover:text-glow-subtle 
                     transition-all duration-300">
          {mounted ? (t('language') === 'zh' ? titleZh : titleEn) : titleEn}
        </h3>
      </div>

      <p className="text-muted-foreground leading-relaxed mb-6">
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

