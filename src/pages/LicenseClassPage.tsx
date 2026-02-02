import { useParams, Link } from "react-router-dom";
import { ArrowRight, Clock, MapPin, Calendar, CheckCircle, Phone, Euro, Award, Users, FileText } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Contact } from "@/components/sections/Contact";

interface LicenseClassData {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  duration: string;
  price: string;
  locations: string[];
  nextDates: string[];
  requirements: string[];
  curriculum: string[];
  benefits: string[];
  funding: string;
  heroImage?: string;
}

const licenseClassesData: Record<string, LicenseClassData> = {
  "c-ce": {
    slug: "c-ce",
    title: "Führerschein C/CE",
    subtitle: "LKW-Führerschein für Berufskraftfahrer",
    description: "Mit dem Führerschein der Klasse C/CE eröffnen sich Ihnen vielfältige Karrieremöglichkeiten im Transportwesen. Als einer der gefragtesten Berufe auf dem Arbeitsmarkt bietet die LKW-Branche sichere Arbeitsplätze und attraktive Verdienstmöglichkeiten.",
    duration: "8-10 Wochen Vollzeit",
    price: "ab 3.500 €",
    locations: ["Hannover", "Bremen", "Garbsen"],
    nextDates: ["03.03.2026", "14.04.2026", "02.06.2026"],
    requirements: [
      "Mindestalter 21 Jahre (18 Jahre mit Berufskraftfahrer-Grundqualifikation)",
      "Führerschein Klasse B",
      "Ärztliches Gutachten (Sehtest + Gesundheitsuntersuchung)",
      "Biometrisches Passfoto",
      "Erste-Hilfe-Kurs (9 UE)"
    ],
    curriculum: [
      "Theoretischer Unterricht (mindestens 10 Doppelstunden Zusatzstoff)",
      "Praktische Ausbildung nach Ausbildungsstand",
      "Sonderfahrten: Überland, Autobahn, Nachtfahrt",
      "Fahrzeugkunde und Ladungssicherung",
      "Prüfungsvorbereitung Theorie und Praxis"
    ],
    benefits: [
      "Kleine Gruppen für optimalen Lernerfolg",
      "Modernste LKW-Flotte",
      "Erfahrene Fahrlehrer mit Praxisbezug",
      "Hohe Erstbestehensquote",
      "Unterstützung bei Förderanträgen",
      "Jobvermittlung nach erfolgreichem Abschluss"
    ],
    funding: "100% Förderung durch Bildungsgutschein der Agentur für Arbeit oder des Jobcenters möglich."
  },
  "d-de": {
    slug: "d-de",
    title: "Führerschein D/DE",
    subtitle: "Busführerschein für Personenbeförderung",
    description: "Der Busführerschein Klasse D/DE qualifiziert Sie für die gewerbliche Personenbeförderung. Als Busfahrer übernehmen Sie Verantwortung für Ihre Fahrgäste und genießen einen abwechslungsreichen Arbeitsalltag im öffentlichen Nahverkehr oder Reiseverkehr.",
    duration: "6-8 Wochen Vollzeit",
    price: "ab 4.200 €",
    locations: ["Hannover", "Bremen"],
    nextDates: ["17.03.2026", "05.05.2026", "23.06.2026"],
    requirements: [
      "Mindestalter 24 Jahre (21/23 Jahre mit Berufskraftfahrer-Grundqualifikation)",
      "Führerschein Klasse B",
      "Ärztliches Gutachten (Sehtest + Gesundheitsuntersuchung)",
      "Biometrisches Passfoto",
      "Erste-Hilfe-Kurs (9 UE)",
      "Führungszeugnis ohne relevante Einträge"
    ],
    curriculum: [
      "Theoretischer Unterricht (mindestens 18 Doppelstunden Zusatzstoff)",
      "Umfangreiche praktische Ausbildung",
      "Sonderfahrten auf verschiedenen Streckentypen",
      "Umgang mit Fahrgästen und Konfliktmanagement",
      "Fahrerassistenzsysteme und moderne Bustechnik",
      "Prüfungsvorbereitung Theorie und Praxis"
    ],
    benefits: [
      "Ausbildung an modernen Reise- und Linienbussen",
      "Praxisnahe Schulung im echten Verkehr",
      "Kleine Lerngruppen",
      "Erfahrene Ausbilder aus dem Busgewerbe",
      "Kontakte zu regionalen Busunternehmen",
      "Unterstützung bei der Jobsuche"
    ],
    funding: "100% Förderung durch Bildungsgutschein der Agentur für Arbeit oder des Jobcenters möglich."
  },
  "fahrlehrer": {
    slug: "fahrlehrer",
    title: "Fahrlehrer-Ausbildung",
    subtitle: "Werden Sie staatlich anerkannter Fahrlehrer",
    description: "Die Fahrlehrerausbildung eröffnet Ihnen den Weg in einen abwechslungsreichen und sinnstiftenden Beruf. Als Fahrlehrer begleiten Sie Menschen auf dem Weg zum Führerschein und tragen aktiv zur Verkehrssicherheit bei.",
    duration: "12 Monate",
    price: "ab 12.000 €",
    locations: ["Hannover"],
    nextDates: ["01.04.2026", "01.09.2026"],
    requirements: [
      "Mindestalter 21 Jahre",
      "Führerschein Klasse B seit mindestens 3 Jahren",
      "Geistige und körperliche Eignung",
      "Abgeschlossene Berufsausbildung oder gleichwertiger Abschluss",
      "Keine relevanten Einträge im Führungszeugnis"
    ],
    curriculum: [
      "Fahrpädagogik und Verkehrsverhalten",
      "Ausbildungsplanung und -durchführung",
      "Recht und Straßenverkehrsrecht",
      "Technik und Umweltschutz",
      "Praktische Ausbildung (Lehrproben)",
      "Hospitationspraktikum in einer Fahrschule"
    ],
    benefits: [
      "Staatlich anerkannte Ausbildungsstätte",
      "Erfahrene Ausbildungsfahrlehrer",
      "Moderne Unterrichtsräume und Fahrzeuge",
      "Hohe Prüfungserfolgsquote",
      "Karrieremöglichkeiten in der Fahrschulbranche",
      "Flexibler Beruf mit guten Verdienstmöglichkeiten"
    ],
    funding: "Förderung durch Aufstiegs-BAföG oder Bildungsgutschein möglich. Wir beraten Sie gerne zu Ihren Möglichkeiten."
  },
  "bkf-weiterbildung": {
    slug: "bkf-weiterbildung",
    title: "BKF-Weiterbildung",
    subtitle: "Module 1-5 für Berufskraftfahrer",
    description: "Die gesetzlich vorgeschriebene Weiterbildung für Berufskraftfahrer umfasst 35 Stunden, aufgeteilt in 5 Module. Alle 5 Jahre müssen Inhaber einer Fahrerlaubnis der Klassen C1, C1E, C, CE, D1, D1E, D oder DE diese Weiterbildung absolvieren.",
    duration: "5 Tage (je 7 Stunden pro Modul)",
    price: "120 € pro Modul",
    locations: ["Hannover", "Bremen", "Garbsen"],
    nextDates: ["10.02.2026", "24.02.2026", "10.03.2026"],
    requirements: [
      "Gültige Fahrerlaubnis Klasse C1, C, D1 oder D",
      "Grundqualifikation oder beschleunigte Grundqualifikation",
      "Eintrag der Schlüsselzahl 95 im Führerschein"
    ],
    curriculum: [
      "Modul 1: Eco-Training und Fahrsicherheit",
      "Modul 2: Sozialvorschriften im Straßenverkehr",
      "Modul 3: Sicherheitstechnik und Fahrsicherheit",
      "Modul 4: Fahrgastsicherheit und Gesundheit",
      "Modul 5: Ladungssicherung (LKW) / Kundenorientierung (Bus)"
    ],
    benefits: [
      "Flexible Terminwahl",
      "Module einzeln oder als Kompaktkurs buchbar",
      "Bescheinigung zur Verlängerung der Schlüsselzahl 95",
      "Praxisnahe Inhalte von erfahrenen Dozenten",
      "Moderne Schulungsräume",
      "Kostenlose Getränke und Snacks"
    ],
    funding: "Bei Arbeitslosigkeit oder drohender Arbeitslosigkeit kann die Weiterbildung gefördert werden."
  },
  "sprachkurse": {
    slug: "sprachkurse",
    title: "Sprachkurse für Berufskraftfahrer",
    subtitle: "Deutsch für den Berufsalltag",
    description: "Unsere Sprachkurse bereiten Sie gezielt auf die Kommunikation im Berufsalltag als Kraftfahrer vor. Sie lernen wichtiges Fachvokabular, verstehen Arbeitsanweisungen und können sich sicher mit Kollegen, Kunden und Behörden verständigen.",
    duration: "4 Wochen Vollzeit",
    price: "ab 800 €",
    locations: ["Hannover", "Bremen"],
    nextDates: ["24.02.2026", "07.04.2026", "19.05.2026"],
    requirements: [
      "Grundkenntnisse der deutschen Sprache (A1-A2 empfohlen)",
      "Interesse an einer Tätigkeit als Berufskraftfahrer",
      "Motivation zum Sprachenlernen"
    ],
    curriculum: [
      "Grundwortschatz für den Transportbereich",
      "Kommunikation bei Be- und Entladung",
      "Verkehrsregeln und Beschilderung",
      "Lenk- und Ruhezeiten verstehen",
      "Umgang mit Frachtdokumenten",
      "Kommunikation bei Kontrollen und Unfällen"
    ],
    benefits: [
      "Kleine Gruppen für intensives Lernen",
      "Muttersprachliche und mehrsprachige Dozenten",
      "Praxisbezogenes Fachvokabular",
      "Übungen mit echten Dokumenten und Situationen",
      "Vorbereitung auf Führerscheinprüfung",
      "Kulturelle Integration"
    ],
    funding: "Förderung über Integrationskurse oder BAMF möglich. Wir unterstützen Sie bei der Antragstellung."
  }
};

