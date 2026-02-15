'use client';

import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

const FeatureCard = ({ 
  icon: Icon = Sparkles,
  titleEn,
  titleZh,
  descriptionEn,
  descriptionZh,
  href,
  delay = 0
}) => {
  const { t, mounted } = useLanguage();

  const content = (
    <div 
      className={`p-6 rounded-2xl border border-glow-cyan/10 bg-card/50 backdrop-blur-sm 
                 hover:border-glow-cyan/30 hover:box-glow transition-all duration-500
                 animate-fade-in-up`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-xl bg-glow-cyan/10 group-hover:bg-glow-cyan/20 
                      transition-colors duration-300">
          <Icon className="w-6 h-6 text-glow-cyan" />
        </div>
        <div className="flex-1">
          <h3 className="font-display text-2xl text-foreground mb-2 group-hover:text-glow-subtle 
                       transition-all duration-300">
            {mounted ? (t('language') === 'zh' ? titleZh : titleEn) : titleEn}
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            {mounted ? (t('language') === 'zh' ? descriptionZh : descriptionEn) : descriptionEn}
          </p>
        </div>
      </div>
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

export default FeatureCard;

