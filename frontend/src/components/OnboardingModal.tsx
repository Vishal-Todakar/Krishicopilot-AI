import React, { useState, useRef } from 'react';
import { Farm, Language, User } from '../types';
import { TRANSLATIONS } from '../translations';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  farm: Farm;
  user: User;
  language: Language;
  onSave: (updatedFarm: Farm, updatedUser: User) => void;
  onLogout: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  farm,
  user,
  language,
  onSave,
  onLogout
}) => {
  const t = TRANSLATIONS[language];
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active sub-tab inside the modal
  const [activeTab, setActiveTab] = useState<'personal' | 'farm'>('personal');

  // Personal Info State - completely empty defaults if not yet set by user
  const [avatarUrl, setAvatarUrl] = useState<string>(user.avatar_url || '');
  const [fullName, setFullName] = useState<string>(user.full_name || '');
  const [phone, setPhone] = useState<string>(user.phone || '');
  const [email, setEmail] = useState<string>(user.email || '');
  const [village, setVillage] = useState<string>(user.village || '');
  const [district, setDistrict] = useState<string>(user.district || '');
  const [stateName, setStateName] = useState<string>(user.state || '');
  const [bio, setBio] = useState<string>(user.bio || '');
  const [preferredLang, setPreferredLang] = useState<Language>(user.preferred_language || language);

  // Farm Info State - empty defaults if not yet set by user
  const [farmName, setFarmName] = useState<string>(farm.farm_name || '');
  const [location, setLocation] = useState<string>(farm.location || '');
  const [areaAcres, setAreaAcres] = useState<number | string>(farm.area_acres || '');
  const [primaryCrop, setPrimaryCrop] = useState<string>(farm.primary_crop || '');
  const [soilType, setSoilType] = useState<string>(farm.soil_type || '');
  const [cropStage, setCropStage] = useState<string>(farm.crop_stage || '');
  const [irrigationMethod, setIrrigationMethod] = useState<string>(farm.irrigation_method || '');

  const [isSavedSuccess, setIsSavedSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  // Handle uploading picture from device
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert(language === 'mr' ? 'फोटोचा आकार ५ MB पेक्षा कमी असावा.' : 'File size must be under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatarUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setAvatarUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedUser: User = {
      ...user,
      full_name: fullName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      preferred_language: preferredLang,
      avatar_url: avatarUrl,
      village: village.trim(),
      district: district.trim(),
      state: stateName.trim(),
      bio: bio.trim()
    };

    const updatedFarm: Farm = {
      ...farm,
      farm_name: farmName.trim(),
      location: location.trim() || [district.trim(), stateName.trim()].filter(Boolean).join(', '),
      area_acres: Number(areaAcres) || 0,
      primary_crop: primaryCrop,
      soil_type: soilType,
      crop_stage: cropStage,
      irrigation_method: irrigationMethod
    };

    onSave(updatedFarm, updatedUser);
    setIsSavedSuccess(true);
    setTimeout(() => {
      setIsSavedSuccess(false);
      onClose();
    }, 800);
  };

  const locationSummary = [village.trim(), district.trim(), stateName.trim()].filter(Boolean).join(', ');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-md animate-fade-in">
      <div className="bg-[#fbfcfa] rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-outline-variant/40 flex flex-col gap-4 max-h-[92vh] overflow-y-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-primary text-on-primary flex items-center justify-center shadow-sm shrink-0">
              <span className="material-symbols-outlined text-[24px]">
                manage_accounts
              </span>
            </div>
            <div>
              <h2 className="font-headline font-bold text-base sm:text-lg text-primary leading-tight">
                {t.farmProfile}
              </h2>
              <p className="text-xs text-on-surface-variant font-medium">
                {fullName || (language === 'mr' ? 'वैयक्तिक माहिती' : 'Personal Profile')} {farmName ? `• ${farmName}` : ''}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Profile Picture Upload Section (No presets) */}
        <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-sm flex flex-col sm:flex-row items-center gap-4">
          {/* Avatar Preview with Camera Edit Badge */}
          <div className="relative group shrink-0">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full ring-4 ring-primary/20 overflow-hidden shadow-tactile bg-surface-container-high flex items-center justify-center">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={fullName || 'Avatar'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-surface-container text-on-surface-variant/40">
                  <span className="material-symbols-outlined text-[44px]">
                    account_circle
                  </span>
                  <span className="text-[10px] font-bold text-on-surface-variant/70 -mt-1">
                    {language === 'mr' ? 'फोटो नाही' : language === 'hi' ? 'फोटो नहीं' : 'No Photo'}
                  </span>
                </div>
              )}
            </div>

            {/* Clickable camera badge */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all"
              title={t.uploadPhoto || "Upload Photo"}
            >
              <span className="material-symbols-outlined text-[18px]">
                photo_camera
              </span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Picture Actions */}
          <div className="flex-1 flex flex-col gap-2 text-center sm:text-left">
            <div>
              <span className="font-headline font-bold text-sm text-on-surface">
                {fullName || (language === 'mr' ? 'तुमचे नाव प्रविष्ट करा' : 'Enter your name')}
              </span>
              <p className="text-[11px] text-on-surface-variant">
                {bio || (language === 'mr' ? 'शेतकरी परिचय' : 'Farmer profile')} {locationSummary ? `• ${locationSummary}` : ''}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-2 rounded-xl bg-primary text-on-primary font-headline font-bold text-xs flex items-center gap-1.5 shadow-tactile-btn active:translate-y-0.5 transition-all"
              >
                <span className="material-symbols-outlined text-[16px]">upload</span>
                <span>{t.uploadPhoto}</span>
              </button>
              {avatarUrl && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="px-3 py-2 rounded-xl bg-surface-container-high text-error font-headline font-bold text-xs hover:bg-error-container/40 active:translate-y-0.5 transition-colors flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[14px]">delete</span>
                  <span>{t.removePhoto}</span>
                </button>
              )}
            </div>
            <p className="text-[10px] text-on-surface-variant/70">
              {language === 'mr' ? 'JPG, PNG किंवा WebP (कमाल ५ MB)' : 'JPG, PNG, or WebP (Max 5MB)'}
            </p>
          </div>
        </div>

        {/* Modal Tab Switcher: Personal Info vs Farm Info */}
        <div className="grid grid-cols-2 p-1 rounded-2xl bg-surface-container-high border border-outline-variant/30 text-xs font-headline font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('personal')}
            className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'personal'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">person</span>
            <span>{t.personalInfo}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('farm')}
            className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'farm'
                ? 'bg-primary text-on-primary shadow-sm'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">agriculture</span>
            <span>{t.farmDetails}</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 text-xs">
          {activeTab === 'personal' && (
            <div className="flex flex-col gap-3">
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
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={language === 'mr' ? 'तुमचे पूर्ण नाव' : language === 'hi' ? 'अपना पूरा नाम' : 'Enter your full name'}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface font-medium outline-none focus:border-primary text-xs"
                    required
                  />
                </div>
              </div>

              {/* Phone and Email (2 columns) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 XXXXX XXXXX"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface font-medium outline-none focus:border-primary text-xs"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-headline font-bold text-on-surface">
                    {t.email}
                  </label>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[18px]">
                      mail
                    </span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="farmer@example.com"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface font-medium outline-none focus:border-primary text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Village, District, State */}
              <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="font-headline font-bold text-on-surface">
                    {t.village}
                  </label>
                  <input
                    type="text"
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    placeholder={language === 'mr' ? 'गाव / वाडी' : language === 'hi' ? 'गांव' : 'Village'}
                    className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface font-medium outline-none focus:border-primary text-xs"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-headline font-bold text-on-surface">
                    {t.district}
                  </label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder={language === 'mr' ? 'जिल्हा' : language === 'hi' ? 'जिला' : 'District'}
                    className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface font-medium outline-none focus:border-primary text-xs"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-headline font-bold text-on-surface">
                    {t.state}
                  </label>
                  <input
                    type="text"
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    placeholder={language === 'mr' ? 'राज्य' : language === 'hi' ? 'राज्य' : 'State'}
                    className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface font-medium outline-none focus:border-primary text-xs"
                  />
                </div>
              </div>

              {/* Bio & Preferred Language */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-headline font-bold text-on-surface">
                    {t.bio}
                  </label>
                  <input
                    type="text"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder={language === 'mr' ? 'शेतकरी परिचय / पिकांविषयी नोंद' : 'Notes about your crops or farming...'}
                    className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface font-medium outline-none focus:border-primary text-xs"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-headline font-bold text-on-surface">
                    Language (भाषा)
                  </label>
                  <select
                    value={preferredLang}
                    onChange={(e) => setPreferredLang(e.target.value as Language)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface font-medium outline-none focus:border-primary text-xs"
                  >
                    <option value="mr">मराठी (Marathi)</option>
                    <option value="hi">हिंदी (Hindi)</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'farm' && (
            <div className="flex flex-col gap-3">
              {/* Farm Name */}
              <div className="flex flex-col gap-1">
                <label className="font-headline font-bold text-on-surface">
                  {t.farmName}
                </label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[18px]">
                    agriculture
                  </span>
                  <input
                    type="text"
                    value={farmName}
                    onChange={(e) => setFarmName(e.target.value)}
                    placeholder={language === 'mr' ? 'शेताचे नाव (उदा. तोडकर फार्म)' : 'Farm Name'}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface font-medium outline-none focus:border-primary text-xs"
                  />
                </div>
              </div>

              {/* Location */}
              <div className="flex flex-col gap-1">
                <label className="font-headline font-bold text-on-surface">
                  {t.location}
                </label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[18px]">
                    location_on
                  </span>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder={language === 'mr' ? 'गाव, जिल्हा, राज्य' : 'Location (Village, District)'}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface font-medium outline-none focus:border-primary text-xs"
                  />
                </div>
              </div>

              {/* Area & Primary Crop */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-headline font-bold text-on-surface">
                    {t.area}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={areaAcres}
                    onChange={(e) => setAreaAcres(e.target.value)}
                    placeholder="0.0"
                    className="p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface font-medium outline-none focus:border-primary text-xs"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-headline font-bold text-on-surface">
                    {t.crop}
                  </label>
                  <select
                    value={primaryCrop}
                    onChange={(e) => setPrimaryCrop(e.target.value)}
                    className="p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface font-medium outline-none focus:border-primary text-xs"
                  >
                    <option value="">{language === 'mr' ? '-- मुख्य पीक निवडा --' : '-- Select Crop --'}</option>
                    <option value="Tomato">Tomato (टोमॅटो)</option>
                    <option value="Wheat">Wheat (गेहूं / गहू)</option>
                    <option value="Mustard">Mustard (सरसों / मोहरी)</option>
                    <option value="Onion">Onion (कांदा / प्याज)</option>
                    <option value="Cotton">Cotton (कापूस)</option>
                    <option value="Soybean">Soybean (सोयाबीन)</option>
                    <option value="Rice">Rice (भात / धान)</option>
                    <option value="Sugarcane">Sugarcane (ऊस)</option>
                    <option value="Chilli">Chilli (मिरची)</option>
                    <option value="Maize">Maize (मका)</option>
                  </select>
                </div>
              </div>

              {/* Soil Type, Stage & Irrigation */}
              <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col gap-1">
                  <label className="font-headline font-bold text-on-surface">
                    {t.soil}
                  </label>
                  <select
                    value={soilType}
                    onChange={(e) => setSoilType(e.target.value)}
                    className="p-2 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface font-medium outline-none focus:border-primary text-xs"
                  >
                    <option value="">{language === 'mr' ? '-- निवडा --' : '-- Select --'}</option>
                    <option value="Black Soil">Black Soil (काळी)</option>
                    <option value="Red Soil">Red Soil (तांबडी)</option>
                    <option value="Sandy Loam">Sandy Loam (वालुका)</option>
                    <option value="Alluvial Soil">Alluvial (गाळाची)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-headline font-bold text-on-surface">
                    {t.stage}
                  </label>
                  <select
                    value={cropStage}
                    onChange={(e) => setCropStage(e.target.value)}
                    className="p-2 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface font-medium outline-none focus:border-primary text-xs"
                  >
                    <option value="">{language === 'mr' ? '-- निवडा --' : '-- Select --'}</option>
                    <option value="Seedling">Seedling (रोप)</option>
                    <option value="Vegetative">Vegetative (वाढ)</option>
                    <option value="Flowering">Flowering (फुल)</option>
                    <option value="Fruiting">Fruiting (फळ)</option>
                    <option value="Maturity">Maturity (कापणी)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-headline font-bold text-on-surface">
                    {t.irrigationMethod}
                  </label>
                  <select
                    value={irrigationMethod}
                    onChange={(e) => setIrrigationMethod(e.target.value)}
                    className="p-2 rounded-xl bg-surface-container-low border border-outline-variant/40 text-on-surface font-medium outline-none focus:border-primary text-xs"
                  >
                    <option value="">{language === 'mr' ? '-- निवडा --' : '-- Select --'}</option>
                    <option value="Drip Irrigation">Drip (ठिबक)</option>
                    <option value="Sprinkler">Sprinkler (तुषार)</option>
                    <option value="Flood / Furrow">Flood (पाटपाणी)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Success Banner */}
          {isSavedSuccess && (
            <div className="p-2.5 rounded-xl bg-secondary-container text-primary font-bold text-xs flex items-center justify-center gap-1.5 animate-fade-in">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              <span>{language === 'mr' ? 'माहिती व बदल यशस्वीरीत्या जतन झाले!' : language === 'hi' ? 'जानकारी और बदलाव सुरक्षित कर लिए गए हैं!' : 'Profile & Changes Saved Successfully!'}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-3 border-t border-outline-variant/30 mt-1">
            <button
              type="submit"
              className="flex-1 py-3 rounded-2xl bg-primary text-on-primary font-headline font-bold text-sm shadow-tactile-btn active:translate-y-0.5 transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">save</span>
              <span>{t.saveProfile}</span>
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="px-4 py-3 rounded-2xl bg-error-container/40 text-error hover:bg-error-container/70 font-headline font-bold text-xs active:translate-y-0.5 transition-all flex items-center gap-1.5"
              title="Log Out"
            >
              <span className="material-symbols-outlined text-[16px]">logout</span>
              <span>{t.logout}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
