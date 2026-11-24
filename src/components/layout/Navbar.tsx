import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  BookOpen,
  Users,
  Bookmark,
  Settings,
  Search,
  Moon,
  Sun,
  Menu,
  X,
  Home
} from 'lucide-react';
import { useQuranSettings } from '../../context/QuranSettingsContext';
import { SearchModal } from '../common/SearchModal';
import AzkarIcon from '../icons/AzkarIcon';
import { MushafStandIcon } from '../icons/IslamicIcons';

export const Navbar: React.FC = () => {
  const { settings, toggleTheme, bookmarks } = useQuranSettings();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMobileMenuOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isMobileMenuOpen]);

  const navLinks = [
    { to: '/', label: 'الرئيسية', icon: Home },
    { to: '/quran/1', label: 'المصحف', icon: BookOpen },
    { to: '/surahs', label: 'السور', icon: MushafStandIcon },
    { to: '/reciters', label: 'القراء', icon: Users },
    { to: '/azkar', label: 'الأذكار', icon: AzkarIcon },
    { to: '/bookmarks', label: 'المحفوظات', icon: Bookmark, badge: bookmarks.length },
    { to: '/settings', label: 'الإعدادات', icon: Settings }
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#121B18]/95 backdrop-blur-md border-b border-[#E2E8E1] dark:border-[#24352D] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#145C46] rounded-xl"
          >
           
            <div>
              <div className="font-bold text-lg text-[#145C46] dark:text-[#C5A45D] font-ui leading-tight tracking-wide flex items-center gap-1.5">
                <span>القرآن الكريم</span>
              </div>
              <div className="text-[11px] text-[#777F79] dark:text-[#95A39B] font-ui leading-none">
                المصحف الإلكتروني الشامل
              </div>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-[#145C46] text-white shadow-sm shadow-[#145C46]/20'
                        : 'text-[#242B28] dark:text-[#F0F5F2] hover:bg-[#FAFAF6] dark:hover:bg-[#1E2D27] hover:text-[#145C46] dark:hover:text-[#C5A45D]'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon className={`w-4 h-4 ${isActive ? 'text-[#C5A45D]' : 'opacity-70'}`} />
                      <span>{link.label}</span>
                      {link.badge !== undefined && link.badge > 0 && (
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                            isActive
                              ? 'bg-[#C5A45D] text-[#145C46]'
                              : 'bg-[#145C46]/15 dark:bg-[#C5A45D]/20 text-[#145C46] dark:text-[#C5A45D]'
                          }`}
                        >
                          {link.badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* Actions: Search Modal Trigger & Theme Toggle & Mobile Menu */}
          <div className="flex items-center gap-2">
            {/* Quick Search */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#E2E8E1] dark:border-[#24352D] bg-[#FAFAF6] dark:bg-[#16221E] text-xs text-[#777F79] dark:text-[#95A39B] hover:border-[#145C46] dark:hover:border-[#C5A45D] hover:text-[#145C46] dark:hover:text-[#C5A45D] transition-colors"
              title="بحث في السور"
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">بحث في القرآن...</span>
            </button>

            {/* Dark / Light Toggle */}
            <button
              onClick={toggleTheme}
              aria-label="تبديل الوضع الليلي والنهاري"
              className="p-2 rounded-xl border border-[#E2E8E1] dark:border-[#24352D] bg-[#FAFAF6] dark:bg-[#16221E] text-[#242B28] dark:text-[#F0F5F2] hover:text-[#145C46] dark:hover:text-[#C5A45D] hover:border-[#145C46] transition-colors"
            >
              {settings.theme === 'dark' ? (
                <Sun className="w-4 h-4 text-[#C5A45D]" />
              ) : (
                <Moon className="w-4 h-4 text-[#145C46]" />
              )}
            </button>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="القائمة"
              aria-expanded={isMobileMenuOpen}
              className="md:hidden p-2 rounded-xl border border-[#E2E8E1] dark:border-[#24352D] bg-[#FAFAF6] dark:bg-[#16221E] text-[#242B28] dark:text-[#F0F5F2]"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-[#E2E8E1] dark:border-[#24352D] bg-white dark:bg-[#16221E] px-4 pt-2 pb-4 space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-[#145C46] text-white font-bold'
                        : 'text-[#242B28] dark:text-[#F0F5F2] hover:bg-[#FAFAF6] dark:hover:bg-[#1E2D27]'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-[#C5A45D]" />
                    <span>{link.label}</span>
                  </div>
                  {link.badge !== undefined && link.badge > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#C5A45D]/20 text-[#C5A45D]">
                      {link.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        )}
      </header>

      {/* Global Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};
