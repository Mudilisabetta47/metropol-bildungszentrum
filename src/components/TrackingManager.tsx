import { useEffect } from "react";
import { useCookieConsent } from "@/contexts/CookieConsentContext";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

interface TrackingManagerProps {
  googleAnalyticsId?: string;
  metaPixelId?: string;
}

export function TrackingManager({ googleAnalyticsId, metaPixelId }: TrackingManagerProps) {
  const { settings, consentGiven } = useCookieConsent();

  useEffect(() => {
    if (!consentGiven) return;

    // Google Analytics
    if (settings.analytics && googleAnalyticsId) {
      loadGoogleAnalytics(googleAnalyticsId);
    }

    // Meta Pixel
    if (settings.marketing && metaPixelId) {
      loadMetaPixel(metaPixelId);
    }
  }, [settings, consentGiven, googleAnalyticsId, metaPixelId]);

  // Listen for consent changes
  useEffect(() => {
    const handleConsentChange = (event: CustomEvent) => {
      const newSettings = event.detail;
      
      // Update Google Analytics consent
      if (window.gtag) {
        window.gtag("consent", "update", {
          analytics_storage: newSettings.analytics ? "granted" : "denied",
          ad_storage: newSettings.marketing ? "granted" : "denied",
        });
      }
    };

    window.addEventListener("cookieConsentChanged", handleConsentChange as EventListener);
    return () => window.removeEventListener("cookieConsentChanged", handleConsentChange as EventListener);
  }, []);

  return null;
}

function loadGoogleAnalytics(measurementId: string) {
  // Check if already loaded
  if (document.querySelector(`script[src*="googletagmanager.com/gtag"]`)) {
    return;
  }

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer?.push(arguments);
  };

  // Set default consent mode (denied until user accepts)
  window.gtag("consent", "default", {
    analytics_storage: "denied",
    ad_storage: "denied",
    wait_for_update: 500,
  });

  window.gtag("js", new Date());
  window.gtag("config", measurementId, {
    anonymize_ip: true, // Required for GDPR
  });

  // Load script
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);
}

function loadMetaPixel(pixelId: string) {
  // Check if already loaded
  if (window.fbq) {
    return;
  }

  // Create fbq function with extended properties
  interface FbqFunction {
    (...args: unknown[]): void;
    callMethod?: (...args: unknown[]) => void;
    queue: unknown[];
    loaded: boolean;
    version: string;
  }

  const fbq: FbqFunction = Object.assign(
    function(...args: unknown[]) {
      if (fbq.callMethod) {
        fbq.callMethod(...args);
      } else {
        fbq.queue.push(args);
      }
    },
    {
      queue: [] as unknown[],
      loaded: true,
      version: "2.0",
    }
  );

  window.fbq = fbq;
  if (!window._fbq) window._fbq = fbq;

  const script = document.createElement("script");
  script.async = true;
  script.src = "https://connect.facebook.net/en_US/fbevents.js";
  document.head.appendChild(script);

  window.fbq("init", pixelId);
  window.fbq("track", "PageView");
}

// Extend Window interface for Meta Pixel
declare global {
  interface Window {
    _fbq?: unknown;
  }
}
