import { useParams, Link } from "react-router-dom";
import { useEffect } from "react";
import { 
  MapPin, Phone, Mail, Clock, ArrowRight, CheckCircle, 
  Truck, Bus, GraduationCap, BookOpen, Award,
  Navigation, Building, Users, Loader2
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Contact } from "@/components/sections/Contact";
import { useLocation as useLocationData } from "@/hooks/useLocations";
import { useCoursesByLocation } from "@/hooks/useCourses";
import tqcertLogo from "@/assets/tqcert-logo.webp";
import agenturLogo from "@/assets/agentur-fuer-arbeit-logo.png";
import trucksImage from "@/assets/trucks-metropol.jpg";
import busImage from "@/assets/bus-metropol.jpg";
import fleetTeam from "@/assets/fleet-team.webp";

// Map location slug to hero image
const locationHeroImages: Record<string, string> = {
  hannover: trucksImage,
  bremen: busImage,
  garbsen: trucksImage,
};

// Course icons mapping
const courseIcons: Record<string, React.ElementType> = {
  lkw: Truck,
  bus: Bus,
  fahrlehrer: GraduationCap,
  bkf: BookOpen,
  sonstige: Award,
};

export default function LocationPage() {
  const { locationSlug } = useParams<{ locationSlug: string }>();
  const { data: location, isLoading, error } = useLocationData(locationSlug || "");
  const { data: locationCourses = [] } = useCoursesByLocation(location?.id);

  // Update document title and meta tags for SEO
  useEffect(() => {
    if (location) {
      const metaTitle = `Fahrschule ${location.name} – LKW & Bus Führerschein | Metropol Bildungszentrum`;
      const metaDescription = `LKW-Führerschein C/CE, Busführerschein D/DE und BKF-Weiterbildung in ${location.name}. AZAV-zertifiziert, 100% Förderung möglich. Jetzt Beratung anfragen!`;
      
      document.title = metaTitle;
      
      // Update or create meta description
      let metaDescriptionEl = document.querySelector('meta[name="description"]');
      if (!metaDescriptionEl) {
        metaDescriptionEl = document.createElement('meta');
        metaDescriptionEl.setAttribute('name', 'description');
        document.head.appendChild(metaDescriptionEl);
      }
      metaDescriptionEl.setAttribute('content', metaDescription);

      // Add structured data for local business
      const existingScript = document.querySelector('script[type="application/ld+json"][data-location]');
      if (existingScript) {
        existingScript.remove();
      }
      
      const structuredData = {
        "@context": "https://schema.org",
        "@type": "DrivingSchool",
        "name": `Fahrschule Metropol Bildungszentrum ${location.name}`,
        "description": `Professionelle Berufskraftfahrer-Ausbildung in ${location.name}`,
        "address": {
          "@type": "PostalAddress",
          "streetAddress": location.address,
          "addressLocality": location.name,
          "postalCode": location.zip_city.split(" ")[0],
          "addressCountry": "DE"
        },
        "telephone": location.phone,
        "email": location.email,
        "openingHours": location.opening_hours || "Mo-Fr 08:00-16:30",
        "priceRange": "€€",
        "areaServed": location.name,
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
  }, [location]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Standort wird geladen...</span>
        </div>
        <Footer />
      </div>
    );
  }

  // Not found
  if (error || !location) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Standort nicht gefunden</h1>
            <p className="text-muted-foreground mb-6">
              Der gesuchte Standort existiert nicht oder ist nicht mehr verfügbar.
            </p>
            <Button asChild>
              <Link to="/">Zurück zur Startseite</Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const heroImage = locationHeroImages[location.slug] || trucksImage;
  const activeCourses = locationCourses;

  // Location-specific features (these could be added to DB later)
  const features = [
    "AZAV-zertifiziertes Bildungszentrum",
    "Moderne Schulungsräume",
    "Erfahrene Fahrlehrer",
    "100% Förderung möglich",
    "Flexible Kurszeiten",
    "Gute Verkehrsanbindung"
  ];

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-28 sm:pt-32">
        <div className="relative w-full h-[350px] sm:h-[450px] overflow-hidden">
          <img 
            src={heroImage}
            alt={`Fahrschule ${location.name}`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
            <div className="section-container">
              <nav className="flex items-center gap-2 text-white/70 text-sm mb-4">
                <Link to="/" className="hover:text-white transition-colors">Startseite</Link>
                <span>/</span>
                <Link to="/kontakt" className="hover:text-white transition-colors">Standorte</Link>
                <span>/</span>
                <span className="text-white">{location.name}</span>
              </nav>
              <p className="text-primary font-semibold mb-2">Standort {location.name}</p>
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-4">
                Fahrschule Metropol Bildungszentrum {location.name}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-white/90">
                <span className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {location.address}, {location.zip_city}
                </span>
                {location.phone && (
                  <span className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {location.phone}
                  </span>
                )}
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
              <span>{activeCourses.length} Kursangebote</span>
            </div>
            {location.opening_hours && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{location.opening_hours}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Description & Contact */}
      <section className="py-16 bg-background">
        <div className="section-container">
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-6">
                Willkommen in {location.name}
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                Unser Standort in {location.name} bietet Ihnen professionelle Berufskraftfahrer-Ausbildung 
                in modernsten Schulungsräumen. Mit erfahrenen Fahrlehrern und einer umfangreichen Fahrzeugflotte 
                bereiten wir Sie optimal auf Ihre Karriere vor.
              </p>
              
              {/* Features */}
              <div className="grid sm:grid-cols-2 gap-4">
                {features.map((feature, index) => (
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
                    <p className="font-medium text-foreground">{location.address}</p>
                    <p className="text-muted-foreground">{location.zip_city}</p>
                  </div>
                </div>
                
                {location.phone && (
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <a href={`tel:${location.phone.replace(/\s/g, '')}`} className="font-medium text-primary hover:underline">
                        {location.phone}
                      </a>
                    </div>
                  </div>
                )}
                
                {location.email && (
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <a href={`mailto:${location.email}`} className="font-medium text-primary hover:underline break-all">
                        {location.email}
                      </a>
                    </div>
                  </div>
                )}
                
                {location.opening_hours && (
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Öffnungszeiten</p>
                      <p className="text-muted-foreground">{location.opening_hours}</p>
                    </div>
                  </div>
                )}
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

      {/* Available Courses */}
      <section className="py-16 bg-secondary">
        <div className="section-container">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-4">Kursangebot</p>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-4">
              Unsere Kurse in {location.name}
            </h2>
            <p className="text-muted-foreground">
              Entdecken Sie unser umfangreiches Ausbildungsangebot für Berufskraftfahrer.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeCourses.map((course) => {
              const IconComponent = courseIcons[course.category] || Award;
              return (
                <Link
                  key={course.id}
                  to={`/fuehrerschein/${course.slug}`}
                  className="bg-card rounded-xl p-6 border border-border hover:border-primary/50 hover:shadow-lg transition-all group"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <IconComponent className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-display font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {course.description || "Professionelle Ausbildung mit erfahrenen Fahrlehrern."}
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Map Section */}
      {location.map_url && (
        <section className="py-16 bg-background">
          <div className="section-container">
            <div className="text-center max-w-3xl mx-auto mb-8">
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-4">
                So finden Sie uns
              </h2>
              <p className="text-muted-foreground">
                {location.address}, {location.zip_city}
              </p>
            </div>

            <div className="rounded-2xl overflow-hidden border border-border shadow-lg">
              <iframe
                src={location.map_url}
                width="100%"
                height="450"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </section>
      )}

      {/* Trust Badges */}
      <section className="py-12 bg-secondary">
        <div className="section-container">
          <div className="flex flex-wrap justify-center items-center gap-8">
            <div className="flex items-center gap-3 px-6 py-4 bg-card rounded-xl border border-border">
              <Award className="h-8 w-8 text-primary" />
              <div>
                <p className="font-semibold text-foreground">AZAV zertifiziert</p>
                <p className="text-sm text-muted-foreground">Anerkannter Bildungsträger</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-6 py-4 bg-card rounded-xl border border-border">
              <img src={agenturLogo} alt="Agentur für Arbeit" className="h-10 w-10 object-contain" />
              <div>
                <p className="font-semibold text-foreground">100% Förderung</p>
                <p className="text-sm text-muted-foreground">Durch Bildungsgutschein</p>
              </div>
            </div>
            <img 
              src={tqcertLogo} 
              alt="TQCert Zertifizierung" 
              className="h-16 object-contain"
            />
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <Contact />
      
      <Footer />
    </div>
  );
}
