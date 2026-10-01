import React, { useState, useEffect } from 'react';
import { Language, Farm, User, CropScanResult } from './types';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { DashboardView } from './components/DashboardView';
import { CropScannerView } from './components/CropScannerView';
import { KrishiAssistantView } from './components/KrishiAssistantView';
import { MandiResourcesView } from './components/MandiResourcesView';
import { LandingPage } from './components/LandingPage';
import { OnboardingModal } from './components/OnboardingModal';
import { AuthModal } from './components/AuthModal';
import { api } from './api';

export const App: React.FC = () => {
  // Landing page is the initial starting page of the app
  const [currentTab, setCurrentTab] = useState<string>('landing');
  const [language, setLanguage] = useState<Language>('hi');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => api.hasAuthToken());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authTargetTab, setAuthTargetTab] = useState<string>('dashboard');
  const [authActionLabel, setAuthActionLabel] = useState<string>('');
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [welcomeToast, setWelcomeToast] = useState<string | null>(null);

  const [user, setUser] = useState<User>({
    id: 0,
    email: "",
    full_name: "",
    phone: "",
    preferred_language: "hi"
  });

  const [farm, setFarm] = useState<Farm>({
    id: 0,
    farm_name: "",
    location: "",
    area_acres: 0,
    primary_crop: "",
    crop_stage: "",
    soil_type: "",
    irrigation_method: ""
  });

  useEffect(() => {
    // If token exists, load current user & farm profile
    if (api.hasAuthToken()) {
      api.getMe().then((userData) => {
        if (userData?.full_name) {
          setUser(prev => ({
            ...prev,
            id: userData.id || prev.id,
            email: userData.email || prev.email,
            full_name: userData.full_name,
            phone: userData.phone || prev.phone,
            preferred_language: userData.preferred_language || prev.preferred_language,
            avatar_url: userData.avatar_url || prev.avatar_url,
            village: userData.village || prev.village,
            district: userData.district || prev.district,
            state: userData.state || prev.state,
            bio: userData.bio || prev.bio
          }));
          if (userData.preferred_language) {
            setLanguage(userData.preferred_language as Language);
          }
        }
        if (userData?.farms && userData.farms.length > 0) {
          setFarm(userData.farms[0]);
        }
      }).catch(() => {
        // Token might be expired or mock
      });

      // Load initial dashboard telemetry only when authenticated
      api.getDashboard().then((data) => {
        setDashboardData(data);
        if (data?.farmer?.preferred_language) {
          setLanguage(data.farmer.preferred_language as Language);
        }
        if (data?.farm) {
          setFarm(data.farm);
        }
      });
    }
  }, []);

  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang);
    setUser(prev => ({ ...prev, preferred_language: newLang }));
  };

  const handleScanSaved = (newScan: CropScanResult) => {
    // Refresh dashboard data with the latest scan
    api.getDashboard(farm.id).then(setDashboardData);
  };

  const handleSaveProfile = (updatedFarm: Farm, updatedUser: User) => {
    setFarm(updatedFarm);
    setUser(updatedUser);
    setLanguage(updatedUser.preferred_language);
    // Persist personal profile & avatar
    api.updateProfile(updatedUser).catch(() => {});
    api.updateFarm(updatedFarm.id, updatedFarm).then(() => {
      api.getDashboard(updatedFarm.id).then(setDashboardData);
    });
  };

  // Get Started clicked from landing page: trigger login if unauthenticated, else go to dashboard
  const handleGetStarted = () => {
    if (isAuthenticated) {
      setCurrentTab('dashboard');
    } else {
      setAuthTargetTab('dashboard');
      setAuthActionLabel(
        language === 'mr' ? 'थेट शेत डॅशबोर्ड पाहण्यासाठी' :
        language === 'hi' ? 'लाइव खेत डैशबोर्ड देखने के लिए' :
        'To access Live Farm Dashboard'
      );
      setIsAuthModalOpen(true);
    }
  };

  // Try Scanner clicked from landing page
  const handleTryScanner = () => {
    if (isAuthenticated) {
      setCurrentTab('scanner');
    } else {
      setAuthTargetTab('scanner');
      setAuthActionLabel(
        language === 'mr' ? 'एआय पीक रोग स्कॅनर वापरण्यासाठी' :
        language === 'hi' ? 'एआई फसल रोग स्कैनर उपयोग करने के लिए' :
        'To use AI Crop Disease Scanner'
      );
      setIsAuthModalOpen(true);
    }
  };

  // Bottom navigation tab click handler
  const handleTabChange = (targetTab: string) => {
    if (targetTab === 'landing') {
      setCurrentTab('landing');
      return;
    }
    if (!isAuthenticated) {
      setAuthTargetTab(targetTab);
      setAuthActionLabel(
        targetTab === 'dashboard' ? (language === 'mr' ? 'शेत डॅशबोर्डसाठी' : language === 'hi' ? 'खेत डैशबोर्ड के लिए' : 'For Farm Dashboard') :
        targetTab === 'scanner' ? (language === 'mr' ? 'पीक स्कॅनरसाठी' : language === 'hi' ? 'फसल स्कैनर के लिए' : 'For Crop Scanner') :
        targetTab === 'assistant' ? (language === 'mr' ? 'कृषी एआय सहाय्यकासाठी' : language === 'hi' ? 'कृषि एआई के लिए' : 'For Krishi AI Assistant') :
        (language === 'mr' ? 'बाजारभावासाठी' : language === 'hi' ? 'मंडी भाव व सहायता के लिए' : 'For Mandi & Resources')
      );
      setIsAuthModalOpen(true);
      return;
    }
    setCurrentTab(targetTab);
  };

  // Successful Login or Registration handler
  const handleAuthSuccess = (authenticatedUser: User, authenticatedFarm?: Farm) => {
    setIsAuthenticated(true);
    if (authenticatedUser) {
      setUser(authenticatedUser);
      if (authenticatedUser.preferred_language) {
        setLanguage(authenticatedUser.preferred_language as Language);
      }
    }
    if (authenticatedFarm) {
      setFarm(authenticatedFarm);
    }

    // Refresh dashboard telemetry for this farmer
    api.getDashboard(authenticatedFarm?.id).then(setDashboardData);

    // Proceed to the requested tab (defaults to dashboard or scanner)
    const destination = authTargetTab || 'dashboard';
    setCurrentTab(destination);

    // Warm welcome feedback toast
    const farmerName = authenticatedUser?.full_name || user.full_name;
    const msg = language === 'mr'
      ? `🌾 स्वागत आहे, ${farmerName}! शेत डॅशबोर्ड व एआय मार्गदर्शक कनेक्ट झाले.`
      : language === 'hi'
      ? `🌾 स्वागत है, ${farmerName}! खेत डैशबोर्ड और एआई सहायक कनेक्ट हो गए हैं।`
      : `🌾 Welcome, ${farmerName}! Live farm telemetry and AI assistant connected.`;
    setWelcomeToast(msg);
    setTimeout(() => setWelcomeToast(null), 4500);
  };

  // Logout handler
  const handleLogout = () => {
    api.logout();
    setIsAuthenticated(false);
    setUser({
      id: 0,
      email: "",
      full_name: "",
      phone: "",
      preferred_language: "hi"
    });
    setFarm({
      id: 0,
      farm_name: "",
      location: "",
      area_acres: 0,
      primary_crop: "",
      crop_stage: "",
      soil_type: "",
      irrigation_method: ""
    });
    setDashboardData(null);
    setIsOnboardingOpen(false);
    setCurrentTab('landing');
    const msg = language === 'mr'
      ? 'सत्र यशस्वीरीत्या समाप्त झाले.'
      : language === 'hi'
      ? 'सत्र समाप्त हुआ। आप लॉग आउट हो चुके हैं।'
      : 'Logged out successfully.';
    setWelcomeToast(msg);
    setTimeout(() => setWelcomeToast(null), 3500);
  };

  return (
    <div className="min-h-screen bg-[#f1fcf3] text-[#141e18] flex flex-col font-body selection:bg-secondary-container selection:text-primary">
      {/* Universal Fixed Header */}
      <Header
        currentTab={currentTab}
        language={language}
        onLanguageChange={handleLanguageChange}
        locationLabel={farm.location ? `${farm.location} • ${dashboardData?.weather?.temperature_c || 28.5}°C ${dashboardData?.weather?.condition || 'Sunny'}` : undefined}
        onProfileClick={() => setIsOnboardingOpen(true)}
        farmerName={user.full_name}
        avatarUrl={user.avatar_url}
        isAuthenticated={isAuthenticated}
        onSignInClick={() => {
          setAuthTargetTab('dashboard');
          setAuthActionLabel('');
          setIsAuthModalOpen(true);
        }}
        onNavigate={setCurrentTab}
      />

      {/* Floating Welcome / Toast Notification */}
      {welcomeToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-primary text-on-primary text-xs sm:text-sm font-headline font-bold shadow-xl border border-white/20 animate-fade-in flex items-center gap-2 max-w-md text-center">
          <span className="material-symbols-outlined text-[18px]">verified</span>
          <span>{welcomeToast}</span>
        </div>
      )}

      {/* Main View Router */}
      <main className="flex-1 w-full">
        {currentTab === 'landing' && (
          <LandingPage
            language={language}
            onGetStarted={handleGetStarted}
            onTryScanner={handleTryScanner}
            isAuthenticated={isAuthenticated}
          />
        )}

        {currentTab === 'dashboard' && (
          <DashboardView
            language={language}
            onNavigate={setCurrentTab}
            dashboardData={dashboardData}
            onVoiceSearchClick={() => setCurrentTab('assistant')}
            farmerAvatar={user.avatar_url}
            farmerName={user.full_name}
          />
        )}

        {currentTab === 'scanner' && (
          <CropScannerView
            language={language}
            onScanSaved={handleScanSaved}
            farmerName={user.full_name}
            farmDetails={farm}
          />
        )}

        {currentTab === 'assistant' && (
          <KrishiAssistantView
            language={language}
            onLanguageChange={handleLanguageChange}
            farmContext={farm}
          />
        )}

        {currentTab === 'mandi' && (
          <MandiResourcesView
            language={language}
          />
        )}
      </main>

      {/* Universal Mobile-First Bottom Navigation */}
      <Navigation
        currentTab={currentTab}
        onTabChange={handleTabChange}
        language={language}
      />

      {/* Auth / Login / Registration Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        language={language}
        onLanguageChange={handleLanguageChange}
        onAuthSuccess={handleAuthSuccess}
        targetActionLabel={authActionLabel}
      />

      {/* Farmer Profile / Onboarding & Settings Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        farm={farm}
        user={user}
        language={language}
        onSave={handleSaveProfile}
        onLogout={handleLogout}
      />
    </div>
  );
};

export default App;