export default function LicenseClassPage() {
  const { classType } = useParams<{ classType: string }>();
  const data = classType ? licenseClassesData[classType] : null;

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Seite nicht gefunden</h1>
          <Link to="/" className="text-primary hover:underline">Zurück zur Startseite</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section 
        className="relative pt-32 pb-20 overflow-hidden"
        style={{
          background: "linear-gradient(135deg, hsl(136 100% 35%) 0%, hsl(136 85% 28%) 50%, hsl(140 80% 22%) 100%)"
        }}
      >
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -z-10" />
        
        <div className="section-container">
          <div className="max-w-3xl">
            <Link to="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors">
              ← Zurück zur Startseite
            </Link>
            
            <p className="text-white/80 font-medium mb-2">{data.subtitle}</p>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              {data.title}
            </h1>
            <p className="text-lg sm:text-xl text-white/80 leading-relaxed mb-8">
              {data.description}
            </p>
            
            <div className="flex flex-wrap gap-6 mb-8 text-white">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-white/80" />
                <span>{data.duration}</span>
              </div>
              <div className="flex items-center gap-2">
                <Euro className="h-5 w-5 text-white/80" />
                <span>{data.price}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-white/80" />
                <span>{data.locations.join(", ")}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="heroWhite" size="xl" asChild>
                <a href="#kontakt">
                  Jetzt anmelden
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
              <Button variant="heroOutline" size="xl" asChild>
                <a href="tel:+49511123456">
                  <Phone className="mr-2 h-5 w-5" />
                  Beratung: 0511 123 456
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Key Info Cards */}
      <section className="py-16 bg-secondary">
        <div className="section-container">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
              <Calendar className="h-8 w-8 text-primary mb-4" />
              <h3 className="font-display font-bold text-lg mb-3">Nächste Starttermine</h3>
              <ul className="space-y-2">
                {data.nextDates.map((date) => (
                  <li key={date} className="flex items-center gap-2 text-muted-foreground">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    {date}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
              <Award className="h-8 w-8 text-primary mb-4" />
              <h3 className="font-display font-bold text-lg mb-3">Förderung</h3>
              <p className="text-muted-foreground">{data.funding}</p>
            </div>
            
            <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
              <Users className="h-8 w-8 text-primary mb-4" />
              <h3 className="font-display font-bold text-lg mb-3">Standorte</h3>
              <ul className="space-y-2">
                {data.locations.map((location) => (
                  <li key={location} className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4 text-primary" />
                    {location}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Requirements & Curriculum */}
      <section className="py-20 bg-background">
        <div className="section-container">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Requirements */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <h2 className="font-display text-2xl font-bold">Voraussetzungen</h2>
              </div>
              <ul className="space-y-4">
                {data.requirements.map((req, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Curriculum */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <h2 className="font-display text-2xl font-bold">Ausbildungsinhalte</h2>
              </div>
              <ul className="space-y-4">
                {data.curriculum.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-medium shrink-0">
                      {index + 1}
                    </span>
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-secondary">
        <div className="section-container">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-4">Ihre Vorteile</p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
              Warum bei Metropol?
            </h2>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.benefits.map((benefit, index) => (
              <div 
                key={index}
                className="bg-card rounded-xl p-6 border border-border hover:border-primary/30 hover:shadow-lg transition-all"
              >
                <CheckCircle className="h-8 w-8 text-primary mb-4" />
                <p className="font-medium text-foreground">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <Contact />
      
      <Footer />
    </div>
  );
}