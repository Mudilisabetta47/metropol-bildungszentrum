import { Shield, Award, TrendingUp, Clock, CreditCard, Users } from "lucide-react";

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
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-accent font-semibold text-sm uppercase tracking-wider mb-4">Warum Metropol</p>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Ihre Vorteile bei uns
          </h2>
          <p className="text-lg text-muted-foreground">
            Wir setzen auf Qualität, Erfahrung und persönliche Betreuung für Ihren Erfolg.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group p-6 rounded-2xl bg-card border border-border hover:border-accent/30 hover:shadow-lg transition-all duration-300"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="mb-5 inline-flex p-3 rounded-xl bg-accent/10 group-hover:bg-accent/20 transition-colors">
                <feature.icon className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-display font-bold text-lg text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}