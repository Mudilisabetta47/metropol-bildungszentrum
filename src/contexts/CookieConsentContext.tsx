import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface ConsentSettings {
  necessary: boolean; // Always true, required for functionality
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

interface CookieConsentContextType {
  consentGiven: boolean;
  settings: ConsentSettings;
  showBanner: boolean;
  acceptAll: () => void;
  rejectAll: () => void;
  saveSettings: (settings: Partial<ConsentSettings>) => void;
  openSettings: () => void;
  closeBanner: () => void;
}

const defaultSettings: ConsentSettings = {
  necessary: true,
  analytics: false,
  marketing: false,
  preferences: false,
};

const CookieConsentContext = createContext<CookieConsentContextType | undefined>(undefined);

const CONSENT_STORAGE_KEY = "metropol_cookie_consent";
const CONSENT_SETTINGS_KEY = "metropol_cookie_settings";

export function CookieConsentProvider({ children }: { children: React.ReactNode }) {
  const [consentGiven, setConsentGiven] = useState(false);
  const [settings, setSettings] = useState<ConsentSettings>(defaultSettings);
  const [showBanner, setShowBanner] = useState(false);

  // Load consent from localStorage on mount
  useEffect(() => {
    const storedConsent = localStorage.getItem(CONSENT_STORAGE_KEY);
    const storedSettings = localStorage.getItem(CONSENT_SETTINGS_KEY);

    if (storedConsent === "true" && storedSettings) {
      try {
        const parsedSettings = JSON.parse(storedSettings);
        setSettings({ ...defaultSettings, ...parsedSettings, necessary: true });
        setConsentGiven(true);
        setShowBanner(false);
      } catch {
        setShowBanner(true);
      }
    } else {
      // Show banner after a short delay for better UX
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const saveToStorage = useCallback((newSettings: ConsentSettings) => {
    localStorage.setItem(CONSENT_STORAGE_KEY, "true");
    localStorage.setItem(CONSENT_SETTINGS_KEY, JSON.stringify(newSettings));
    setSettings(newSettings);
    setConsentGiven(true);
    setShowBanner(false);

    // Dispatch event for tracking scripts to listen to
    window.dispatchEvent(new CustomEvent("cookieConsentChanged", { detail: newSettings }));
  }, []);

  const acceptAll = useCallback(() => {
    const allAccepted: ConsentSettings = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
    };
    saveToStorage(allAccepted);
  }, [saveToStorage]);

  const rejectAll = useCallback(() => {
    const allRejected: ConsentSettings = {
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false,
    };
    saveToStorage(allRejected);
  }, [saveToStorage]);

  const saveSettings = useCallback((partialSettings: Partial<ConsentSettings>) => {
    const newSettings: ConsentSettings = {
      ...settings,
      ...partialSettings,
      necessary: true, // Always keep necessary cookies
    };
    saveToStorage(newSettings);
  }, [settings, saveToStorage]);

  const openSettings = useCallback(() => {
    setShowBanner(true);
  }, []);

  const closeBanner = useCallback(() => {
    if (consentGiven) {
      setShowBanner(false);
    }
  }, [consentGiven]);

  return (
    <CookieConsentContext.Provider
      value={{
        consentGiven,
        settings,
        showBanner,
        acceptAll,
        rejectAll,
        saveSettings,
        openSettings,
        closeBanner,
      }}
    >
      {children}
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsent() {
  const context = useContext(CookieConsentContext);
  if (context === undefined) {
    throw new Error("useCookieConsent must be used within a CookieConsentProvider");
  }
  return context;
}
