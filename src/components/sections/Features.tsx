import { Shield, Award, TrendingUp, Clock, CreditCard, Users } from "lucide-react";
import fleetVehicles from "@/assets/fleet-vehicles.jpg";

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

export function Features() {
  return (
    <section id="ueber-uns" className="py-24 bg-background">
      <div className="section-container">
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