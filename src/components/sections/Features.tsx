import { Shield, Award, TrendingUp, Clock, CreditCard, Users, CheckCircle } from "lucide-react";
import fleetVehicles from "@/assets/fleet-vehicles.jpg";
import tqcertLogo from "@/assets/tqcert-logo.webp";

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

export function Features() {
  return (
    <section id="ueber-uns" className="py-24 bg-background">
      <div className="section-container">
        {/* Trust badges section */}
        <div className="bg-muted/50 rounded-2xl p-8 mb-16 border border-border">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            {/* Certificate logo */}
            <div className="flex-shrink-0">
              <img 
                src={tqcertLogo}
                alt="TQ Cert Zertifizierung"
                className="h-24 w-auto"
              />
            </div>
            
            {/* Certificate info */}
            <div className="flex-1 text-center lg:text-left">
              <h3 className="font-display text-xl font-bold text-foreground mb-2">
                Zertifizierter Bildungsträger
              </h3>
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
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Image */}
          <div className="relative">
            <img 
              src={fleetVehicles}
              alt="Metropol Fahrzeugflotte - LKW, Bus und Fahrschulwagen"
              className="rounded-2xl shadow-xl w-full"
            />
            <div className="absolute -bottom-6 -right-6 bg-primary text-primary-foreground rounded-xl p-6 shadow-xl hidden sm:block">
              <p className="font-display text-3xl font-bold">25+</p>
              <p className="text-sm text-primary-foreground/80">Jahre Erfahrung</p>
            </div>
          </div>

          {/* Content */}
          <div>
            <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-4">Warum Metropol</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-6">
              Ihre Vorteile bei uns
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Wir setzen auf Qualität, Erfahrung und persönliche Betreuung für Ihren Erfolg.
            </p>

            {/* Features grid */}
            <div className="grid sm:grid-cols-2 gap-6">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="flex items-start gap-4"
                >
                  <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}