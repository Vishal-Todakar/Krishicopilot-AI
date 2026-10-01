import React from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../translations';

interface NavigationProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  language: Language;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onTabChange,
  language
}) => {
  const t = TRANSLATIONS[language];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-[#f1fcf3]/95 backdrop-blur-xl border-t border-[#dae5dc]/80 shadow-[0_-2px_12px_rgba(0,0,0,0.05)]">
      <div className="max-w-md mx-auto flex items-center justify-around h-16 px-3">
        {/* 1. Farm Dashboard */}
        <button
          type="button"
          onClick={() => onTabChange('dashboard')}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] transition-all active:scale-95 ${
            currentTab === 'dashboard'
              ? 'text-primary font-bold scale-105'
              : 'text-on-surface-variant hover:text-primary'
          }`}
        >
          <span className="material-symbols-outlined text-[24px]">
            potted_plant
          </span>
          <span className="text-[11px] font-headline mt-0.5">{t.navFarm}</span>
        </button>

        {/* 2. Crop Diagnosis */}
        <button
          type="button"
          onClick={() => onTabChange('scanner')}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] transition-all active:scale-95 ${
            currentTab === 'scanner'
              ? 'text-primary font-bold scale-105'
              : 'text-on-surface-variant hover:text-primary'
          }`}
        >
          <span className="material-symbols-outlined text-[24px]">
            document_scanner
          </span>
          <span className="text-[11px] font-headline mt-0.5">{t.navDiagnosis}</span>
        </button>

        {/* 3. Center Floating Krishi AI Mic Button */}
        <div className="relative -top-5 flex flex-col items-center">
          <button
            type="button"
            onClick={() => onTabChange('assistant')}
            className={`flex items-center justify-center w-14 h-14 rounded-full bg-primary text-on-primary shadow-[0_4px_0_0_#0c5216] active:translate-y-0.5 active:shadow-none transition-all ${
              currentTab === 'assistant' ? 'ring-4 ring-secondary-container' : ''
            }`}
            title="Ask Krishi AI"
          >
            <span className="material-symbols-outlined text-[28px]">
              mic
            </span>
          </button>
          <span className="text-[11px] font-headline text-primary font-bold mt-1">
            {t.navAssistant}
          </span>
        </div>

        {/* 4. Mandi & Resources */}
        <button
          type="button"
          onClick={() => onTabChange('mandi')}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] transition-all active:scale-95 ${
            currentTab === 'mandi'
              ? 'text-primary font-bold scale-105'
              : 'text-on-surface-variant hover:text-primary'
          }`}
        >
          <span className="material-symbols-outlined text-[24px]">
            query_stats
          </span>
          <span className="text-[11px] font-headline mt-0.5">{t.navMandi}</span>
        </button>

        {/* 5. Landing / Product Tour */}
        <button
          type="button"
          onClick={() => onTabChange('landing')}
          className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] transition-all active:scale-95 ${
            currentTab === 'landing'
              ? 'text-primary font-bold scale-105'
              : 'text-on-surface-variant hover:text-primary'
          }`}
        >
          <span className="material-symbols-outlined text-[24px]">
            info
          </span>
          <span className="text-[11px] font-headline mt-0.5">About</span>
        </button>
      </div>
    </nav>
  );
};
