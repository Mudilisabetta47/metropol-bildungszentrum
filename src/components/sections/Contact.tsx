import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Send, Phone, Mail, CheckCircle, Shield, Clock, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import tqcertLogo from "@/assets/tqcert-logo.webp";
import agenturLogo from "@/assets/agentur-fuer-arbeit-logo.png";
import reginaMartin from "@/assets/regina-martin.png";
import { useSiteSettings, formatPhoneLink } from "@/hooks/useSiteSettings";

const courses = [
  { value: "c-ce", label: "Führerschein C/CE (LKW)", slug: "c-ce" },
  { value: "c1-c1e", label: "Führerschein C1/C1E (7,5t)", slug: "c1-c1e" },
  { value: "d-de", label: "Führerschein D/DE (Bus)", slug: "d-de" },
  { value: "fahrlehrer", label: "Fahrlehrer*innen-Ausbildung", slug: "fahrlehrer" },
  { value: "bkf-weiterbildung", label: "BKF-Weiterbildung (Module 1-5)", slug: "bkf-weiterbildung" },
  { value: "auslieferungsfahrer", label: "Auslieferungsfahrer (Klasse B)", slug: "auslieferungsfahrer" },
  { value: "citylogistiker", label: "Citylogistiker (Klasse B/BE)", slug: "citylogistiker" },
  { value: "sonstiges", label: "Sonstiges / Allgemeine Beratung", slug: null },
];

const locations = [
  { value: "hannover", label: "Hannover" },
  { value: "bremen", label: "Bremen" },
  { value: "garbsen", label: "Garbsen" },
  { value: "flexible", label: "Flexibel / Alle Standorte" },
];

// Map URL slugs to course values
const slugToCourseValue: Record<string, string> = {
  "c-ce": "c-ce",
  "c1-c1e": "c1-c1e",
  "d-de": "d-de",
  "fahrlehrer": "fahrlehrer",
  "bkf-weiterbildung": "bkf-weiterbildung",
  "auslieferungsfahrer": "auslieferungsfahrer",
  "citylogistiker": "citylogistiker",
};

interface ContactProps {
  preselectedCourse?: string;
  additionalInfo?: string;
}

