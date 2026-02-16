import { Link } from "react-router-dom";
import { 
  Award, Users, CheckCircle, Target, Heart, Shield,
  Truck, GraduationCap, MapPin, Clock, ArrowRight
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { TrafficSignPattern } from "@/components/ui/TrafficSignPattern";
import fleetTeam from "@/assets/fleet-team.webp";
import fleetVehicles from "@/assets/fleet-vehicles.jpg";
import tqcertLogo from "@/assets/tqcert-logo.webp";
import agenturLogo from "@/assets/agentur-fuer-arbeit-logo.png";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

function AnimatedCounter({ value, suffix = "" }: { value: string; suffix?: string }) {
  const { ref, isVisible } = useScrollAnimation(0.3);
  return (
    <div ref={ref} className={`text-4xl sm:text-5xl font-bold mb-2 transition-all duration-1000 ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-75"}`}>
      {value}{suffix}
    </div>
  );
}

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-28 sm:pt-32 pb-16 bg-secondary relative overflow-hidden">
        <TrafficSignPattern />
        <div className="section-container relative z-10">
          <AnimatedSection className="max-w-3xl">
            <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-4">Über uns</p>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Ihr Partner für berufliche Mobilität
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Das Metropol Bildungszentrum ist Ihr zuverlässiger Partner für professionelle Aus- und Weiterbildung 
              im Transportwesen. Mit drei Standorten in Niedersachsen und Bremen bilden wir jährlich hunderte 
              Berufskraftfahrer*innen, Busfahrer*innen und Fahrlehrer*innen aus.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="py-16 bg-background relative overflow-hidden">
        <TrafficSignPattern className="opacity-50" />
        <div className="section-container relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <AnimatedSection direction="left">
              <img 
                src={fleetTeam}
                alt="Unser Team"
                className="rounded-2xl shadow-xl w-full hover:shadow-2xl transition-shadow duration-500"
              />
            </AnimatedSection>
            <AnimatedSection direction="right" delay={200}>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-6">
                Unsere Mission
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Wir glauben daran, dass gute Ausbildung der Schlüssel zu beruflichem Erfolg ist. 
                Unser Ziel ist es, Menschen den Einstieg in die Transportbranche zu ermöglichen und 
                bereits tätige Berufskraftfahrer*innen kontinuierlich weiterzubilden.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { icon: Target, title: "Praxisorientiert", desc: "Lernen am echten Fahrzeug" },
                  { icon: Heart, title: "Persönlich", desc: "Individuelle Betreuung" },
                  { icon: Shield, title: "Zertifiziert", desc: "AZAV & TQCert" },
                  { icon: Users, title: "Erfahren", desc: "20+ Jahre Expertise" },
                ].map((item, i) => (
                  <AnimatedSection key={item.title} delay={300 + i * 100}>
                    <div className="flex items-start gap-3 group">
                      <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
                        <item.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{item.title}</p>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  </AnimatedSection>
                ))}
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 border-2 border-primary-foreground/20 rounded-full animate-pulse" />
          <div className="absolute bottom-10 right-20 w-24 h-24 border-2 border-primary-foreground/20 rounded-full animate-pulse" style={{ animationDelay: "1s" }} />
          <div className="absolute top-1/2 left-1/3 w-16 h-16 border-2 border-primary-foreground/20 rotate-45 animate-pulse" style={{ animationDelay: "0.5s" }} />
        </div>
        <div className="section-container relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {[
              { value: "3", label: "Standorte" },
              { value: "20", label: "Jahre Erfahrung", suffix: "+" },
              { value: "500", label: "Absolventen jährlich", suffix: "+" },
              { value: "95", label: "Bestehensquote", suffix: "%" },
            ].map((stat) => (
              <div key={stat.label}>
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                <p className="text-primary-foreground/80">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fleet & Equipment */}
      <section className="py-16 bg-background relative overflow-hidden">
        <TrafficSignPattern className="opacity-50" />
        <div className="section-container relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <AnimatedSection direction="right" className="order-2 lg:order-1">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-6">
                Moderne Fahrzeugflotte
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Unsere Ausbildung findet auf modernen Fahrzeugen statt, die dem aktuellen Stand der Technik 
                entsprechen. So sind Sie optimal auf die Prüfung und den Berufsalltag vorbereitet.
              </p>
              <ul className="space-y-3">
                {[
                  "Moderne LKW-Flotte (Sattelzüge, Gliederzüge)",
                  "Reise- und Linienbusse für Busausbildung",
                  "Fahrsimulator für risikofreies Training",
                  "Moderne Schulungsräume mit Medientechnik",
                ].map((item, i) => (
                  <AnimatedSection key={item} delay={i * 100}>
                    <li className="flex items-center gap-3 group">
                      <CheckCircle className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                      <span className="text-foreground">{item}</span>
                    </li>
                  </AnimatedSection>
                ))}
              </ul>
            </AnimatedSection>
            <AnimatedSection direction="left" className="order-1 lg:order-2">
              <img 
                src={fleetVehicles}
                alt="Unsere Fahrzeugflotte"
                className="rounded-2xl shadow-xl w-full hover:shadow-2xl transition-shadow duration-500"
              />
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-16 bg-secondary relative overflow-hidden">
        <TrafficSignPattern />
        <div className="section-container relative z-10">
          <AnimatedSection className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-4">
              Zertifizierungen & Qualität
            </h2>
            <p className="text-muted-foreground">
              Als AZAV-zertifizierter Bildungsträger erfüllen wir höchste Qualitätsstandards und ermöglichen 
              die 100% Förderung durch die Agentur für Arbeit.
            </p>
          </AnimatedSection>
          <div className="flex flex-wrap justify-center items-center gap-8">
            {[
              { content: <><Award className="h-8 w-8 text-primary" /><div><p className="font-semibold text-foreground">AZAV zertifiziert</p><p className="text-sm text-muted-foreground">Förderfähige Maßnahmen</p></div></> },
              { content: <img src={tqcertLogo} alt="TQCert" className="h-12 object-contain" /> },
              { content: <><img src={agenturLogo} alt="Agentur für Arbeit" className="h-10 w-10 object-contain" /><div><p className="font-semibold text-foreground">Agentur für Arbeit</p><p className="text-sm text-muted-foreground">Anerkannter Partner</p></div></> },
            ].map((cert, i) => (
              <AnimatedSection key={i} delay={i * 150} direction="scale">
                <div className="flex items-center gap-3 px-6 py-4 bg-card rounded-xl border border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                  {cert.content}
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Locations Quick Overview */}
      <section className="py-16 bg-background relative overflow-hidden">
        <TrafficSignPattern className="opacity-50" />
        <div className="section-container relative z-10">
          <AnimatedSection className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-4">
              Unsere Standorte
            </h2>
            <p className="text-muted-foreground">
              Besuchen Sie uns an einem unserer drei Standorte in der Region.
            </p>
          </AnimatedSection>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Hannover", address: "Vahrenwalder Str. 213", zip: "30165 Hannover", slug: "hannover" },
              { name: "Garbsen", address: "Planetenring 25 – 27", zip: "30823 Garbsen", slug: "garbsen" },
              { name: "Bremen", address: "Bahnhofsplatz 41", zip: "28195 Bremen", slug: "bremen" },
            ].map((loc, i) => (
              <AnimatedSection key={loc.slug} delay={i * 150}>
                <Link 
                  to={`/standort/${loc.slug}`}
                  className="block p-6 bg-card rounded-xl border border-border hover:border-primary/30 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
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
              </AnimatedSection>
            ))}
          </div>
          <AnimatedSection className="text-center mt-8">
            <p className="text-muted-foreground mb-2">
              <Clock className="inline h-4 w-4 mr-1" />
              Öffnungszeiten alle Standorte: Mo-Fr 08:00 - 12:00, 12:30 - 16:30 Uhr
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-accent relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-20 -right-20 w-64 h-64 border-4 border-accent-foreground/20 rounded-full" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 border-4 border-accent-foreground/20 rounded-full" />
        </div>
        <AnimatedSection className="section-container text-center relative z-10">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-accent-foreground mb-4">
            Bereit für Ihre Ausbildung?
          </h2>
          <p className="text-accent-foreground/80 mb-8 max-w-2xl mx-auto">
            Lassen Sie sich kostenlos und unverbindlich beraten. Wir finden gemeinsam die passende Ausbildung für Sie.
          </p>
          <Button variant="secondary" size="lg" asChild className="hover:scale-105 transition-transform">
            <Link to="/#kontakt">
              Jetzt Beratung anfragen
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </AnimatedSection>
      </section>

      <Footer />
    </div>
  );
}
