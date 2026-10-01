import React, { useState } from 'react';
import { Language, User, Farm } from '../types';
import { TRANSLATIONS } from '../translations';
import { api } from '../api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onAuthSuccess: (user: User, farm?: Farm) => void;
  targetActionLabel?: string;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  language,
  onLanguageChange,
  onAuthSuccess,
  targetActionLabel,
  initialMode = 'login'
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State - ALL BLANK, user will enter their own info
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [location, setLocation] = useState<string>('');
  const [primaryCrop, setPrimaryCrop] = useState<string>('');

  const t = TRANSLATIONS[language];

  if (!isOpen) return null;

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      if (mode === 'login') {
        const res = await api.login(email.trim(), password);
        const meData = await api.getMe();
        const firstFarm = meData?.farms && meData.farms.length > 0 ? meData.farms[0] : undefined;
        onAuthSuccess(res.user || meData, firstFarm);
        onClose();
      } else {
        // Register new user
        if (!fullName.trim()) {
          throw new Error(
            language === 'mr'
              ? 'कृपया पूर्ण नाव प्रविष्ट करा.'
              : language === 'hi'
              ? 'कृपया पूरा नाम दर्ज करें।'
              : 'Please enter your full name.'
          );
        }
        if (!email.trim()) {
          throw new Error(
            language === 'mr'
              ? 'कृपया ईमेल प्रविष्ट करा.'
              : language === 'hi'
              ? 'कृपया ईमेल दर्ज करें।'
              : 'Please enter your email.'
          );
        }
        if (password.length < 6) {
          throw new Error(
            language === 'mr'
              ? 'पासवर्ड किमान ६ अक्षरांचा असावा.'
              : language === 'hi'
              ? 'पासवर्ड कम से कम ६ अक्षरों का होना चाहिए।'
              : 'Password must be at least 6 characters.'
          );
        }

        const res = await api.register({
          email: email.trim(),
          password,
          full_name: fullName.trim(),
          phone: phone.trim() || undefined,
          preferred_language: language
        });

        // Try to fetch updated user & farm
        const meData = await api.getMe();
        let firstFarm = meData?.farms && meData.farms.length > 0 ? meData.farms[0] : undefined;
        if (!firstFarm) {
          firstFarm = {
            id: 1,
            farm_name: `${fullName.trim()}'s Farm`,
            location: location.trim(),
            area_acres: 0,
            primary_crop: primaryCrop || "",
            crop_stage: "",
            soil_type: "",
            irrigation_method: ""
          };
        }
        onAuthSuccess(res.user || meData, firstFarm);
        onClose();
      }
    } catch (err: any) {
      setErrorMessage(err.message || (language === 'mr' ? 'प्रमाणीकरण अयशस्वी. कृपया तपशील तपासा.' : 'Authentication failed. Please check details.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md animate-fade-in">
      <div className="bg-[#fbfcfa] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-outline-variant/40 flex flex-col gap-4 max-h-[92vh] overflow-y-auto">
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3 border-b border-outline-variant/20 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-white shadow-sm shrink-0">
              <span className="material-symbols-outlined text-[24px]">agriculture</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="font-headline font-bold text-base sm:text-lg text-primary leading-tight">
                  KrishiCopilot
                </h2>
                <span className="text-[10px] font-headline font-bold uppercase px-1.5 py-0.5 rounded bg-secondary-container text-on-secondary-container">
                  Auth
                </span>
              </div>
              <p className="text-xs text-on-surface-variant font-medium">
                {t.authTitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Language Switcher */}
            <div className="flex items-center bg-surface-container-high rounded-full p-0.5 shadow-sm border border-outline-variant/30 text-[11px]">
              <button
                type="button"
                onClick={() => onLanguageChange('mr')}
                className={`px-2 py-0.5 rounded-full font-bold transition-all ${
                  language === 'mr' ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant'
                }`}
              >
                MR
              </button>
              <button
                type="button"
                onClick={() => onLanguageChange('hi')}
                className={`px-2 py-0.5 rounded-full font-bold transition-all ${
                  language === 'hi' ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant'
                }`}
              >
                HI
              </button>
              <button
                type="button"
                onClick={() => onLanguageChange('en')}
                className={`px-2 py-0.5 rounded-full font-bold transition-all ${
                  language === 'en' ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant'
                }`}
              >
                EN
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Action Context Banner if triggered by a specific button */}
        {targetActionLabel && (
          <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-secondary-container/40 border border-secondary-container text-xs text-primary font-medium">
            <span className="material-symbols-outlined text-[18px] shrink-0 text-secondary">
              lock
            </span>
            <span>{targetActionLabel} — {t.loginRequiredNote}</span>
          </div>
        )}

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-2 p-1 rounded-2xl bg-surface-container-high border border-outline-variant/30 text-xs font-headline font-bold">
          <button
            type="button"
            onClick={() => { setMode('login'); setErrorMessage(null); }}
            className={`py-2 rounded-xl transition-all ${
              mode === 'login'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            {t.login}
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setErrorMessage(null); }}
            className={`py-2 rounded-xl transition-all ${
              mode === 'register'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            {t.register}
          </button>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-error-container/60 border border-error text-error text-xs font-medium flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Main Auth Form - Clean blank inputs */}
        <form onSubmit={handleFormSubmit} className="flex flex-col gap-3 text-xs">
          {mode === 'register' && (
            <>
              {/* Full Name */}
              <div className="flex flex-col gap-1">
                <label className="font-headline font-bold text-on-surface">
                  {t.fullName} *
                </label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[18px]">
                    person
                  </span>
                  <input
                    type="text"
                    required
                    placeholder={language === 'mr' ? 'पूर्ण नाव प्रविष्ट करा' : language === 'hi' ? 'पूरा नाम दर्ज करें' : 'Enter your full name'}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface font-medium outline-none focus:border-primary text-xs"
                  />
                </div>
              </div>

              {/* Mobile Phone */}
              <div className="flex flex-col gap-1">
                <label className="font-headline font-bold text-on-surface">
                  {t.phone}
                </label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[18px]">
                    call
                  </span>
                  <input
                    type="tel"
                    placeholder="+91 XXXXX XXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface font-medium outline-none focus:border-primary text-xs"
                  />
                </div>
              </div>

              {/* Location & Crop (in grid) */}
              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="font-headline font-bold text-on-surface">
                    {t.location}
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder={language === 'mr' ? 'गाव, जिल्हा, राज्य' : language === 'hi' ? 'स्थान (जिला, राज्य)' : 'Location (District, State)'}
                    className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface font-medium outline-none focus:border-primary text-xs"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-headline font-bold text-on-surface">
                    {t.crop}
                  </label>
                  <select
                    value={primaryCrop}
                    onChange={(e) => setPrimaryCrop(e.target.value)}
                    className="w-full px-2 py-2 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface font-medium outline-none focus:border-primary text-xs"
                  >
                    <option value="">{language === 'mr' ? '-- मुख्य पीक निवडा --' : language === 'hi' ? '-- फसल चुनें --' : '-- Select Primary Crop --'}</option>
                    <option value="Tomato">Tomato (टोमॅटो)</option>
                    <option value="Onion">Onion (कांदा)</option>
                    <option value="Cotton">Cotton (कापूस)</option>
                    <option value="Soybean">Soybean (सोयाबीन)</option>
                    <option value="Wheat">Wheat (गहू)</option>
                    <option value="Rice">Rice (भात / धान)</option>
                    <option value="Sugarcane">Sugarcane (ऊस)</option>
                    <option value="Chilli">Chilli (मिरची)</option>
                    <option value="Maize">Maize (मका)</option>
                  </select>
                </div>
              </div>
            </>
          )}

          {/* Email / Username */}
          <div className="flex flex-col gap-1">
            <label className="font-headline font-bold text-on-surface">
              {t.enterEmailOrPhone} *
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[18px]">
                mail
              </span>
              <input
                type="email"
                required
                placeholder={language === 'mr' ? 'ईमेल पत्ता प्रविष्ट करा' : language === 'hi' ? 'ईमेल दर्ज करें' : 'Enter your email'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface font-medium outline-none focus:border-primary text-xs"
              />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1">
            <label className="font-headline font-bold text-on-surface">
              {t.password} *
            </label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[18px]">
                key
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface font-medium outline-none focus:border-primary text-xs"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 rounded-2xl bg-primary text-on-primary font-headline font-bold text-sm shadow-tactile-btn active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <span className="animate-spin text-sm">⏳</span>
                <span>{t.analyzing || "Processing..."}</span>
              </>
            ) : (
              <>
                <span>{mode === 'login' ? t.signIn : t.register}</span>
                <span className="material-symbols-outlined text-[18px]">
                  check_circle
                </span>
              </>
            )}
          </button>
        </form>

        {/* Footer switch prompt */}
        <div className="text-center pt-1 border-t border-outline-variant/20">
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login');
              setErrorMessage(null);
            }}
            className="text-xs text-primary font-bold hover:underline"
          >
            {mode === 'login' ? t.dontHaveAccount : t.alreadyHaveAccount}
          </button>
        </div>
      </div>
    </div>
  );
};
