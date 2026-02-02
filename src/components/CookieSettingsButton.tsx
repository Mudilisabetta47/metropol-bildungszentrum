import { Cookie } from "lucide-react";
import { useCookieConsent } from "@/contexts/CookieConsentContext";
import { Button } from "@/components/ui/button";

export function CookieSettingsButton() {
  const { openSettings, consentGiven } = useCookieConsent();

  if (!consentGiven) return null;

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={openSettings}
      className="fixed bottom-4 left-4 z-50 h-12 w-12 rounded-full shadow-lg bg-background/95 backdrop-blur-sm border-border hover:bg-muted"
      aria-label="Cookie-Einstellungen öffnen"
    >
      <Cookie className="h-5 w-5" />
    </Button>
  );
}
