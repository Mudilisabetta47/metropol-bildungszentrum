import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { X, Settings, Shield } from "lucide-react";
import { useCookieConsent } from "@/contexts/CookieConsentContext";
import { cn } from "@/lib/utils";

export function CookieBanner() {
  const { showBanner, acceptAll, rejectAll, saveSettings, settings, closeBanner, consentGiven } = useCookieConsent();
  const [showDetails, setShowDetails] = useState(false);
  const [localSettings, setLocalSettings] = useState(settings);

  if (!showBanner) return null;

  const handleSaveSettings = () => {
    saveSettings(localSettings);
  };

  const cookieCategories = [
    {
      id: "necessary",
      name: "Notwendige Cookies",
      description: "Diese Cookies sind für die Grundfunktionen der Website erforderlich und können nicht deaktiviert werden.",
      required: true,
    },
    {
      id: "analytics",
      name: "Analyse-Cookies",
      description: "Diese Cookies helfen uns zu verstehen, wie Besucher mit der Website interagieren, indem sie Informationen anonym sammeln und melden.",
      required: false,
    },
    {
      id: "marketing",
      name: "Marketing-Cookies",
      description: "Diese Cookies werden verwendet, um Besuchern relevante Werbung und Marketing-Kampagnen anzuzeigen (z.B. Google Ads, Meta).",
      required: false,
    },
    {
      id: "preferences",
      name: "Präferenz-Cookies",
      description: "Diese Cookies ermöglichen es der Website, sich an Ihre Einstellungen zu erinnern (z.B. Sprache, Region).",
      required: false,
    },
  ];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-banner-title"
    >
      <div
        className={cn(
          "w-full max-w-3xl bg-background border border-border rounded-t-2xl shadow-2xl transition-all duration-300",
          showDetails ? "max-h-[90vh]" : "max-h-[50vh]"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <h2 id="cookie-banner-title" className="font-display font-semibold text-lg">
              Cookie-Einstellungen
            </h2>
          </div>
          {consentGiven && (
            <button
              onClick={closeBanner}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              aria-label="Schließen"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-4 md:p-6 overflow-y-auto max-h-[60vh]">
          {!showDetails ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Wir verwenden Cookies und ähnliche Technologien, um Ihnen ein optimales Nutzererlebnis zu bieten. 
                Einige Cookies sind technisch notwendig, während andere uns helfen, die Website zu verbessern 
                und personalisierte Inhalte anzuzeigen.
              </p>
              <p className="text-sm text-muted-foreground">
                Weitere Informationen finden Sie in unserer{" "}
                <Link to="/datenschutz" className="text-primary hover:underline font-medium">
                  Datenschutzerklärung
                </Link>
                .
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground mb-4">
                Hier können Sie Ihre Cookie-Präferenzen im Detail anpassen:
              </p>
              {cookieCategories.map((category) => (
                <div
                  key={category.id}
                  className="p-4 bg-muted/50 rounded-lg border border-border"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Label
                      htmlFor={`cookie-${category.id}`}
                      className="font-medium cursor-pointer"
                    >
                      {category.name}
                    </Label>
                    <Switch
                      id={`cookie-${category.id}`}
                      checked={category.required || localSettings[category.id as keyof typeof localSettings]}
                      disabled={category.required}
                      onCheckedChange={(checked) =>
                        setLocalSettings((prev) => ({
                          ...prev,
                          [category.id]: checked,
                        }))
                      }
                      aria-describedby={`cookie-${category.id}-desc`}
                    />
                  </div>
                  <p
                    id={`cookie-${category.id}-desc`}
                    className="text-xs text-muted-foreground"
                  >
                    {category.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-4 md:p-6 border-t border-border bg-muted/30">
          <div className="flex flex-col sm:flex-row gap-3">
            {!showDetails ? (
              <>
                <Button
                  variant="outline"
                  className="flex-1 order-3 sm:order-1"
                  onClick={rejectAll}
                >
                  Nur Notwendige
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 order-2"
                  onClick={() => setShowDetails(true)}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Einstellungen
                </Button>
                <Button
                  variant="accent"
                  className="flex-1 order-1 sm:order-3"
                  onClick={acceptAll}
                >
                  Alle akzeptieren
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowDetails(false)}
                >
                  Zurück
                </Button>
                <Button
                  variant="accent"
                  className="flex-1"
                  onClick={handleSaveSettings}
                >
                  Einstellungen speichern
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
