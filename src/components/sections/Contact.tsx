import { useState } from "react";
import { Send, Phone, Mail, CheckCircle } from "lucide-react";
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

const courses = [
  { value: "c-ce", label: "Berufskraftfahrer C/CE" },
  { value: "d-de", label: "Busführerschein D/DE" },
  { value: "fahrlehrer", label: "Fahrlehrer*innen-Ausbildung" },
  { value: "bkf-1", label: "BKF-Weiterbildung Modul 1" },
  { value: "bkf-2", label: "BKF-Weiterbildung Modul 2" },
  { value: "bkf-3", label: "BKF-Weiterbildung Modul 3" },
  { value: "bkf-4", label: "BKF-Weiterbildung Modul 4" },
  { value: "bkf-5", label: "BKF-Weiterbildung Modul 5" },
  { value: "sprache", label: "Sprachkurs für Berufskraftfahrer" },
  { value: "sonstiges", label: "Sonstiges / Beratung" },
];

const locations = [
  { value: "hannover", label: "Hannover" },
  { value: "bremen", label: "Bremen" },
  { value: "garbsen", label: "Garbsen" },
  { value: "flexible", label: "Flexibel / Alle Standorte" },
];

export function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    
    toast({
      title: "Anfrage gesendet!",
      description: "Wir melden uns innerhalb von 24 Stunden bei Ihnen.",
    });
  };

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
            <p className="text-lg text-muted-foreground mb-8">
              Wir haben Ihre Nachricht erhalten und werden uns innerhalb von 24 Stunden bei Ihnen melden.
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
            <p className="text-accent font-semibold text-sm uppercase tracking-wider mb-4">Kontakt</p>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Starten Sie jetzt Ihre Ausbildung
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Haben Sie Fragen zu unseren Kursen oder möchten Sie sich direkt anmelden? 
              Füllen Sie das Formular aus und wir melden uns schnellstmöglich bei Ihnen.
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border">
                <div className="p-3 rounded-lg bg-accent/10">
                  <Phone className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">Telefonische Beratung</p>
                  <a href="tel:+49511123456" className="text-accent hover:underline font-medium">
                    0511 123 456
                  </a>
                  <p className="text-sm text-muted-foreground mt-1">Mo-Fr: 8:00 - 18:00 Uhr</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border">
                <div className="p-3 rounded-lg bg-accent/10">
                  <Mail className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="font-semibold text-foreground mb-1">E-Mail Kontakt</p>
                  <a href="mailto:info@metropol-bildung.de" className="text-accent hover:underline font-medium">
                    info@metropol-bildung.de
                  </a>
                  <p className="text-sm text-muted-foreground mt-1">Antwort innerhalb von 24 Stunden</p>
                </div>
              </div>
            </div>

            {/* Trust badges */}
            <div className="mt-10 pt-10 border-t border-border">
              <p className="text-sm font-medium text-muted-foreground mb-4">Zertifizierungen & Partner</p>
              <div className="flex flex-wrap gap-4">
                <div className="px-4 py-2 bg-card rounded-lg border border-border text-sm font-medium text-muted-foreground">
                  AZAV zertifiziert
                </div>
                <div className="px-4 py-2 bg-card rounded-lg border border-border text-sm font-medium text-muted-foreground">
                  Arbeitsagentur anerkannt
                </div>
                <div className="px-4 py-2 bg-card rounded-lg border border-border text-sm font-medium text-muted-foreground">
                  TÜV geprüft
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-card rounded-2xl border border-border p-8 shadow-lg">
            <h3 className="font-display font-bold text-xl text-foreground mb-6">
              Unverbindliche Anfrage
            </h3>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Vorname *</Label>
                  <Input id="firstName" placeholder="Max" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nachname *</Label>
                  <Input id="lastName" placeholder="Mustermann" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-Mail *</Label>
                <Input id="email" type="email" placeholder="max@beispiel.de" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefon</Label>
                <Input id="phone" type="tel" placeholder="0511 123456" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="course">Gewünschter Kurs *</Label>
                <Select required>
                  <SelectTrigger>
                    <SelectValue placeholder="Kurs auswählen" />
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
                <Label htmlFor="location">Bevorzugter Standort</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Standort auswählen" />
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
                <Label htmlFor="message">Nachricht</Label>
                <Textarea
                  id="message"
                  placeholder="Haben Sie spezielle Fragen oder Wünsche?"
                  rows={4}
                />
              </div>

              <Button 
                type="submit" 
                variant="accent" 
                size="lg" 
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  "Wird gesendet..."
                ) : (
                  <>
                    Anfrage senden
                    <Send className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Mit dem Absenden stimmen Sie unserer{" "}
                <a href="/datenschutz" className="underline hover:text-foreground">
                  Datenschutzerklärung
                </a>{" "}
                zu.
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}