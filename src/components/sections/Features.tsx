import { Shield, Award, TrendingUp, Clock, CreditCard, Users, CheckCircle, Star } from "lucide-react";
import fleetVehicles from "@/assets/fleet-vehicles.jpg";
import tqcertLogo from "@/assets/tqcert-logo.webp";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { TrafficSignPattern } from "@/components/ui/TrafficSignPattern";

const features = [
  {
    icon: Shield,
    title: "AZAV zertifiziert",
    description: "Alle unsere Maßnahmen sind nach AZAV zertifiziert und können gefördert werden.",
  },
  {
    icon: Award,
    title: "Erfahrene Ausbilder",
    description: "Profitieren Sie von über 25 Jahren Erfahrung in der Berufskraftfahrer-Ausbildung.",
  },
  {
    icon: TrendingUp,
    title: "Hohe Erfolgsquote",
    description: "Über 95% unserer Teilnehmer bestehen die Prüfung beim ersten Versuch.",
  },
  {
    icon: Clock,
    title: "Flexible Termine",
    description: "Wir bieten Kurse zu verschiedenen Zeiten an, um Ihren Bedürfnissen gerecht zu werden.",
  },
  {
    icon: CreditCard,
    title: "100% Förderung möglich",
    description: "Mit Bildungsgutschein der Agentur für Arbeit oder des Jobcenters.",
  },
  {
    icon: Users,
    title: "Kleine Gruppen",
    description: "Maximale Aufmerksamkeit durch kleine Gruppengrößen und individuelle Betreuung.",
  },
];

const certifications = [
  "AZAV-zertifizierter Bildungsträger",
  "Anerkannt durch die Agentur für Arbeit",
  "TÜV-geprüfte Qualitätsstandards",
  "Staatlich anerkannte Ausbildungsstätte",
];

// Google Review Component
function GoogleReviewBadge() {
  const rating = 4.8;
  const reviewCount = 127;
  
  return (
    <a 
      href="https://www.google.com/maps/place/METROPOL+Bildungszentrum+GmbH"
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-4 px-6 py-4 bg-card rounded-xl border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300 group"
    >
      <div className="flex-shrink-0">
        <svg viewBox="0 0 24 24" className="h-8 w-8">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-1 mb-1">
          <span className="font-bold text-lg text-foreground">{rating}</span>
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-4 w-4 ${
                  star <= Math.floor(rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : star - 0.5 <= rating
                    ? "fill-yellow-400/50 text-yellow-400"
                    : "text-muted-foreground"
                }`}
              />
            ))}
          </div>
        </div>
        <p className="text-sm text-muted-foreground">{reviewCount} Bewertungen auf Google</p>
      </div>
      <div className="text-muted-foreground group-hover:text-primary transition-colors">
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </div>
    </a>
  );
}

export function Features() {
  return (
    <section id="ueber-uns" className="py-24 bg-background relative overflow-hidden">
      <TrafficSignPattern className="opacity-50" />
      <div className="section-container relative z-10">
        {/* Trust badges section */}
        <AnimatedSection>
          <div className="bg-muted/50 rounded-2xl p-8 mb-16 border border-border">
            <div className="flex flex-col xl:flex-row items-center gap-8">
              <div className="flex-shrink-0">
                <img src={tqcertLogo} alt="TQ Cert Zertifizierung" className="h-24 w-auto" />
              </div>
              <div className="flex-1 text-center lg:text-left">
                <h3 className="font-display text-xl font-bold text-foreground mb-2">Zertifizierter Bildungsträger</h3>
                <p className="text-muted-foreground mb-4">
                  Wir sind ein nach AZAV zugelassener Träger für die Förderung der beruflichen Weiterbildung. 
                  Unsere Qualität wird regelmäßig durch unabhängige Prüfstellen kontrolliert.
                </p>
                <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                  {certifications.map((cert) => (
                    <div key={cert} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="text-foreground">{cert}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex-shrink-0 w-full xl:w-auto">
                <GoogleReviewBadge />
              </div>
            </div>
          </div>
        </AnimatedSection>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Image */}
          <AnimatedSection direction="left">
            <div className="relative">
              <img 
                src={fleetVehicles}
                alt="Metropol Fahrzeugflotte - LKW, Bus und Fahrschulwagen"
                className="rounded-2xl shadow-xl w-full hover:shadow-2xl transition-shadow duration-500"
              />
              <div className="absolute -bottom-6 -right-6 bg-primary text-primary-foreground rounded-xl p-6 shadow-xl hidden sm:block">
                <p className="font-display text-3xl font-bold">25+</p>
                <p className="text-sm text-primary-foreground/80">Jahre Erfahrung</p>
              </div>
            </div>
          </AnimatedSection>

          {/* Content */}
          <AnimatedSection direction="right" delay={200}>
            <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-4">Warum Metropol</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-6">Ihre Vorteile bei uns</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Wir setzen auf Qualität, Erfahrung und persönliche Betreuung für Ihren Erfolg.
            </p>

            <div className="grid sm:grid-cols-2 gap-6">
              {features.map((feature, i) => (
                <AnimatedSection key={feature.title} delay={300 + i * 100}>
                  <div className="flex items-start gap-4 group">
                    <div className="p-2 rounded-lg bg-primary/10 shrink-0 group-hover:bg-primary/20 transition-colors duration-300">
                      <feature.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
