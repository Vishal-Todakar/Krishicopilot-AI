import React, { useState } from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../translations';

interface LandingPageProps {
  language: Language;
  onGetStarted: () => void;
  onTryScanner: () => void;
  isAuthenticated?: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  language,
  onGetStarted,
  onTryScanner,
  isAuthenticated = false
}) => {
  const t = TRANSLATIONS[language];
  const [activeHeroTab, setActiveHeroTab] = useState<'vision' | 'weather' | 'irrigation'>('vision');

  return (
    <div className="flex flex-col pb-32 pt-20 px-4 max-w-5xl mx-auto w-full gap-12">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-surface-container-low via-surface to-surface-container p-6 sm:p-12 shadow-tactile border border-outline-variant/40 flex flex-col items-center text-center gap-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-secondary-container text-on-secondary-container font-headline text-xs font-bold uppercase tracking-wider shadow-sm">
          <span>🌾 100% Software-Only AI Farm Assistant</span>
        </div>

        <h1 className="font-headline font-bold text-3xl sm:text-5xl text-primary max-w-3xl leading-tight tracking-tight">
          🌾 KrishiCopilot
        </h1>
        <h2 className="font-headline font-semibold text-xl sm:text-2xl text-on-surface -mt-2">
          Your AI-powered farming companion.
        </h2>

        <p className="text-sm sm:text-base text-on-surface-variant max-w-2xl leading-relaxed font-medium">
          {t.subheading}
        </p>

        {/* Core Value Chain Banner */}
        <div className="flex items-center gap-2 sm:gap-3 py-2 px-4 rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant/30 flex-wrap justify-center text-xs font-headline font-bold text-primary">
          <span>Detect</span>
          <span>→</span>
          <span>Predict</span>
          <span>→</span>
          <span>Explain</span>
          <span>→</span>
          <span>Recommend</span>
          <span>→</span>
          <span>Connect</span>
        </div>

        {/* Action CTAs */}
        <div className="flex items-center gap-3 flex-wrap justify-center pt-2">
          <button
            type="button"
            onClick={onGetStarted}
            className="px-6 py-3.5 rounded-2xl bg-primary text-on-primary font-headline font-bold text-sm shadow-tactile-btn active:translate-y-0.5 active:shadow-none transition-all flex items-center gap-2"
          >
            <span>{t.getStarted} (Live Dashboard)</span>
            <span className="material-symbols-outlined text-[18px]">
              arrow_forward
            </span>
          </button>
          <button
            type="button"
            onClick={onTryScanner}
            className="px-6 py-3.5 rounded-2xl bg-surface-container-high text-primary font-headline font-bold text-sm shadow-tactile border border-outline-variant/40 active:translate-y-0.5 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">
              center_focus_strong
            </span>
            <span>{t.tryScanner}</span>
          </button>
        </div>

        {/* Hero Visual Banner: Interactive AI Agro-Cockpit Showcase */}
        <div className="relative w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border-4 border-surface-container-lowest mt-4 bg-gradient-to-br from-[#092e10] via-[#134e1b] to-[#061f0a] text-white p-5 sm:p-7 flex flex-col justify-between min-h-[300px] sm:min-h-[340px]">
          {/* Subtle Ambient Background Mesh & Tech Grid */}
          <div className="absolute inset-0 bg-[radial-gradient(#84cc16_1px,transparent_1px)] [background-size:20px_20px] opacity-15 pointer-events-none" />
          <div className="absolute top-0 right-0 w-72 h-72 bg-primary/20 rounded-full blur-3xl pointer-events-none" />

          {/* Top HUD Controls */}
          <div className="relative z-10 flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-white/15">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-secondary-fixed animate-ping" />
              <span className="text-[11px] font-headline font-bold uppercase tracking-wider text-secondary-fixed">
                KrishiCopilot Field Vision HUD
              </span>
            </div>
            
            {/* Interactive Simulator Selector Tabs */}
            <div className="flex items-center gap-1 bg-black/30 p-1 rounded-xl border border-white/10">
              <button
                type="button"
                onClick={() => setActiveHeroTab('vision')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-headline font-bold transition-all flex items-center gap-1 ${
                  activeHeroTab === 'vision' ? 'bg-primary text-white shadow-sm' : 'text-white/70 hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[13px]">document_scanner</span>
                <span>Vision</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveHeroTab('weather')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-headline font-bold transition-all flex items-center gap-1 ${
                  activeHeroTab === 'weather' ? 'bg-primary text-white shadow-sm' : 'text-white/70 hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[13px]">cloud_sync</span>
                <span>Weather</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveHeroTab('irrigation')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-headline font-bold transition-all flex items-center gap-1 ${
                  activeHeroTab === 'irrigation' ? 'bg-primary text-white shadow-sm' : 'text-white/70 hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[13px]">water_drop</span>
                <span>Irrigation</span>
              </button>
            </div>
          </div>

          {/* Interactive Screen Centerpiece */}
          <div className="relative z-10 my-4 flex-1 flex flex-col justify-center">
            {activeHeroTab === 'vision' && (
              <div className="flex flex-col sm:flex-row items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm animate-fade-in">
                {/* Visual Scanning Specimen Simulation */}
                <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-xl bg-[#1c3821] border border-secondary-fixed/40 flex items-center justify-center shrink-0 overflow-hidden shadow-inner">
                  {/* Leaf SVG Graphic */}
                  <svg viewBox="0 0 100 100" className="w-20 h-20 text-[#68d391] drop-shadow-md">
                    <path
                      d="M50 10 C25 25 15 55 25 80 C40 85 70 80 85 55 C90 30 75 15 50 10 Z"
                      fill="currentColor"
                      opacity="0.85"
                    />
                    <path d="M50 10 L50 85" stroke="#1c4524" strokeWidth="2.5" />
                    <circle cx="45" cy="45" r="7" fill="#b91c1c" opacity="0.9" />
                    <circle cx="45" cy="45" r="11" stroke="#f87171" strokeWidth="1.5" fill="none" />
                  </svg>
                  {/* Animated Laser Scanning Line */}
                  <div className="absolute inset-x-0 h-1 bg-secondary-fixed shadow-[0_0_8px_#a3e635] animate-bounce opacity-80" />
                  {/* Bounding Box Indicator */}
                  <div className="absolute top-7 left-7 w-14 h-14 border border-error bg-error/20 rounded pointer-events-none flex items-start justify-end p-0.5">
                    <span className="text-[8px] font-bold bg-error text-white px-1 rounded">94%</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 text-left min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-[10px] font-bold">
                      Target Pathology Identified
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-error text-white text-[10px] font-bold uppercase">
                      High Severity
                    </span>
                  </div>
                  <h4 className="font-headline font-bold text-sm sm:text-base text-white">
                    Early Blight (<em className="italic text-secondary-fixed">Alternaria solani</em>)
                  </h4>
                  <p className="text-[11px] text-white/80 leading-snug">
                    Concentric rings detected on lower leaves. Immediate action: Apply Mancozeb 75% WP (2g/L) or Neem Oil buffer.
                  </p>
                </div>
              </div>
            )}

            {activeHeroTab === 'weather' && (
              <div className="flex flex-col gap-2.5 bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm text-left animate-fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[24px] text-secondary-fixed">cloud_rain</span>
                    <span className="font-headline font-bold text-sm text-white">Agro-Meteorological Forecast</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    78% Rain Probability
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center pt-1">
                  <div className="p-2 rounded-xl bg-black/25">
                    <span className="text-[10px] text-white/70 block">Temperature</span>
                    <span className="text-sm font-bold text-white">28.5°C</span>
                  </div>
                  <div className="p-2 rounded-xl bg-black/25">
                    <span className="text-[10px] text-white/70 block">Humidity</span>
                    <span className="text-sm font-bold text-secondary-fixed">76%</span>
                  </div>
                  <div className="p-2 rounded-xl bg-black/25">
                    <span className="text-[10px] text-white/70 block">Wind Speed</span>
                    <span className="text-sm font-bold text-white">14.5 km/h</span>
                  </div>
                </div>
                <p className="text-[11px] text-amber-200 mt-1">
                  ⚠️ Heavy rain forecast in 12–36h. Postpone foliar sprays & Urea broadcast to eliminate chemical runoff.
                </p>
              </div>
            )}

            {activeHeroTab === 'irrigation' && (
              <div className="flex flex-col gap-2.5 bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm text-left animate-fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[24px] text-blue-400">water_drop</span>
                    <span className="font-headline font-bold text-sm text-white">Precision Irrigation Engine</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    Hold Advisory
                  </span>
                </div>
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-black/25">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex flex-col items-center justify-center text-blue-300 font-bold shrink-0">
                    <span className="text-xs">42%</span>
                    <span className="text-[8px] uppercase">VWC</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-white">Recommendation: AVOID / DELAY</span>
                    <span className="text-[11px] text-white/80 leading-snug">
                      Soil moisture is optimal and upcoming rainfall provides natural root saturation. Next review tomorrow at 06:00 AM.
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Headline Banner */}
          <div className="relative z-10 pt-3 border-t border-white/15 text-left">
            <span className="text-[10px] font-headline font-bold text-secondary-fixed uppercase tracking-wider block">
              Continuous Agro-AI Intelligence
            </span>
            <h3 className="text-white font-headline font-bold text-xs sm:text-sm mt-0.5">
              Translating ambient weather telemetry & leaf photos into actionable daily field tasks.
            </h3>
          </div>
        </div>
      </section>

      {/* 2. The Problem & Solution Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-surface-container-lowest shadow-tactile border border-outline-variant/30 flex flex-col gap-3">
          <div className="w-10 h-10 rounded-xl bg-error-container/60 text-error flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-[24px]">crisis_alert</span>
          </div>
          <h3 className="font-headline font-bold text-lg text-on-surface">The Smallholder Dilemma</h3>
          <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed font-medium">
            Over 140 million farmers in India struggle with unpredicted fungal outbreaks, volatile rainfall, and mistimed chemical spraying. Isolated chatbots offer generic text without synthesizing local weather, soil, crop growth stages, or language nuances.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-surface-container-lowest shadow-tactile border border-outline-variant/30 flex flex-col gap-3">
          <div className="w-10 h-10 rounded-xl bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-[24px]">verified</span>
          </div>
          <h3 className="font-headline font-bold text-lg text-primary">The KrishiCopilot Solution</h3>
          <p className="text-xs sm:text-sm text-on-surface-variant leading-relaxed font-medium">
            A software-only farm copilot combining computer vision diagnosis, OpenWeather agro-telemetry, a multi-factor crop risk engine, irrigation decision rules, and a RAG agricultural assistant grounded in ICAR and university publications in Marathi, Hindi & English.
          </p>
        </div>
      </section>

      {/* 3. Core Capabilities */}
      <section className="flex flex-col gap-4">
        <div className="text-center max-w-xl mx-auto">
          <span className="text-xs font-headline font-bold text-secondary uppercase tracking-wider">Features</span>
          <h2 className="font-headline font-bold text-2xl text-on-surface">Engineered for Real Field Operations</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-surface-container-lowest shadow-tactile border border-outline-variant/30 flex flex-col gap-2">
            <span className="material-symbols-outlined text-primary text-[28px]">document_scanner</span>
            <h4 className="font-headline font-bold text-sm text-on-surface">AI Crop Vision Scanner</h4>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Detects Early Blight, Late Blight, Yellow Rust, and leaf spots with confidence tiering and Grad-CAM explainability.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-surface-container-lowest shadow-tactile border border-outline-variant/30 flex flex-col gap-2">
            <span className="material-symbols-outlined text-secondary text-[28px]">cloud_sync</span>
            <h4 className="font-headline font-bold text-sm text-on-surface">Agro-Meteorological Radar</h4>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Synthesizes 36-hour precipitation, vapor pressure deficit, and humidity to caution against wasteful pesticide washing.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-surface-container-lowest shadow-tactile border border-outline-variant/30 flex flex-col gap-2">
            <span className="material-symbols-outlined text-tertiary text-[28px]">water_drop</span>
            <h4 className="font-headline font-bold text-sm text-on-surface">Irrigation Advisory Engine</h4>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Calculates soil moisture depletion across black, red, and sandy soils to prescribe exact next watering windows.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-surface-container-lowest shadow-tactile border border-outline-variant/30 flex flex-col gap-2">
            <span className="material-symbols-outlined text-primary text-[28px]">psychology</span>
            <h4 className="font-headline font-bold text-sm text-on-surface">RAG Farmer Assistant</h4>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Authoritative agricultural retrieval with transparent citations to ICAR, MPKV Rahuri, and government scheme bulletins.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-surface-container-lowest shadow-tactile border border-outline-variant/30 flex flex-col gap-2">
            <span className="material-symbols-outlined text-secondary text-[28px]">record_voice_over</span>
            <h4 className="font-headline font-bold text-sm text-on-surface">Marathi & Hindi Voice Flow</h4>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Hands-free microphone queries and synthesized speech output designed for field operators wearing gloves or holding tools.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-surface-container-lowest shadow-tactile border border-outline-variant/30 flex flex-col gap-2">
            <span className="material-symbols-outlined text-primary text-[28px]">storefront</span>
            <h4 className="font-headline font-bold text-sm text-on-surface">APMC Mandi Arbitrage</h4>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Live official spot price tracking with predictive harvest windows to maximize commodity realization.
            </p>
          </div>
        </div>
      </section>


    </div>
  );
};
