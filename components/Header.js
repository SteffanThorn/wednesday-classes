'use client';

import Link from 'next/link';
import { Infinity, User, LogOut, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import LanguageSwitcher from './LanguageSwitcher';
import { useSession, signOut } from 'next-auth/react';
import { useState, useEffect, useRef } from 'react';

const Header = () => {
  const { t, mounted } = useLanguage();
  const { data: session, status } = useSession();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const adminDropdownRef = useRef(null);

  useEffect(() => {
    if (session?.user?.role === 'admin') {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, [session]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (adminDropdownRef.current && !adminDropdownRef.current.contains(event.target)) {
        setIsAdminDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isAuthenticated = status === 'authenticated';
  const isLoading = status === 'loading';

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

          {/* Admin Link - only for admins - Dropdown */}
          {isAdmin && (
            <div className="relative" ref={adminDropdownRef}>
              <button
                onClick={() => setIsAdminDropdownOpen(!isAdminDropdownOpen)}
                className="flex items-center gap-1 text-sm text-glow-cyan hover:text-glow-subtle 
                         transition-colors duration-300 tracking-wide font-medium"
              >
                Admin
                <ChevronDown className={`w-4 h-4 transition-transform ${isAdminDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {/* Admin Dropdown Menu */}
              {isAdminDropdownOpen && (
                <div 
                  className="absolute left-0 mt-2 w-48 py-2 rounded-xl bg-card/95 backdrop-blur-sm 
                              border border-glow-cyan/20 shadow-lg animate-fade-in-up z-50"
                >
                  <Link
                    href="/admin/bookings"
                    className="block px-4 py-2 text-sm text-foreground hover:bg-glow-cyan/10 
                             transition-colors"
                    onClick={() => setIsAdminDropdownOpen(false)}
                  >
                    Bookings
                  </Link>
                  <Link
                    href="/admin/coupons"
                    className="block px-4 py-2 text-sm text-foreground hover:bg-glow-cyan/10 
                             transition-colors"
                    onClick={() => setIsAdminDropdownOpen(false)}
                  >
                    Coupons
                  </Link>
                </div>
              )}
            </div>
          )}
        </nav>

        <div className="flex items-center gap-4">
          <LanguageSwitcher showLabel={true} />
          
          {/* Auth Section - Right Side */}
          <div className="flex items-center gap-3">
            {isLoading ? (
              // Loading state
              <div className="w-8 h-8 rounded-full border-2 border-glow-cyan/20 border-t-glow-cyan animate-spin" />
            ) : isAuthenticated ? (
              // Authenticated - Show user menu
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-glow-cyan/10 
                           border border-glow-cyan/20 hover:bg-glow-cyan/20 
                           transition-all duration-300"
                >
                  <div className="w-8 h-8 rounded-full bg-glow-cyan/30 flex items-center justify-center">
                    <User className="w-4 h-4 text-glow-cyan" />
                  </div>
                  <span className="text-sm text-foreground max-w-[100px] truncate">
                    {session?.user?.name || 'User'}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 py-2 rounded-xl bg-card/95 backdrop-blur-sm 
                                border border-glow-cyan/20 shadow-lg animate-fade-in-up">
                    <Link
                      href="/dashboard"
                      className="block px-4 py-2 text-sm text-foreground hover:bg-glow-cyan/10 
                               transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        signOut({ callbackUrl: '/' });
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 
                               transition-colors flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // Not authenticated - Show login/signup buttons
              <div className="flex items-center gap-2">
                <Link
                  href="/auth/signin"
                  className="px-4 py-2 text-sm text-muted-foreground hover:text-glow-cyan 
                           transition-colors duration-300"
                >
                  Log In
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-4 py-2 text-sm bg-glow-cyan/20 border border-glow-cyan/40 
                           text-glow-cyan rounded-xl hover:bg-glow-cyan/30 hover:box-glow
                           transition-all duration-300"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

