import { useParams, Link } from "react-router-dom";
import { useEffect } from "react";
import { 
  MapPin, Phone, Mail, Clock, ArrowRight, CheckCircle, 
  Truck, Bus, GraduationCap, BookOpen, Languages, Award,
  Navigation, Building, Users
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Contact } from "@/components/sections/Contact";
import tqcertLogo from "@/assets/tqcert-logo.webp";
import trucksImage from "@/assets/trucks-metropol.jpg";
import busImage from "@/assets/bus-metropol.jpg";
import fleetTeam from "@/assets/fleet-team.webp";

interface LocationData {
  slug: string;
  name: string;
  fullName: string;
  address: string;
  zipCity: string;
  phone: string;
  email: string;
  openingHours: string;
  mapUrl: string;
  heroImage: string;
  description: string;
  metaTitle: string;
  metaDescription: string;
  features: string[];
  courses: {
    slug: string;
    title: string;
    icon: React.ElementType;
    description: string;
    available: boolean;
  }[];
  directions: {
    car: string;
    publicTransport: string;
    parking: string;
  };
}

const locationsData: Record<string, LocationData> = {
  hannover: {
    slug: "hannover",
    name: "Hannover",
    fullName: "Fahrschule Metropol Bildungszentrum Hannover",
    address: "Vahrenwalder Str. 213",
    zipCity: "30165 Hannover",
    phone: "0511 123 456",
    email: "info@mep-agentur.de",
    openingHours: "Mo-Fr: 08:00 - 12:00, 12:30 - 16:30 Uhr",
    mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2435.5!2d9.738!3d52.395!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47b00b514d494f85%3A0x425ac6d94ac4720!2sVahrenwalder+Str.+213%2C+30165+Hannover!5e0!3m2!1sde!2sde!4v1704900000000!5m2!1sde!2sde",
    heroImage: "trucks",
    description: "Unser Hauptstandort in Hannover ist das größte Bildungszentrum der Metropol-Gruppe. Mit modernsten Schulungsräumen, einer großen LKW- und Bus-Flotte und erfahrenen Fahrlehrern bieten wir hier das komplette Ausbildungsprogramm an.",
    metaTitle: "Fahrschule Hannover – LKW & Bus Führerschein | Metropol Bildungszentrum",
    metaDescription: "LKW-Führerschein C/CE, Busführerschein D/DE und Fahrlehrer-Ausbildung in Hannover. AZAV-zertifiziert, 100% Förderung möglich. Jetzt Beratung anfragen!",
    features: [
      "Größter Standort mit 8 Schulungsräumen",
      "Komplette LKW- und Bus-Flotte vor Ort",
      "Fahrlehrer-Ausbildung ausschließlich hier",
      "Eigener Übungsplatz für praktische Ausbildung",
      "Optimale Anbindung an A2, A7 und Stadtbahn",
      "Kostenlose Parkplätze für Kursteilnehmer"
    ],
    courses: [
      { slug: "c-ce", title: "LKW-Führerschein C/CE", icon: Truck, description: "Komplette Ausbildung für den LKW-Führerschein", available: true },
      { slug: "d-de", title: "Busführerschein D/DE", icon: Bus, description: "Personenbeförderung im ÖPNV und Reiseverkehr", available: true },
      { slug: "fahrlehrer", title: "Fahrlehrer-Ausbildung", icon: GraduationCap, description: "12-monatige staatlich anerkannte Ausbildung", available: true },
      { slug: "bkf-weiterbildung", title: "BKF-Weiterbildung", icon: BookOpen, description: "Module 1-5 für Berufskraftfahrer", available: true },
      { slug: "sprachkurse", title: "Sprachkurse", icon: Languages, description: "Deutsch für Berufskraftfahrer", available: true },
    ],
    directions: {
      car: "Über die A2 (Abfahrt Hannover-Herrenhausen) oder A7 (Abfahrt Hannover-Anderten). Folgen Sie der Beschilderung Richtung Zentrum.",
      publicTransport: "Stadtbahn Linien 1, 2, 8 bis Haltestelle Vahrenwald, dann 5 Minuten Fußweg.",
      parking: "Kostenlose Parkplätze für Kursteilnehmer direkt am Gebäude."
    }
  },
  bremen: {
    slug: "bremen",
    name: "Bremen",
    fullName: "Fahrschule Metropol Bildungszentrum Bremen",
    address: "Bahnhofsplatz 41",
    zipCity: "28195 Bremen",
    phone: "0421 789 012",
    email: "info@mep-agentur.de",
    openingHours: "Mo-Fr: 08:00 - 12:00, 12:30 - 16:30 Uhr",
    mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2395.5!2d8.8!3d53.08!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47b1281e22502089%3A0x4240fe7314f89f0!2sBremen%20Hauptbahnhof!5e0!3m2!1sde!2sde!4v1704900000000!5m2!1sde!2sde",
    heroImage: "bus",
    description: "Der Standort Bremen ist spezialisiert auf die Ausbildung im Güter- und Personenverkehr. Die Nähe zum Bremer Hafen und den großen Logistikzentren bietet ideale Bedingungen für praxisnahe Ausbildung.",
    metaTitle: "Fahrschule Bremen – LKW & Bus Führerschein | Metropol Bildungszentrum",
    metaDescription: "LKW-Führerschein C/CE und Busführerschein D/DE in Bremen. Nahe Hafen & Logistikzentren. AZAV-zertifiziert. Kostenlose Beratung anfordern!",
    features: [
      "Spezialisiert auf Hafen- und Logistikverkehr",
      "Moderne LKW- und Bus-Flotte",
      "Praxisnahe Ausbildung im echten Verkehr",
      "Gute Kontakte zu Bremer Transportunternehmen",
      "Zentrale Lage am Hauptbahnhof",
      "Kompaktkurse für Berufstätige"
    ],
    courses: [
      { slug: "c-ce", title: "LKW-Führerschein C/CE", icon: Truck, description: "Komplette Ausbildung für den LKW-Führerschein", available: true },
      { slug: "d-de", title: "Busführerschein D/DE", icon: Bus, description: "Personenbeförderung im ÖPNV und Reiseverkehr", available: true },
      { slug: "fahrlehrer", title: "Fahrlehrer-Ausbildung", icon: GraduationCap, description: "12-monatige staatlich anerkannte Ausbildung", available: false },
      { slug: "bkf-weiterbildung", title: "BKF-Weiterbildung", icon: BookOpen, description: "Module 1-5 für Berufskraftfahrer", available: true },
      { slug: "sprachkurse", title: "Sprachkurse", icon: Languages, description: "Deutsch für Berufskraftfahrer", available: true },
    ],
    directions: {
      car: "Über die A1 (Abfahrt Bremen-Hemelingen) oder A27 (Abfahrt Bremen-Überseestadt). Folgen Sie der Beschilderung Richtung Zentrum/Hauptbahnhof.",
      publicTransport: "Straßenbahn Linien 1, 4, 6 bis Haltestelle Hauptbahnhof. Der Standort ist 3 Minuten Fußweg vom Hauptbahnhof entfernt.",
      parking: "Öffentliche Parkhäuser am Hauptbahnhof in 5 Minuten Fußweg erreichbar."
    }
  },
  garbsen: {
    slug: "garbsen",
    name: "Garbsen",
    fullName: "Fahrschule Metropol Bildungszentrum Garbsen",
    address: "Planetenring 25 – 27",
    zipCity: "30823 Garbsen",
    phone: "05131 345 678",
    email: "info@mep-agentur.de",
    openingHours: "Mo-Fr: 08:00 - 12:00, 12:30 - 16:30 Uhr",
    mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d38891.32614375611!2d9.559087149999999!3d52.43!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47b0715d1c28e55d%3A0x422435029b0e6e0!2sGarbsen!5e0!3m2!1sde!2sde!4v1704900000000!5m2!1sde!2sde",
    heroImage: "trucks",
    description: "Der Standort Garbsen bietet ideale Bedingungen für die praktische LKW-Ausbildung. Das weitläufige Gelände und die Nähe zur Autobahn A2 ermöglichen intensives Training unter realen Bedingungen.",
    metaTitle: "Fahrschule Garbsen – LKW Führerschein & BKF Weiterbildung | Metropol",
    metaDescription: "LKW-Führerschein C/CE und BKF-Weiterbildung in Garbsen bei Hannover. Großes Übungsgelände, A2-Anbindung. AZAV-zertifiziert. Jetzt anfragen!",
    features: [
      "Großer Übungsplatz für LKW-Training",
      "Direkt an der A2 gelegen",
      "Ruhiges Umfeld für konzentriertes Lernen",
      "Kostenlose Parkplätze in großer Zahl",
      "Fokus auf LKW-Ausbildung und Weiterbildung",
      "Flexible Kurszeiten für Berufstätige"
    ],
    courses: [
      { slug: "c-ce", title: "LKW-Führerschein C/CE", icon: Truck, description: "Komplette Ausbildung für den LKW-Führerschein", available: true },
      { slug: "d-de", title: "Busführerschein D/DE", icon: Bus, description: "Personenbeförderung im ÖPNV und Reiseverkehr", available: false },
      { slug: "fahrlehrer", title: "Fahrlehrer-Ausbildung", icon: GraduationCap, description: "12-monatige staatlich anerkannte Ausbildung", available: false },
      { slug: "bkf-weiterbildung", title: "BKF-Weiterbildung", icon: BookOpen, description: "Module 1-5 für Berufskraftfahrer", available: true },
      { slug: "sprachkurse", title: "Sprachkurse", icon: Languages, description: "Deutsch für Berufskraftfahrer", available: false },
    ],
    directions: {
      car: "Direkt an der A2, Abfahrt Garbsen. Das Bildungszentrum liegt 2 Minuten von der Autobahnabfahrt entfernt.",
      publicTransport: "S-Bahn Linie S1 bis Garbsen, dann Bus 420 bis Haltestelle Planetenring.",
      parking: "Großzügiger kostenloser Parkplatz direkt am Gebäude."
    }
  }
};

