import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Clock, ArrowRight, Loader2 } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Contact } from "@/components/sections/Contact";
import { Button } from "@/components/ui/button";
import { useLocations } from "@/hooks/useLocations";

export default function ContactPage() {
  const { data: locations = [], isLoading } = useLocations();

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="pt-28 sm:pt-32 pb-8 bg-secondary">
        <div className="section-container">
          <div className="max-w-3xl">
            <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-4">Kontakt</p>
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Wir sind für Sie da
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Haben Sie Fragen zu unseren Kursen oder möchten Sie sich anmelden? Kontaktieren Sie uns 
              telefonisch, per E-Mail oder besuchen Sie uns direkt an einem unserer Standorte.
            </p>
          </div>
        </div>
      </section>

      {/* Opening Hours Banner */}
      <section className="bg-primary text-primary-foreground py-4">
        <div className="section-container">
          <div className="flex flex-wrap justify-center items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="font-medium">Öffnungszeiten alle Standorte:</span>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <span>Mo-Fr: 08:00 - 12:00 Uhr, 12:30 - 16:30 Uhr</span>
              <span className="text-primary-foreground/70">|</span>
              <span>Sa-So: geschlossen</span>
            </div>
          </div>
        </div>
      </section>

      {/* Locations Grid */}
      <section className="py-16 bg-background">
        <div className="section-container">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-4">
              Unsere Standorte
            </h2>
            <p className="text-muted-foreground">
              Besuchen Sie uns an einem unserer modernen Schulungsstandorte.
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : locations.length === 0 ? (
            <p className="text-center text-muted-foreground">Keine Standorte verfügbar.</p>
          ) : (
            <div className="grid lg:grid-cols-3 gap-8">
              {locations.map((location) => (
                <div key={location.id} className="bg-card rounded-2xl border border-border overflow-hidden">
                  {/* Map */}
                  {location.map_url && (
                    <div className="aspect-video bg-muted relative overflow-hidden">
                      <iframe
                        src={location.map_url}
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        className="absolute inset-0"
                      />
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-6">
                    <div className="mb-4">
                      <p className="text-primary font-medium text-sm mb-1">Standort</p>
                      <h3 className="font-display font-bold text-2xl text-foreground">{location.name}</h3>
                    </div>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-start gap-3 text-sm">
                        <MapPin className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                        <div>
                          <p className="text-foreground">{location.address}</p>
                          <p className="text-muted-foreground">{location.zip_city}</p>
                        </div>
                      </div>
                      {location.phone && (
                        <div className="flex items-center gap-3 text-sm">
                          <Phone className="h-5 w-5 text-muted-foreground shrink-0" />
                          <a href={`tel:${location.phone.replace(/\s/g, '')}`} className="text-foreground hover:text-primary transition-colors">
                            {location.phone}
                          </a>
                        </div>
                      )}
                      {location.email && (
                        <div className="flex items-center gap-3 text-sm">
                          <Mail className="h-5 w-5 text-muted-foreground shrink-0" />
                          <a href={`mailto:${location.email}`} className="text-foreground hover:text-primary transition-colors">
                            {location.email}
                          </a>
                        </div>
                      )}
                    </div>

                    <Button variant="outline" className="w-full group" asChild>
                      <Link to={`/standort/${location.slug}`}>
                        Standort Details
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Contact Form */}
      <Contact />

      <Footer />
    </div>
  );
}
