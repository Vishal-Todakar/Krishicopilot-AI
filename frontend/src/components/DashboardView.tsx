import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Language, CropScanResult, WeatherTelemetry, CropRiskData, IrrigationAdvisory } from '../types';
import { TRANSLATIONS } from '../translations';

interface DashboardViewProps {
  language: Language;
  onNavigate: (tab: string) => void;
  dashboardData: any;
  onVoiceSearchClick: () => void;
  farmerAvatar?: string;
  farmerName?: string;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  language,
  onNavigate,
  dashboardData,
  onVoiceSearchClick,
  farmerAvatar,
  farmerName
}) => {
  const t = TRANSLATIONS[language];
  const farm = dashboardData?.farm || {
    farm_name: "",
    farmer_name: farmerName || "",
    location: "",
    primary_crop: "",
    crop_stage: "",
    soil_type: "",
    area_acres: 0,
    irrigation_method: ""
  };

  const weather: WeatherTelemetry = dashboardData?.weather || {
    temperature_c: 28.5,
    humidity_pct: 76.0,
    rainfall_mm: 14.2,
    rain_probability_pct: 78.0,
    wind_speed_kmh: 14.5,
    uv_index: "Normal (4.5)",
    condition: "Rain Likely (78%)",
    icon: "cloud-rain",
    location_name: "Live Field",
    advisory_headline: "Heavy Rain Forecast in Next 12–36 Hours",
    advisory_detail: "Moderate rain expected within 36 hrs. Avoid Urea broadcast and foliar sprays to prevent chemical wash-off."
  };

  const risks: CropRiskData = dashboardData?.crop_health_risks || {
    disease_risk: "LOW",
    water_stress: "LOW",
    heat_stress: "LOW",
    rainfall_risk: "LOW",
    overall_score: 25.0,
    summary: "Real-time field telemetry active.",
    alerts: []
  };

  const irrigation: IrrigationAdvisory = dashboardData?.irrigation_plan || {
    recommendation: "OPTIMAL",
    status_level: "SAFE",
    reason: "Soil moisture and weather conditions are within normal limits.",
    soil_moisture_pct: 42.0,
    expected_water_mm: 0.0,
    scheduled_window: "Regular schedule",
    next_review: "Tomorrow at 06:00 AM",
    crop_specific_notes: ""
  };

  const lastScan: CropScanResult | null = dashboardData?.last_scan || null;

  const actionPlan = dashboardData?.daily_ai_action_plan || [];
  const healthTrend = dashboardData?.health_trend || [
    { day: "Day 10", health_index: 92, disease_risk: 15 },
    { day: "Day 20", health_index: 88, disease_risk: 25 },
    { day: "Day 30", health_index: 85, disease_risk: 30 },
    { day: "Day 38", health_index: 72, disease_risk: 75 },
    { day: "Day 42", health_index: 70, disease_risk: 85 }
  ];

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'HIGH': return 'bg-error text-white';
      case 'MEDIUM': return 'bg-tertiary-container text-white';
      case 'LOW': default: return 'bg-secondary text-white';
    }
  };

  return (
    <div className="flex flex-col gap-4 pb-28 pt-20 px-4 max-w-4xl mx-auto w-full">
      {/* 1. Greeting Hero Card (Tactile Depth) */}
      <div className="relative overflow-hidden rounded-2xl bg-surface-container-lowest p-4 shadow-tactile border border-outline-variant/40 flex flex-col gap-3">
        <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-secondary-container/20 pointer-events-none" />
        <div className="flex items-start justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 shadow-sm ring-2 ring-primary/20 bg-surface-container flex items-center justify-center">
              {farmerAvatar ? (
                <img
                  src={farmerAvatar}
                  alt={farmerName || 'Farmer'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="material-symbols-outlined text-[28px] text-primary">
                  person
                </span>
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="font-headline text-lg font-bold text-primary tracking-tight">
                  {t.greeting} {farmerName || farm.farmer_name || (language === 'mr' ? 'शेतकरी मित्र' : language === 'hi' ? 'किसान साथी' : 'Farmer')}
                </h1>
                <span className="text-base select-none">🙏</span>
              </div>
              <p className="text-xs text-on-surface-variant font-medium truncate">
                {farm.farm_name || farm.primary_crop
                  ? [
                      farm.farm_name,
                      farm.area_acres && Number(farm.area_acres) > 0 ? `${farm.area_acres} ${t.area}` : '',
                      farm.primary_crop ? `(${farm.primary_crop})` : ''
                    ].filter(Boolean).join(' • ')
                  : (language === 'mr' ? 'प्रोफाइलवर क्लिक करून शेत जोडा' : language === 'hi' ? 'प्रोफ़ाइल पर क्लिक करके खेत जोड़ें' : 'Tap profile to configure farm')}
              </p>
            </div>
          </div>
          <span className="inline-flex items-center px-2 py-1 rounded-full bg-surface-container-high text-primary font-headline text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-secondary mr-1 animate-pulse" />
            {t.liveField}
          </span>
        </div>

        {/* Mini Crop Snapshot Row - Only show when user has set their crop/irrigation */}
        {farm.primary_crop || farm.irrigation_method ? (
          <div className="flex items-center gap-2 pt-1 border-t border-outline-variant/30 flex-wrap">
            {farm.primary_crop && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container text-on-surface text-xs font-headline font-semibold">
                <span className="material-symbols-outlined text-[16px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                  eco
                </span>
                <span>{farm.primary_crop}{farm.crop_stage ? `: ${farm.crop_stage}` : ''}</span>
              </div>
            )}
            {farm.irrigation_method && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container text-on-surface text-xs font-headline font-semibold">
                <span className="material-symbols-outlined text-[16px] text-tertiary">
                  water_drop
                </span>
                <span>{farm.irrigation_method}</span>
              </div>
            )}
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary-container/60 text-on-secondary-container text-xs font-headline font-bold ml-auto">
              <span className="material-symbols-outlined text-[14px]">
                shield
              </span>
              {t.protected}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between pt-1 border-t border-outline-variant/30 text-xs text-on-surface-variant font-medium">
            <span>{language === 'mr' ? 'शेत तपशील जोडलेले नाहीत' : language === 'hi' ? 'खेत का विवरण अभी नहीं जोड़ा गया है' : 'Farm profile not configured yet'}</span>
            <span className="text-primary font-bold">{t.protected}</span>
          </div>
        )}
      </div>

      {/* 2. Government Subsidy & Scheme Ticker */}
      <div className="rounded-xl bg-tertiary-fixed text-on-tertiary-fixed p-2.5 flex items-center gap-2.5 shadow-sm border border-tertiary-container/30 overflow-hidden">
        <div className="w-7 h-7 rounded-lg bg-tertiary-container text-on-tertiary flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[18px]">
            campaign
          </span>
        </div>
        <div className="relative overflow-hidden w-full h-5 flex items-center">
          <div className="flex items-center whitespace-nowrap gap-6 text-xs font-headline font-bold tracking-tight animate-marquee">
            <span>📢 PM-Kisan 17th Installment credited to linked DBT accounts</span>
            <span>•</span>
            <span>☀️ 75% Solar Pump Subsidy open under PM-KUSUM</span>
            <span>•</span>
            <span>🌾 Tomato & Wheat MSP support portal updated</span>
          </div>
        </div>
      </div>

      {/* 3. Weather & Agro-Meteorological Advisory Banner */}
      <div className="rounded-2xl bg-surface-container-high p-4 flex flex-col gap-3 shadow-tactile border border-outline-variant/30">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0 shadow-sm">
            <span className="material-symbols-outlined text-[24px]">
              cloud_sync
            </span>
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-headline uppercase tracking-wider text-secondary font-bold">
                {t.agroAdvisory}
              </span>
              <span className="text-[11px] font-headline text-on-surface-variant font-medium">
                {weather.condition}
              </span>
            </div>
            <p className="text-sm font-headline font-semibold text-on-surface mt-0.5 leading-snug">
              {weather.advisory_headline} — {weather.advisory_detail}
            </p>
          </div>
        </div>

        {/* 4 Weather Telemetry Chips */}
        <div className="grid grid-cols-4 gap-2 pt-1">
          <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-surface-container-lowest shadow-sm text-center">
            <span className="material-symbols-outlined text-[18px] text-tertiary">
              device_thermostat
            </span>
            <span className="text-lg font-headline font-bold text-on-surface mt-0.5">
              {weather.temperature_c}°
            </span>
            <span className="text-[10px] text-on-surface-variant font-medium">{t.temp}</span>
          </div>
          <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-surface-container-lowest shadow-sm text-center">
            <span className="material-symbols-outlined text-[18px] text-primary">
              water_drop
            </span>
            <span className="text-lg font-headline font-bold text-on-surface mt-0.5">
              {weather.humidity_pct}%
            </span>
            <span className="text-[10px] text-on-surface-variant font-medium">{t.humidity}</span>
          </div>
          <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-surface-container-lowest shadow-sm text-center">
            <span className="material-symbols-outlined text-[18px] text-outline">
              air
            </span>
            <span className="text-lg font-headline font-bold text-on-surface mt-0.5">
              {weather.wind_speed_kmh}<span className="text-[9px] font-normal">km/h</span>
            </span>
            <span className="text-[10px] text-on-surface-variant font-medium">{t.wind}</span>
          </div>
          <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-surface-container-lowest shadow-sm text-center">
            <span className="material-symbols-outlined text-[18px] text-secondary">
              rainy
            </span>
            <span className="text-lg font-headline font-bold text-on-surface mt-0.5">
              {weather.rain_probability_pct}%
            </span>
            <span className="text-[10px] text-on-surface-variant font-medium">Rain Prob</span>
          </div>
        </div>
      </div>

      {/* 4. Primary Voice Search Trigger Bar */}
      <button
        type="button"
        onClick={onVoiceSearchClick}
        className="w-full min-h-[56px] rounded-2xl bg-surface-container-lowest p-2 pl-3 pr-2 flex items-center justify-between shadow-tactile-lg border border-outline-variant/40 active:translate-y-0.5 active:shadow-tactile transition-all text-left group"
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-full bg-primary text-on-primary shrink-0 shadow-sm group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-[24px]">
              mic
            </span>
            <span className="absolute inset-0 rounded-full bg-secondary-container opacity-40 animate-ping" />
          </div>
          <div className="flex flex-col min-w-0 pr-2">
            <span className="text-xs font-headline text-primary font-bold flex items-center gap-1">
              {t.voiceSearchTitle}
            </span>
            <span className="text-xs text-on-surface-variant truncate">
              {t.voiceSearchPlaceholder}
            </span>
          </div>
        </div>
        <div className="px-3 py-1.5 rounded-xl bg-surface-container-high text-primary text-xs font-headline font-bold shrink-0">
          {t.askAi}
        </div>
      </button>

      {/* 5. SIGNATURE CENTERPIECE: TODAY'S SMART AI ACTIONS */}
      <div className="rounded-2xl bg-surface-container-lowest p-4 shadow-tactile border border-outline-variant/40 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">
                psychology
              </span>
            </div>
            <div>
              <h2 className="font-headline font-bold text-base text-primary tracking-tight">
                {t.todayFarmAi}
              </h2>
              <span className="text-[11px] text-on-surface-variant font-medium">
                Unified Agronomic Decision Engine
              </span>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container font-headline text-xs font-bold">
            {actionPlan.length} Tasks
          </span>
        </div>

        {/* 4 Risk Status Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          <div className="p-2.5 rounded-xl bg-surface-container flex flex-col justify-between">
            <span className="text-[10px] font-headline font-medium text-on-surface-variant">
              {t.diseaseRisk}
            </span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs font-headline font-bold">{risks.disease_risk}</span>
              <span className={`w-3 h-3 rounded-full ${getRiskColor(risks.disease_risk)}`} />
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-surface-container flex flex-col justify-between">
            <span className="text-[10px] font-headline font-medium text-on-surface-variant">
              {t.waterStress}
            </span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs font-headline font-bold">{risks.water_stress}</span>
              <span className={`w-3 h-3 rounded-full ${getRiskColor(risks.water_stress)}`} />
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-surface-container flex flex-col justify-between">
            <span className="text-[10px] font-headline font-medium text-on-surface-variant">
              {t.heatStress}
            </span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs font-headline font-bold">{risks.heat_stress}</span>
              <span className={`w-3 h-3 rounded-full ${getRiskColor(risks.heat_stress)}`} />
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-surface-container flex flex-col justify-between">
            <span className="text-[10px] font-headline font-medium text-on-surface-variant">
              {t.rainfallRisk}
            </span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs font-headline font-bold">{risks.rainfall_risk}</span>
              <span className={`w-3 h-3 rounded-full ${getRiskColor(risks.rainfall_risk)}`} />
            </div>
          </div>
        </div>

        {/* 4-Step Personalized Action Plan List */}
        <div className="flex flex-col gap-2.5 mt-1">
          {actionPlan.map((action: any, idx: number) => (
            <div key={idx} className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/30 flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center shrink-0 text-xs font-headline font-bold mt-0.5">
                {action.step}
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-headline font-bold text-on-surface">
                    {action.title}
                  </span>
                  <span className="text-[10px] font-headline px-1.5 py-0.2 rounded bg-surface-container-high text-primary font-semibold">
                    {action.badge}
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant mt-0.5 leading-snug">
                  {action.action}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Vital Field Telemetry (2x2 Grid) */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between px-1">
          <h2 className="font-headline text-sm font-bold text-on-surface tracking-tight">
            {t.fieldTelemetry}
          </h2>
          <span className="text-xs font-headline text-primary font-bold flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">sensors</span>
            Connected
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Soil Moisture */}
          <div className="rounded-2xl bg-surface-container-lowest p-3.5 shadow-tactile border border-outline-variant/30 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-lg bg-primary-fixed text-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">opacity</span>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-headline font-bold bg-secondary-container text-on-secondary-container uppercase">
                {t.optimal}
              </span>
            </div>
            <div>
              <span className="text-xs text-on-surface-variant font-medium block">{t.soilMoisture}</span>
              <div className="flex items-baseline gap-1 my-0.5">
                <span className="text-xl font-headline font-bold text-on-surface">42%</span>
                <span className="text-xs text-on-surface-variant">VWC</span>
              </div>
              <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden my-1">
                <div className="bg-primary h-full rounded-full" style={{ width: '42%' }} />
              </div>
              <p className="text-[11px] text-on-surface font-medium leading-tight">Next irrigation in 3 days</p>
            </div>
          </div>

          {/* NPK Nutrients */}
          <div className="rounded-2xl bg-surface-container-lowest p-3.5 shadow-tactile border border-outline-variant/30 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-lg bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">science</span>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-headline font-bold bg-tertiary-container/20 text-tertiary uppercase">
                {t.needPhosphorus}
              </span>
            </div>
            <div>
              <span className="text-xs text-on-surface-variant font-medium block">{t.npkBalance}</span>
              <div className="flex items-baseline gap-1 my-0.5">
                <span className="text-sm font-headline font-bold text-on-surface">N: Good</span>
                <span className="text-xs text-tertiary font-bold">• P: Low</span>
              </div>
              <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden my-1 flex gap-0.5">
                <div className="bg-primary h-full rounded-full" style={{ width: '50%' }} />
                <div className="bg-tertiary-container h-full rounded-full" style={{ width: '25%' }} />
                <div className="bg-secondary-fixed-dim h-full rounded-full" style={{ width: '25%' }} />
              </div>
              <p className="text-[11px] text-tertiary font-semibold leading-tight">+8kg/acre recommended</p>
            </div>
          </div>

          {/* Growth Stage */}
          <div className="rounded-2xl bg-surface-container-lowest p-3.5 shadow-tactile border border-outline-variant/30 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-lg bg-secondary-container text-on-secondary-container flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">nest_eco_leaf</span>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-headline font-bold bg-surface-container-highest text-primary">
                {t.healthy}
              </span>
            </div>
            <div>
              <span className="text-xs text-on-surface-variant font-medium block">{farm.primary_crop} {t.cropStage}</span>
              <div className="flex items-baseline gap-1 my-0.5">
                <span className="text-xl font-headline font-bold text-primary">Day 42</span>
                <span className="text-xs text-on-surface-variant">/ 110</span>
              </div>
              <div className="flex items-center gap-1 my-1">
                <span className="h-1.5 flex-1 rounded-full bg-primary" />
                <span className="h-1.5 flex-1 rounded-full bg-primary" />
                <span className="h-1.5 flex-1 rounded-full bg-secondary-fixed" />
                <span className="h-1.5 flex-1 rounded-full bg-surface-container-highest" />
              </div>
              <p className="text-[11px] text-on-surface font-medium leading-tight">Vegetative, healthy canopy</p>
            </div>
          </div>

          {/* Pest / Disease Risk */}
          <div className="rounded-2xl bg-surface-container-lowest p-3.5 shadow-tactile border border-outline-variant/30 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-lg bg-error-container/60 text-error flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">pest_control</span>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-headline font-bold bg-error text-white uppercase">
                Alert
              </span>
            </div>
            <div>
              <span className="text-xs text-on-surface-variant font-medium block">{t.pestRisk}</span>
              <div className="flex items-baseline gap-1 my-0.5">
                <span className="text-xl font-headline font-bold text-error">High</span>
                <span className="text-xs text-on-surface-variant">Early Blight</span>
              </div>
              <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden my-1">
                <div className="bg-error h-full rounded-full" style={{ width: '80%' }} />
              </div>
              <p className="text-[11px] text-on-surface-variant font-medium leading-tight truncate">Spore alert in district</p>
            </div>
          </div>
        </div>
      </div>

      {/* 7. Latest Crop Disease Scan Card */}
      <div className="rounded-2xl bg-surface-container p-4 shadow-tactile border border-outline-variant/30 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">
              document_scanner
            </span>
            <h3 className="font-headline font-bold text-sm text-on-surface">
              {t.lastScanTitle}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('scanner')}
            className="px-3 py-1 rounded-full bg-primary text-on-primary font-headline text-xs font-bold shadow-tactile-btn active:translate-y-0.5 active:shadow-none transition-all flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[14px]">photo_camera</span>
            {lastScan?.disease ? t.rescan : (language === 'mr' ? 'स्कॅन करा' : language === 'hi' ? 'स्कैन करें' : 'Scan Leaf')}
          </button>
        </div>

        {lastScan?.disease ? (
          <div className="p-3 rounded-xl bg-surface-container-lowest flex items-center gap-3.5 shadow-sm">
            {lastScan.image_url ? (
              <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-surface-container ring-1 ring-primary/20">
                <img
                  src={lastScan.image_url}
                  alt="Scan thumbnail"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : null}
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="font-headline font-bold text-sm text-on-surface truncate">
                  {lastScan.crop ? `${lastScan.crop} — ` : ''}{language === 'mr' ? lastScan.disease_marathi || lastScan.disease : language === 'hi' ? lastScan.disease_hindi || lastScan.disease : lastScan.disease}
                </span>
                {lastScan.confidence ? (
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-headline font-bold bg-secondary-container text-on-secondary-container">
                    {Math.round(lastScan.confidence * 100)}% Match
                  </span>
                ) : null}
              </div>
              <p className="text-xs text-on-surface-variant mt-0.5 line-clamp-1">
                {lastScan.symptoms?.[0] || ""}
              </p>
              <span className="text-[10px] text-on-surface-variant font-medium mt-1">
                Scanned: {lastScan.scanned_at || "Recent"}
              </span>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-surface-container-lowest flex flex-col items-center justify-center text-center gap-2 border border-dashed border-outline-variant/60">
            <span className="material-symbols-outlined text-[28px] text-primary/60">
              add_a_photo
            </span>
            <p className="text-xs text-on-surface-variant font-medium max-w-xs">
              {language === 'mr'
                ? 'अद्याप कोणतेही पीक स्कॅन केलेले नाही. पानाचा फोटो काढून रोग निदान करण्यासाठी स्कॅनर वापरा.'
                : language === 'hi'
                ? 'अभी तक कोई फसल स्कैन नहीं की गई है। पत्तियों का फोटो लेकर रोग जांचने के लिए स्कैनर का उपयोग करें।'
                : 'No crop disease scans recorded yet. Use the scanner to take a leaf photo for instant AI diagnosis.'}
            </p>
            <button
              type="button"
              onClick={() => onNavigate('scanner')}
              className="mt-1 px-3 py-1.5 rounded-lg bg-surface-container-high text-primary font-headline text-xs font-bold hover:bg-surface-container-highest transition-colors"
            >
              {language === 'mr' ? 'नवीन स्कॅन करा' : language === 'hi' ? 'नया स्कैन करें' : 'Scan Leaf Now'}
            </button>
          </div>
        )}
      </div>

      {/* 8. Crop Health Trend Interactive Chart (Recharts) */}
      <div className="rounded-2xl bg-surface-container-lowest p-4 shadow-tactile border border-outline-variant/30 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[20px] text-primary">
              monitoring
            </span>
            <h3 className="font-headline font-bold text-sm text-on-surface">
              Crop Health & Disease Risk Trend (30 Days)
            </h3>
          </div>
          <span className="text-[10px] font-headline text-secondary font-bold">
            Telemetry Synced
          </span>
        </div>

        <div className="w-full h-44 mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={healthTrend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorHealth" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1b5e20" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#1b5e20" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ba1a1a" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ba1a1a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#dae5dc" opacity={0.6} />
              <XAxis dataKey="day" stroke="#717a6d" fontSize={10} tickLine={false} />
              <YAxis stroke="#717a6d" fontSize={10} domain={[0, 100]} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #dae5dc',
                  fontSize: '11px',
                  fontFamily: 'Space Grotesk'
                }}
              />
              <Area type="monotone" dataKey="health_index" name="Crop Health" stroke="#1b5e20" strokeWidth={2.5} fillOpacity={1} fill="url(#colorHealth)" />
              <Area type="monotone" dataKey="disease_risk" name="Disease Risk" stroke="#ba1a1a" strokeWidth={2} strokeDasharray="4 4" fillOpacity={1} fill="url(#colorRisk)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