const getHeroImage = (type: string) => {
  switch(type) {
    case "trucks": return trucksImage;
    case "bus": return busImage;
    case "team": return fleetTeam;
    default: return trucksImage;
  }
};

export default function LocationPage() {
  const { locationSlug } = useParams<{ locationSlug: string }>();
  const data = locationSlug ? locationsData[locationSlug] : null;

  // Update document title and meta tags for SEO
  useEffect(() => {
    if (data) {
      document.title = data.metaTitle;
      
      // Update or create meta description
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute('content', data.metaDescription);

      // Add structured data for local business
      const existingScript = document.querySelector('script[type="application/ld+json"][data-location]');
      if (existingScript) {
        existingScript.remove();
      }
      
      const structuredData = {
        "@context": "https://schema.org",
        "@type": "DrivingSchool",
        "name": data.fullName,
        "description": data.description,
        "address": {
          "@type": "PostalAddress",
          "streetAddress": data.address,
          "addressLocality": data.name,
          "postalCode": data.zipCity.split(" ")[0],
          "addressCountry": "DE"
        },
        "telephone": data.phone,
        "email": data.email,
        "openingHours": "Mo-Fr 08:00-18:00",
        "priceRange": "€€",
        "image": getHeroImage(data.heroImage),
        "areaServed": data.name,
        "hasCredential": [
          { "@type": "EducationalOccupationalCredential", "credentialCategory": "AZAV Zertifizierung" }
        ]
      };

      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-location', 'true');
      script.textContent = JSON.stringify(structuredData);
      document.head.appendChild(script);

      return () => {
        const scriptToRemove = document.querySelector('script[type="application/ld+json"][data-location]');
        if (scriptToRemove) {
          scriptToRemove.remove();
        }
      };
    }
  }, [data]);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Standort nicht gefunden</h1>
          <Link to="/" className="text-primary hover:underline">Zurück zur Startseite</Link>
        </div>
      </div>
    );
  }

  const availableCourses = data.courses.filter(c => c.available);

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-28 sm:pt-32">
        <div className="relative w-full h-[350px] sm:h-[450px] overflow-hidden">
          <img 
            src={getHeroImage(data.heroImage)}
            alt={`Fahrschule ${data.name}`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
            <div className="section-container">
              <nav className="flex items-center gap-2 text-white/70 text-sm mb-4">
                <Link to="/" className="hover:text-white transition-colors">Startseite</Link>
                <span>/</span>
                <Link to="/#standorte" className="hover:text-white transition-colors">Standorte</Link>
                <span>/</span>
                <span className="text-white">{data.name}</span>
              </nav>
              <p className="text-primary font-semibold mb-2">Standort {data.name}</p>
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-4">
                {data.fullName}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-white/90">
                <span className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {data.address}, {data.zipCity}
                </span>
                <span className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {data.phone}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Info Bar */}
      <section className="bg-primary text-primary-foreground py-4">
        <div className="section-container">
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4" />
              <span>AZAV zertifiziert</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              <span>100% Förderung möglich</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>{availableCourses.length} Kursangebote</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>{data.openingHours}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Description & Contact */}
      <section className="py-16 bg-background">
        <div className="section-container">
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-6">
                Willkommen in {data.name}
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                {data.description}
              </p>
              
              {/* Features */}
              <div className="grid sm:grid-cols-2 gap-4">
                {data.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Card */}
            <div className="bg-card rounded-2xl border border-border p-6 shadow-lg h-fit">
              <h3 className="font-display font-bold text-lg text-foreground mb-6">
                Kontakt & Öffnungszeiten
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{data.address}</p>
                    <p className="text-muted-foreground">{data.zipCity}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <a href={`tel:${data.phone.replace(/\s/g, '')}`} className="font-medium text-primary hover:underline">
                      {data.phone}
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <a href={`mailto:${data.email}`} className="font-medium text-primary hover:underline break-all">
                      {data.email}
                    </a>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Öffnungszeiten</p>
                    <p className="text-muted-foreground">{data.openingHours}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-border">
                <Button variant="default" className="w-full" asChild>
                  <a href="#kontakt">
                    Jetzt Beratung anfragen
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Courses at this location */}
      <section className="py-16 bg-secondary">
        <div className="section-container">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-4">
              Kursangebot
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-4">
              Verfügbare Kurse in {data.name}
            </h2>
            <p className="text-muted-foreground">
              Alle unsere Kurse sind AZAV-zertifiziert und können bis zu 100% durch die Agentur für Arbeit gefördert werden.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.courses.map((course) => (
              <div 
                key={course.slug}
                className={`bg-card rounded-xl border p-6 transition-all ${
                  course.available 
                    ? "border-border hover:border-primary/50 hover:shadow-lg" 
                    : "border-border/50 opacity-60"
                }`}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className={`p-3 rounded-xl ${course.available ? "bg-primary/10" : "bg-muted"}`}>
                    <course.icon className={`h-6 w-6 ${course.available ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-display font-bold text-foreground mb-1">
                      {course.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {course.description}
                    </p>
                  </div>
                </div>

                {course.available ? (
                  <Button variant="outline" className="w-full group" asChild>
                    <Link to={`/fuehrerschein/${course.slug}`}>
                      Mehr erfahren
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                ) : (
                  <div className="text-center py-2 text-sm text-muted-foreground">
                    Nicht an diesem Standort verfügbar
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Google Maps */}
      <section className="py-16 bg-background">
        <div className="section-container">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Map */}
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-6">
                So finden Sie uns
              </h2>
              <div className="rounded-xl overflow-hidden border border-border shadow-lg aspect-video">
                <iframe
                  src={data.mapUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={`Google Maps - Fahrschule Metropol ${data.name}`}
                  className="w-full h-full min-h-[300px]"
                />
              </div>
              <div className="mt-4">
                <Button variant="outline" asChild>
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.address + ', ' + data.zipCity)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Navigation className="mr-2 h-4 w-4" />
                    In Google Maps öffnen
                  </a>
                </Button>
              </div>
            </div>

            {/* Directions */}
            <div>
              <h3 className="font-display text-xl font-bold text-foreground mb-6">
                Anfahrt & Parken
              </h3>
              
              <div className="space-y-6">
                <div className="bg-card rounded-xl border border-border p-5">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Truck className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Mit dem Auto</h4>
                      <p className="text-muted-foreground text-sm">{data.directions.car}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-card rounded-xl border border-border p-5">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Bus className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Öffentliche Verkehrsmittel</h4>
                      <p className="text-muted-foreground text-sm">{data.directions.publicTransport}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-card rounded-xl border border-border p-5">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Building className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Parkmöglichkeiten</h4>
                      <p className="text-muted-foreground text-sm">{data.directions.parking}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-12 bg-secondary">
        <div className="section-container">
          <div className="flex flex-wrap items-center justify-center gap-8">
            <div className="flex items-center gap-3 px-6 py-3 bg-card rounded-xl border border-border">
              <Award className="h-6 w-6 text-primary" />
              <div>
                <p className="font-semibold text-foreground text-sm">AZAV zertifiziert</p>
                <p className="text-xs text-muted-foreground">Anerkannter Bildungsträger</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-6 py-3 bg-card rounded-xl border border-border">
              <CheckCircle className="h-6 w-6 text-primary" />
              <div>
                <p className="font-semibold text-foreground text-sm">Agentur für Arbeit</p>
                <p className="text-xs text-muted-foreground">100% Förderung möglich</p>
              </div>
            </div>
            <img 
              src={tqcertLogo} 
              alt="TQCert Zertifizierung" 
              className="h-14 object-contain"
            />
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <Contact preselectedCourse={undefined} />
      
      <Footer />
    </div>
  );
}
