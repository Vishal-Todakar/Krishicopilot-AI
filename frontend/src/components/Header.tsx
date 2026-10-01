import React from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../translations';

interface HeaderProps {
  currentTab: string;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  locationLabel?: string;
  onProfileClick: () => void;
  farmerName?: string;
  avatarUrl?: string;
  isAuthenticated?: boolean;
  onSignInClick?: () => void;
  onNavigate?: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  language,
  onLanguageChange,
  locationLabel,
  onProfileClick,
  farmerName = "",
  avatarUrl,
  isAuthenticated = false,
  onSignInClick,
  onNavigate
}) => {
  const t = TRANSLATIONS[language];

  const getTabTitle = (tab: string) => {
    switch (tab) {
      case 'dashboard': return t.navFarm;
      case 'scanner': return t.navDiagnosis;
      case 'assistant': return t.navAssistant;
      case 'mandi': return t.navMandi;
      case 'landing': return t.landingTitle;
      default: return t.appName;
    }
  };

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-[#f1fcf3]/90 backdrop-blur-xl border-b border-[#dae5dc]/60 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <div className="max-w-4xl mx-auto px-4 py-2.5 flex flex-col gap-1">
        <div className="flex items-center justify-between">
          {/* Logo & Brand Title */}
          <div className="flex items-center gap-2.5">
            {/* KrishiCopilot Leaf Neural Logo SVG from Stitch */}
            <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0 shadow-sm flex items-center justify-center bg-primary">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" className="w-8 h-8">
                <rect width="100" height="100" rx="24" fill="#1B5E20"/>
                <path d="M50 20C36 34 32 50 36 68C44 68 58 64 68 50C72 36 64 22 50 20Z" fill="#84CC16"/>
                <path d="M50 20C50 42 42 60 28 76C44 80 62 76 74 62C80 48 72 30 50 20Z" fill="#A3E635" fillOpacity="0.85"/>
                <circle cx="50" cy="48" r="7" fill="#FFFFFF"/>
                <path d="M48 48L62 34M50 48L38 38M50 48L50 64" stroke="#1B5E20" strokeWidth="3" strokeLinecap="round"/>
              </svg>
            </div>
            
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-headline font-bold text-lg text-primary tracking-tight">
                  KrishiCopilot
                </span>
                <span className="text-[10px] font-headline font-bold uppercase px-1.5 py-0.2 rounded bg-secondary-container text-on-secondary-container">
                  AI
                </span>
              </div>
              <span className="text-xs text-on-surface-variant font-medium line-clamp-1">
                {getTabTitle(currentTab)}
              </span>
            </div>
          </div>

          {/* Language Selector & Farmer Profile */}
          <div className="flex items-center gap-2">
            {/* Multilingual Selector Pill */}
            <div className="flex items-center bg-surface-container-high rounded-full p-0.5 shadow-sm border border-outline-variant/30">
              <button
                type="button"
                onClick={() => onLanguageChange('mr')}
                className={`px-2.5 py-1 rounded-full text-xs font-headline font-bold transition-all ${
                  language === 'mr'
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                मराठी
              </button>
              <button
                type="button"
                onClick={() => onLanguageChange('hi')}
                className={`px-2.5 py-1 rounded-full text-xs font-headline font-bold transition-all ${
                  language === 'hi'
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                हिंदी
              </button>
              <button
                type="button"
                onClick={() => onLanguageChange('en')}
                className={`px-2.5 py-1 rounded-full text-xs font-headline font-bold transition-all ${
                  language === 'en'
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                ENG
              </button>
            </div>

            {/* Auth Actions: Sign In button when logged out; Farmer Avatar when logged in */}
            {!isAuthenticated ? (
              <button
                type="button"
                onClick={onSignInClick}
                className="px-3 py-1.5 rounded-full bg-primary text-on-primary text-xs font-headline font-bold shadow-tactile-btn active:translate-y-0.5 flex items-center gap-1.5 transition-all shrink-0"
              >
                <span className="material-symbols-outlined text-[16px]">login</span>
                <span>{t.signIn || 'Sign In'}</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                {currentTab === 'landing' && onNavigate && (
                  <button
                    type="button"
                    onClick={() => onNavigate('dashboard')}
                    className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container text-xs font-headline font-bold"
                  >
                    <span>{t.navFarm || 'Dashboard'}</span>
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={onProfileClick}
                  className="w-9 h-9 rounded-full ring-2 ring-primary/40 overflow-hidden shrink-0 flex items-center justify-center bg-surface-container active:scale-95 transition-transform"
                  title={`${farmerName || 'Profile'} • Settings`}
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={farmerName || 'Profile'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="material-symbols-outlined text-[20px] text-primary">
                      person
                    </span>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Location & Real-time Weather Substrip */}
        <div className="flex items-center gap-1.5 text-on-surface-variant text-[11px] font-medium px-1">
          <span className="material-symbols-outlined text-[14px] text-secondary">
            {isAuthenticated ? 'location_on' : 'eco'}
          </span>
          <span className="truncate">
            {isAuthenticated
              ? locationLabel
              : (language === 'mr'
                  ? '🌾 कृषी कोपायलट • १००% सॉफ्टवेअर-ओन्ली एआय शेती मार्गदर्शक'
                  : language === 'hi'
                  ? '🌾 कृषि कोपायलट • १००% सॉफ्टवेयर-आधारित एआई कृषि साथी'
                  : '🌾 KrishiCopilot • 100% Software-Only AI Farm Decision Companion')}
          </span>
          <span className="ml-auto inline-flex items-center gap-1 text-[10px] text-primary font-bold">
            <span className={`w-1.5 h-1.5 rounded-full ${isAuthenticated ? 'bg-secondary animate-pulse' : 'bg-primary'}`} />
            {isAuthenticated ? 'Live Sync' : 'Ready'}
          </span>
        </div>
      </div>
    </header>
  );
};
