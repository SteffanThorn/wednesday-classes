'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Infinity, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import LanguageSwitcher from './LanguageSwitcher';

const Header = () => {
  const { t, mounted, language } = useLanguage();
  const router = useRouter();
  const [practiceOpen, setPracticeOpen] = useState(false);
  const [classesOpen, setClassesOpen] = useState(false);
  
  // Delay timers for closing menus
  const practiceCloseTimer = useRef(null);
  const classesCloseTimer = useRef(null);
  
  // Refs for detecting clicks outside
  const practiceRef = useRef(null);
  const classesRef = useRef(null);

  // Click outside to close menus
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (practiceRef.current && !practiceRef.current.contains(event.target)) {
        setPracticeOpen(false);
      }
      if (classesRef.current && !classesRef.current.contains(event.target)) {
        setClassesOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle delayed close with hover
  const handlePracticeLeave = () => {
    practiceCloseTimer.current = setTimeout(() => {
      setPracticeOpen(false);
    }, 500);
  };

  const handleClassesLeave = () => {
    classesCloseTimer.current = setTimeout(() => {
      setClassesOpen(false);
    }, 500);
  };

  // Cancel close timer when hovering back
  const handlePracticeEnter = () => {
    if (practiceCloseTimer.current) {
      clearTimeout(practiceCloseTimer.current);
      practiceCloseTimer.current = null;
    }
    setPracticeOpen(true);
  };

  const handleClassesEnter = () => {
    if (classesCloseTimer.current) {
      clearTimeout(classesCloseTimer.current);
      classesCloseTimer.current = null;
    }
    setClassesOpen(true);
  };

  // Toggle on click
  const togglePractice = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setPracticeOpen(!practiceOpen);
    setClassesOpen(false);
  };

  const toggleClasses = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setClassesOpen(!classesOpen);
    setPracticeOpen(false);
  };

const navItems = [
    { key: 'about', href: '/about' },
    { key: 'contact', href: '/contact' },
    { key: 'privacy', href: '/privacy', labelEn: 'Privacy Policy', labelZh: '隐私政策' },
  ];

  // New Motherscope navigation item
  const motherscopeItem = { key: 'motherscope', href: '/motherscope' };

  const practiceItems = [
    { key: 'ayurveda', href: '/ayurveda', labelEn: 'Ayurveda', labelZh: '阿育吠陀' },
    { key: 'mindfulnesschakrasmeditation', href: '/practice/mindfulness-chakras-meditation', labelEn: 'Mindfulness, Chakras & Meditation', labelZh: '正念、脉轮、冥想' },
    { key: 'chakratest', href: '/chakra-test', labelEn: 'Chakra Test', labelZh: '脉轮测试' },
  ];

  const classItems = [
    { key: 'mombetobe', href: '/classes/mom-to-be-mindfulness', labelEn: 'Mom-to-be Mindfulness', labelZh: '孕妈妈正念练习' },
    { key: 'energyringyoga', href: '/practice/mom-to-be-yoga', labelEn: 'Energy Ring Yoga', labelZh: '能量环瑜伽' },
    { key: 'painposture', href: '/practice/pain-management', labelEn: 'Pain & Posture Management', labelZh: '疼痛与体态管理' },
    { key: 'vip1on1', href: '/classes/vip-1on1', labelEn: 'VIP (1 on 1)', labelZh: '私教课程' },
  ];

  const handleNavigation = (href) => {
    setPracticeOpen(false);
    setClassesOpen(false);
    router.push(href);
  };

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
          {/* Classes Dropdown */}
          <div 
            ref={classesRef}
            className="relative"
            onMouseEnter={handleClassesEnter}
            onMouseLeave={handleClassesLeave}
          >
            <button 
              onClick={toggleClasses}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-glow-cyan 
                       transition-colors duration-300 tracking-wide cursor-pointer"
            >
              {mounted ? t('classes') : 'Classes'}
              <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${classesOpen ? 'rotate-180' : ''}`} />
            </button>
            
            <div 
              className={`absolute top-full left-0 mt-2 w-64 bg-card/95 backdrop-blur-sm 
                        border border-glow-cyan/20 rounded-2xl shadow-lg overflow-hidden
                        transition-all duration-300 transform origin-top-left
                        ${classesOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
            >
              <div className="p-2">
                {classItems.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => handleNavigation(item.href)}
                    className="w-full text-left px-4 py-3 text-sm text-muted-foreground hover:text-glow-cyan 
                             hover:bg-glow-cyan/10 rounded-xl transition-all duration-200"
                  >
                    {language === 'zh' ? item.labelZh : item.labelEn}
                  </button>
                ))}
              </div>
            </div>
          </div>

{/* Practice Dropdown */}
          <div 
            ref={practiceRef}
            className="relative"
            onMouseEnter={handlePracticeEnter}
            onMouseLeave={handlePracticeLeave}
          >
            <button 
              onClick={togglePractice}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-glow-cyan 
                       transition-colors duration-300 tracking-wide cursor-pointer"
            >
              {mounted ? t('practice') : 'Energy Medicine Academy'}
              <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${practiceOpen ? 'rotate-180' : ''}`} />
            </button>
            
            <div 
              className={`absolute top-full left-0 mt-2 w-64 bg-card/95 backdrop-blur-sm 
                        border border-glow-cyan/20 rounded-2xl shadow-lg overflow-hidden
                        transition-all duration-300 transform origin-top-left
                        ${practiceOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
            >
              <div className="p-2">
                {practiceItems.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => handleNavigation(item.href)}
                    className="w-full text-left px-4 py-3 text-sm text-muted-foreground hover:text-glow-cyan 
                             hover:bg-glow-cyan/10 rounded-xl transition-all duration-200"
                  >
                    {language === 'zh' ? item.labelZh : item.labelEn}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Motherscope Navigation Item */}
          <Link
            href={motherscopeItem.href}
            className="text-sm text-muted-foreground hover:text-glow-cyan 
                     transition-colors duration-300 tracking-wide"
          >
            {mounted ? t('motherscope') : 'Motherscope'}
          </Link>

          {navItems.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="text-sm text-muted-foreground hover:text-glow-cyan 
                       transition-colors duration-300 tracking-wide"
            >
              {mounted ? t(item.key) : item.key}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <LanguageSwitcher showLabel={true} />
          
          <Link href="/classes" className="px-5 py-2.5 rounded-full bg-glow-cyan/10 border border-glow-cyan/30 
                           text-glow-cyan text-sm hover:bg-glow-cyan/20 hover:box-glow
                           transition-all duration-300">
            {mounted ? t('beginJourney') : 'Begin Journey'}
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;

