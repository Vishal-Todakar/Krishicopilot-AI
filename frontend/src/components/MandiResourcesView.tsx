import React, { useState, useEffect } from 'react';
import { Language, MandiRate, AgriculturalResource } from '../types';
import { TRANSLATIONS } from '../translations';
import { api } from '../api';

interface MandiResourcesViewProps {
  language: Language;
}

export const MandiResourcesView: React.FC<MandiResourcesViewProps> = ({
  language
}) => {
  const t = TRANSLATIONS[language];
  const [rates, setRates] = useState<MandiRate[]>([]);
  const [resources, setResources] = useState<AgriculturalResource[]>([]);
  const [selectedRadius, setSelectedRadius] = useState<string>("Within 30 km");

  useEffect(() => {
    api.getMandiRates().then(setRates);
    api.getResources().then(setResources);
  }, []);

  const cycleRadius = () => {
    if (selectedRadius === "Within 30 km") setSelectedRadius("Within 50 km");
    else if (selectedRadius === "Within 50 km") setSelectedRadius("Statewide");
    else setSelectedRadius("Within 30 km");
  };

  return (
    <div className="flex flex-col pb-28 pt-20 px-4 max-w-4xl mx-auto w-full gap-4">
      {/* 1. Mandi Yard Info Strip */}
      <div className="bg-surface-container-low rounded-2xl p-3.5 shadow-sm border border-outline-variant/30 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-full bg-primary-fixed text-primary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                storefront
              </span>
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1">
                <span className="font-headline font-bold text-sm text-on-surface truncate">
                  Nashik & Karnal APMC Yard
                </span>
                <span className="material-symbols-outlined text-[16px] text-primary">
                  verified
                </span>
              </div>
              <span className="text-[11px] text-on-surface-variant font-medium">
                Live E-NAM Synced Mandi Yard
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={cycleRadius}
            className="px-2.5 py-1 rounded-full bg-surface-container-highest text-on-surface text-xs font-headline font-semibold flex items-center gap-1 active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-[14px] text-secondary">
              radar
            </span>
            <span>{selectedRadius}</span>
          </button>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-outline-variant/30 text-xs">
          <span className="text-on-surface-variant font-medium">6 APMCs Synchronized</span>
          <div className="flex items-center gap-1 text-primary font-bold">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span>Today's Official Quotes</span>
          </div>
        </div>
      </div>

      {/* 2. Signature AI Arbitrage & Optimal Window Alert Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary-container to-surface-tint p-4 text-on-primary shadow-md border border-primary/20">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-headline text-[10px] uppercase font-bold tracking-wide">
              {t.arbitrageAlert}
            </span>
            <span className="text-[11px] opacity-80 font-medium">94% Predictive Accuracy</span>
          </div>
          <div className="flex items-center gap-1 text-secondary-fixed text-xs font-headline font-bold">
            <span className="material-symbols-outlined text-[16px]">
              trending_up
            </span>
            <span>+₹65 Today</span>
          </div>
        </div>

        <div className="flex items-baseline justify-between mt-1">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[20px]">🌾</span>
              <h2 className="font-headline font-bold text-base text-on-primary">
                Wheat (HD-2967) / Tomato Hybrid
              </h2>
            </div>
            <p className="text-xs text-on-primary-container mt-0.5 font-medium">
              High Milling Grade • Clean Lot
            </p>
          </div>
          <div className="text-right">
            <div className="font-headline text-2xl font-bold text-secondary-fixed leading-none">
              ₹2,425
            </div>
            <span className="text-[10px] opacity-80 font-medium">/ Quintal (100 kg)</span>
          </div>
        </div>

        <div className="mt-3 pt-2.5 bg-on-primary/10 rounded-xl p-2.5 backdrop-blur-sm flex items-start gap-2 border border-white/10">
          <span className="material-symbols-outlined text-[18px] text-secondary-fixed shrink-0 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>
            insights
          </span>
          <p className="text-xs text-on-primary leading-snug">
            <strong className="text-secondary-fixed font-headline font-bold">{t.optimalWindow}: </strong>
            Sell within 72 hrs. Regional market arrivals increase by Friday as neighboring district harvest flows in, dampening modal prices by ₹80–₹120/qtl.
          </p>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs pt-1">
          <span className="text-on-primary-container font-medium">
            Estimated gain on 80 Qtl: +₹5,200
          </span>
          <button
            type="button"
            onClick={() => alert("Rate locked! Direct trader connection alert sent to your phone.")}
            className="px-3.5 py-1.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-headline font-bold text-xs shadow-tactile-lime active:translate-y-0.5 transition-all"
          >
            Lock Rate
          </button>
        </div>
      </div>

      {/* 3. Commodity Spot Rates List */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <h3 className="font-headline font-bold text-sm text-on-surface">
            {t.mandiTitle}
          </h3>
          <span className="text-xs text-primary font-headline font-bold">
            APMC E-NAM Verified
          </span>
        </div>

        <div className="space-y-2.5">
          {rates.map((rate) => (
            <div
              key={rate.id}
              className="bg-surface-container rounded-2xl p-3.5 shadow-tactile border border-outline-variant/30 flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-headline font-bold text-sm text-on-surface">
                    {rate.commodity}
                  </h4>
                  <span className="text-[11px] text-on-surface-variant font-medium">
                    {rate.market_name} • {rate.variety} • Arrival: {rate.arrival_quintals} Qtl
                  </span>
                </div>
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-headline font-bold">
                  <span className="material-symbols-outlined text-[14px]">
                    arrow_upward
                  </span>
                  <span>+{rate.change_pct}%</span>
                </div>
              </div>

              {/* Price Range Pills */}
              <div className="grid grid-cols-3 gap-2 py-2 px-2.5 bg-surface-container-lowest rounded-xl text-center shadow-sm">
                <div>
                  <span className="text-[10px] text-on-surface-variant block font-medium">Min Rate</span>
                  <span className="text-xs font-headline font-bold text-on-surface">₹{rate.min_price}</span>
                </div>
                <div className="bg-surface-container-high rounded-lg p-0.5">
                  <span className="text-[10px] text-primary font-bold block">Modal (Avg)</span>
                  <span className="text-sm font-headline font-bold text-primary">₹{rate.modal_price}</span>
                </div>
                <div>
                  <span className="text-[10px] text-on-surface-variant block font-medium">Max Rate</span>
                  <span className="text-xs font-headline font-bold text-on-surface">₹{rate.max_price}</span>
                </div>
              </div>

              {rate.optimal_window && (
                <p className="text-[11px] text-on-surface-variant italic">
                  💡 {rate.optimal_window}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 4. Agricultural Resources & Helplines (Help Near Me) */}
      <div className="flex flex-col gap-2.5 pt-2">
        <h3 className="font-headline font-bold text-sm text-on-surface flex items-center gap-1.5">
          <span className="material-symbols-outlined text-primary text-[20px]">
            support_agent
          </span>
          {t.helpNearMe}
        </h3>

        <div className="space-y-2.5">
          {resources.map((res) => (
            <div
              key={res.id}
              className="p-3.5 rounded-2xl bg-surface-container-lowest shadow-tactile border border-outline-variant/30 flex flex-col gap-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-headline uppercase font-bold px-2 py-0.5 rounded bg-surface-container-high text-primary">
                    {res.category}
                  </span>
                  <h4 className="font-headline font-bold text-xs sm:text-sm text-on-surface mt-1">
                    {res.title}
                  </h4>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    {res.address || `${res.district}`}
                  </p>
                </div>
                {res.phone && (
                  <a
                    href={`tel:${res.phone.split('/')[0].trim()}`}
                    className="px-3 py-1.5 rounded-xl bg-primary text-on-primary text-xs font-headline font-bold flex items-center gap-1 shadow-tactile-btn shrink-0 active:translate-y-0.5 transition-all"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      call
                    </span>
                    <span>{t.callNow}</span>
                  </a>
                )}
              </div>
              <p className="text-[11px] text-on-surface-variant font-medium">
                {res.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
