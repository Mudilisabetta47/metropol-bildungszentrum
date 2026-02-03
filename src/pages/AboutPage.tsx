import { Link } from "react-router-dom";
import { 
  Award, Users, CheckCircle, Target, Heart, Shield,
  Truck, GraduationCap, MapPin, Clock, ArrowRight
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import fleetTeam from "@/assets/fleet-team.webp";
import fleetVehicles from "@/assets/fleet-vehicles.jpg";
import tqcertLogo from "@/assets/tqcert-logo.webp";
import agenturLogo from "@/assets/agentur-fuer-arbeit-logo.png";

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-28 sm:pt-32 pb-16 bg-secondary">
        <div className="section-container">
          <div className="max-w-3xl">
            <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-4">Über uns</p>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Ihr Partner für berufliche Mobilität
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Das Metropol Bildungszentrum ist Ihr zuverlässiger Partner für professionelle Aus- und Weiterbildung 
              im Transportwesen. Mit drei Standorten in Niedersachsen und Bremen bilden wir jährlich hunderte 
              Berufskraftfahrer*innen, Busfahrer*innen und Fahrlehrer*innen aus.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="py-16 bg-background">
        <div className="section-container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <img 
                src={fleetTeam}
                alt="Unser Team"
                className="rounded-2xl shadow-xl w-full"
              />
            </div>
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-6">
                Unsere Mission
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Wir glauben daran, dass gute Ausbildung der Schlüssel zu beruflichem Erfolg ist. 
                Unser Ziel ist es, Menschen den Einstieg in die Transportbranche zu ermöglichen und 
                bereits tätige Berufskraftfahrer*innen kontinuierlich weiterzubilden.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Target className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Praxisorientiert</p>
                    <p className="text-sm text-muted-foreground">Lernen am echten Fahrzeug</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Heart className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Persönlich</p>
                    <p className="text-sm text-muted-foreground">Individuelle Betreuung</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Zertifiziert</p>
                    <p className="text-sm text-muted-foreground">AZAV & TQCert</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Erfahren</p>
                    <p className="text-sm text-muted-foreground">20+ Jahre Expertise</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="section-container">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl sm:text-5xl font-bold mb-2">3</div>
              <p className="text-primary-foreground/80">Standorte</p>
            </div>
            <div>
              <div className="text-4xl sm:text-5xl font-bold mb-2">20+</div>
              <p className="text-primary-foreground/80">Jahre Erfahrung</p>
            </div>
            <div>
              <div className="text-4xl sm:text-5xl font-bold mb-2">500+</div>
              <p className="text-primary-foreground/80">Absolventen jährlich</p>
            </div>
            <div>
              <div className="text-4xl sm:text-5xl font-bold mb-2">95%</div>
              <p className="text-primary-foreground/80">Bestehensquote</p>
            </div>
          </div>
        </div>
      </section>

      {/* Fleet & Equipment */}
      <section className="py-16 bg-background">
        <div className="section-container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-6">
                Moderne Fahrzeugflotte
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Unsere Ausbildung findet auf modernen Fahrzeugen statt, die dem aktuellen Stand der Technik 
                entsprechen. So sind Sie optimal auf die Prüfung und den Berufsalltag vorbereitet.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span className="text-foreground">Moderne LKW-Flotte (Sattelzüge, Gliederzüge)</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span className="text-foreground">Reise- und Linienbusse für Busausbildung</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span className="text-foreground">Fahrsimulator für risikofreies Training</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span className="text-foreground">Moderne Schulungsräume mit Medientechnik</span>
                </li>
              </ul>
            </div>
            <div className="order-1 lg:order-2">
              <img 
                src={fleetVehicles}
                alt="Unsere Fahrzeugflotte"
                className="rounded-2xl shadow-xl w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-16 bg-secondary">
        <div className="section-container">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-4">
              Zertifizierungen & Qualität
            </h2>
            <p className="text-muted-foreground">
              Als AZAV-zertifizierter Bildungsträger erfüllen wir höchste Qualitätsstandards und ermöglichen 
              die 100% Förderung durch die Agentur für Arbeit.
            </p>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-8">
            <div className="flex items-center gap-3 px-6 py-4 bg-card rounded-xl border border-border">
              <Award className="h-8 w-8 text-primary" />
              <div>
                <p className="font-semibold text-foreground">AZAV zertifiziert</p>
                <p className="text-sm text-muted-foreground">Förderfähige Maßnahmen</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-6 py-4 bg-card rounded-xl border border-border">
              <img src={tqcertLogo} alt="TQCert" className="h-12 object-contain" />
            </div>
            <div className="flex items-center gap-3 px-6 py-4 bg-card rounded-xl border border-border">
              <img src={agenturLogo} alt="Agentur für Arbeit" className="h-10 w-10 object-contain" />
              <div>
                <p className="font-semibold text-foreground">Agentur für Arbeit</p>
                <p className="text-sm text-muted-foreground">Anerkannter Partner</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Locations Quick Overview */}
      <section className="py-16 bg-background">
        <div className="section-container">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-4">
              Unsere Standorte
            </h2>
            <p className="text-muted-foreground">
              Besuchen Sie uns an einem unserer drei Standorte in der Region.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Hannover", address: "Vahrenwalder Str. 213", zip: "30165 Hannover", slug: "hannover" },
              { name: "Garbsen", address: "Planetenring 25 – 27", zip: "30823 Garbsen", slug: "garbsen" },
              { name: "Bremen", address: "Bahnhofsplatz 41", zip: "28195 Bremen", slug: "bremen" },
            ].map((loc) => (
              <Link 
                key={loc.slug}
                to={`/standort/${loc.slug}`}
                className="block p-6 bg-card rounded-xl border border-border hover:border-primary/30 transition-colors group"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">{loc.name}</h3>
                    <p className="text-sm text-muted-foreground">{loc.address}</p>
                    <p className="text-sm text-muted-foreground">{loc.zip}</p>
                    <div className="flex items-center gap-1 text-primary mt-2 text-sm font-medium">
                      Details ansehen
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <p className="text-muted-foreground mb-2">
              <Clock className="inline h-4 w-4 mr-1" />
              Öffnungszeiten alle Standorte: Mo-Fr 08:00 - 12:00, 12:30 - 16:30 Uhr
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-accent">
        <div className="section-container text-center">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-accent-foreground mb-4">
            Bereit für Ihre Ausbildung?
          </h2>
          <p className="text-accent-foreground/80 mb-8 max-w-2xl mx-auto">
            Lassen Sie sich kostenlos und unverbindlich beraten. Wir finden gemeinsam die passende Ausbildung für Sie.
          </p>
          <Button variant="secondary" size="lg" asChild>
            <Link to="/#kontakt">
              Jetzt Beratung anfragen
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