export function Contact({ preselectedCourse, additionalInfo }: ContactProps) {
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const { toast } = useToast();
  const { data: settings } = useSiteSettings();

  // Detect course from URL path
  useEffect(() => {
    if (preselectedCourse) {
      setSelectedCourse(preselectedCourse);
      return;
    }

    // Extract course from URL path like /fuehrerschein/c-ce
    const pathParts = location.pathname.split("/");
    const courseSlug = pathParts[pathParts.length - 1];
    
    if (courseSlug && slugToCourseValue[courseSlug]) {
      setSelectedCourse(slugToCourseValue[courseSlug]);
    }
  }, [location.pathname, preselectedCourse]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const message = formData.get("message") as string;

    // Get UTM params from URL
    const urlParams = new URLSearchParams(window.location.search);
    const utmSource = urlParams.get("utm_source");
    const utmMedium = urlParams.get("utm_medium");
    const utmCampaign = urlParams.get("utm_campaign");

    // Get course label
    const courseLabel = courses.find(c => c.value === selectedCourse)?.label || selectedCourse;
    const locationLabel = locations.find(l => l.value === selectedLocation)?.label || selectedLocation;

    try {
      // 1. Save to database
      const { error } = await supabase.from("contact_requests").insert({
        name: `${firstName} ${lastName}`,
        email,
        phone: phone || null,
        message: message || `Anfrage für: ${courseLabel}`,
        course_interest: courseLabel,
        location_preference: locationLabel || null,
        source: location.pathname,
        utm_source: utmSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign,
      });

      if (error) throw error;

      // 2. Send notification emails via edge function
      try {
        const { error: emailError } = await supabase.functions.invoke('send-contact-notification', {
          body: {
            name: `${firstName} ${lastName}`,
            email,
            phone: phone || undefined,
            course: courseLabel,
            location: locationLabel || undefined,
            message: message || undefined,
            source: location.pathname,
          }
        });
        
        if (emailError) {
          console.error("Email notification failed:", emailError);
          // Don't throw - the contact was saved, just log the email error
        }
      } catch (emailErr) {
        console.error("Failed to send email notifications:", emailErr);
        // Continue - contact was saved successfully
      }

      setIsSubmitted(true);
      toast({
        title: "Anfrage erfolgreich gesendet!",
        description: "Wir melden uns innerhalb von 24 Stunden bei Ihnen.",
      });
    } catch (error) {
      console.error("Error submitting contact request:", error);
      toast({
        variant: "destructive",
        title: "Fehler beim Senden",
        description: "Bitte versuchen Sie es erneut oder rufen Sie uns an.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const courseLabel = courses.find(c => c.value === selectedCourse)?.label;

  if (isSubmitted) {
    return (
      <section id="kontakt" className="py-24 bg-secondary">
        <div className="section-container">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-accent/10 flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-accent" />
            </div>
            <h2 className="font-display text-3xl font-bold text-foreground mb-4">
              Vielen Dank für Ihre Anfrage!
            </h2>
            <p className="text-lg text-muted-foreground mb-4">
              Wir haben Ihre Anfrage{courseLabel ? ` für "${courseLabel}"` : ""} erhalten.
            </p>
            <p className="text-muted-foreground mb-8">
              Ein Mitarbeiter wird sich innerhalb von 24 Stunden bei Ihnen melden, um alle Details zu besprechen.
            </p>
            <Button onClick={() => setIsSubmitted(false)} variant="outline">
              Neue Anfrage senden
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="kontakt" className="py-24 bg-secondary">
      <div className="section-container">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Info */}
          <div>
            <p className="text-accent font-semibold text-sm uppercase tracking-wider mb-4">Kontakt & Beratung</p>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              {selectedCourse ? `Interesse an: ${courseLabel}` : "Starten Sie jetzt Ihre Ausbildung"}
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              {selectedCourse 
                ? "Füllen Sie das Formular aus und wir beraten Sie kostenlos und unverbindlich zu allen Details, Voraussetzungen und Fördermöglichkeiten."
                : "Haben Sie Fragen zu unseren Kursen oder möchten Sie sich direkt anmelden? Wir beraten Sie gerne persönlich."}
            </p>

            {/* Guarantee badges */}
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border">
                <div className="p-2 rounded-lg bg-accent/10">
                  <Clock className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">Schnelle Antwort</p>
                  <p className="text-xs text-muted-foreground">Innerhalb von 24 Stunden</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border">
                <div className="p-2 rounded-lg bg-accent/10">
                  <Shield className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">100% unverbindlich</p>
                  <p className="text-xs text-muted-foreground">Kostenlose Beratung</p>
                </div>
              </div>
            </div>

            {/* Contact options - with Regina Martin */}
            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors">
                <img 
                  src={reginaMartin} 
                  alt={settings?.contact_person_name || "Ansprechpartnerin"} 
                  className="w-16 h-16 rounded-full object-cover border-2 border-primary/20"
                />
                <div className="flex-1">
                  <p className="font-semibold text-foreground mb-0.5">Ihre Ansprechpartnerin</p>
                  <p className="text-primary font-medium">{settings?.contact_person_name}</p>
                  <a href={formatPhoneLink(settings?.contact_person_phone || "")} className="text-primary hover:underline text-sm flex items-center gap-1 mt-1">
                    <Phone className="h-3.5 w-3.5" />
                    {settings?.contact_person_phone}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-colors">
                <div className="p-3 rounded-lg bg-primary text-primary-foreground">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">E-Mail Kontakt</p>
                  <a href={`mailto:${settings?.central_email}`} className="text-primary hover:underline font-medium">
                    {settings?.central_email}
                  </a>
                  <p className="text-sm text-muted-foreground mt-1">Antwort innerhalb von 24 Stunden</p>
                </div>
              </div>
            </div>

            {/* Trust badges */}
            <div className="pt-8 border-t border-border">
              <p className="text-sm font-medium text-muted-foreground mb-4">Zertifizierungen & Qualitätssiegel</p>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-lg border border-border">
                  <Award className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">AZAV zertifiziert</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-lg border border-border">
                  <img src={agenturLogo} alt="Agentur für Arbeit" className="h-6 w-6 object-contain" />
                  <span className="text-sm font-medium text-foreground">Agentur für Arbeit</span>
                </div>
                <img 
                  src={tqcertLogo} 
                  alt="TQCert Zertifizierung" 
                  className="h-10 object-contain"
                />
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-card rounded-2xl border-2 border-primary/20 p-8 shadow-xl">
            <div className="mb-6">
              <h3 className="font-display font-bold text-xl text-foreground mb-2">
                Unverbindliche Anfrage
              </h3>
              <p className="text-sm text-muted-foreground">
                Füllen Sie das Formular aus und erhalten Sie alle Informationen zu Ihrem Wunschkurs.
              </p>
            </div>

            {/* Selected course highlight */}
            {selectedCourse && (
              <div className="mb-6 p-4 rounded-xl bg-primary/5 border border-primary/20">
                <p className="text-sm text-muted-foreground mb-1">Ihr gewählter Kurs:</p>
                <p className="font-semibold text-primary">{courseLabel}</p>
                {additionalInfo && (
                  <p className="text-sm text-foreground mt-2 pt-2 border-t border-primary/10">
                    <span className="text-muted-foreground">Gewählter Termin: </span>
                    {additionalInfo}
                  </p>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-foreground font-medium">
                    Vorname <span className="text-destructive">*</span>
                  </Label>
                  <Input 
                    id="firstName" 
                    name="firstName"
                    placeholder="Max" 
                    required 
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-foreground font-medium">
                    Nachname <span className="text-destructive">*</span>
                  </Label>
                  <Input 
                    id="lastName" 
                    name="lastName"
                    placeholder="Mustermann" 
                    required 
                    className="h-12"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground font-medium">
                  E-Mail <span className="text-destructive">*</span>
                </Label>
                <Input 
                  id="email" 
                  name="email"
                  type="email" 
                  placeholder="max@beispiel.de" 
                  required 
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-foreground font-medium">
                  Telefon <span className="text-muted-foreground text-xs">(für schnellere Kontaktaufnahme)</span>
                </Label>
                <Input 
                  id="phone" 
                  name="phone"
                  type="tel" 
                  placeholder="0511 123456" 
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="course" className="text-foreground font-medium">
                  Gewünschter Kurs <span className="text-destructive">*</span>
                </Label>
                <Select 
                  value={selectedCourse} 
                  onValueChange={setSelectedCourse}
                  required
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Kurs auswählen..." />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.value} value={course.value}>
                        {course.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="text-foreground font-medium">
                  Bevorzugter Standort
                </Label>
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Standort auswählen..." />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem key={location.value} value={location.value}>
                        {location.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="text-foreground font-medium">
                  Nachricht <span className="text-muted-foreground text-xs">(optional)</span>
                </Label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder="Haben Sie spezielle Fragen, z.B. zu Fördermöglichkeiten oder Startterminen?"
                  rows={4}
                  className="resize-none"
                />
              </div>

              <Button 
                type="submit" 
                variant="accent" 
                size="lg" 
                className="w-full h-14 text-base font-semibold"
                disabled={isSubmitting || !selectedCourse}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Wird gesendet...
                  </span>
                ) : (
                  <>
                    Unverbindlich anfragen
                    <Send className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Mit dem Absenden stimmen Sie unserer{" "}
                <a href="/datenschutz" className="underline hover:text-foreground">
                  Datenschutzerklärung
                </a>{" "}
                zu. Ihre Daten werden vertraulich behandelt.
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}