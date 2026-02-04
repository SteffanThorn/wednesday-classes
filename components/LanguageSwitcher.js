'use client';

import { useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { Globe, Check } from 'lucide-react';

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
];

const LanguageSwitcher = ({ showLabel = true }) => {
  const { language, t, toggleLanguage, mounted } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  if (!mounted) {
    return (
      <button
        className="px-3 py-2 rounded-lg bg-glow-cyan/10 border border-glow-cyan/30 
                   text-glow-cyan text-sm hover:bg-glow-cyan/20 transition-all duration-300"
      >
        🌐 EN
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-glow-cyan/10 border border-glow-cyan/30 
                   text-glow-cyan text-sm hover:bg-glow-cyan/20 hover:box-glow transition-all duration-300"
        aria-label="Switch language"
      >
        <Globe className="w-4 h-4" />
        {showLabel && <span className="uppercase">{language}</span>}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-40 bg-card/95 backdrop-blur-lg rounded-xl 
                        border border-glow-cyan/20 shadow-lg shadow-glow-cyan/10 z-50 overflow-hidden">
            <div className="p-2">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    if (lang.code !== language) {
                      toggleLanguage();
                    }
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                    ${language === lang.code
                      ? 'bg-glow-cyan/20 text-glow-cyan'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                >
                  <span className="text-lg">{lang.flag}</span>
                  <span className="flex-1 text-left">{lang.name}</span>
                  {language === lang.code && (
                    <Check className="w-4 h-4 text-glow-cyan" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LanguageSwitcher;

