'use client';

import Link from 'next/link';
import { Infinity } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import LanguageSwitcher from './LanguageSwitcher';

const Header = () => {
  const { t, mounted } = useLanguage();

  return (
    <header className="relative z-10 py-8 px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group cursor-pointer">
          <div className="p-2 rounded-xl bg-glow-cyan/10 group-hover:bg-glow-cyan/20 
                        transition-colors duration-300 box-glow">
            <Infinity className="w-6 h-6 text-glow-cyan" />
          </div>
          <span className="font-display text-2xl text-foreground group-hover:text-glow-subtle 
                         transition-all duration-300">
            {mounted ? t('luminousYoga') : 'INNER LIGHT'}
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {/* Wednesday Classes Link */}
          <Link
            href="/wednesday-classes"
            className="text-sm text-muted-foreground hover:text-glow-cyan 
                     transition-colors duration-300 tracking-wide"
          >
            {mounted ? (t('wednesdayClasses') || 'Wednesday Classes') : 'Wednesday Classes'}
          </Link>

          {/* Privacy Policy Link */}
          <Link
            href="/privacy"
            className="text-sm text-muted-foreground hover:text-glow-cyan 
                     transition-colors duration-300 tracking-wide"
          >
            {mounted ? (t('privacyPolicy') || 'Privacy Policy') : 'Privacy Policy'}
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <LanguageSwitcher showLabel={true} />
        </div>
      </div>
    </header>
  );
};

export default Header;

