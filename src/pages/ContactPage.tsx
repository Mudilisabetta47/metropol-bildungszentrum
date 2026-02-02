import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Clock, ArrowRight } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Contact } from "@/components/sections/Contact";
import { Button } from "@/components/ui/button";

const locations = [
  {
    name: "Hannover",
    tagline: "Hauptstandort",
    address: "Vahrenwalder Str. 213",
    zip: "30165 Hannover",
    phone: "0511 123 456",
    email: "info@mep-agentur.de",
    slug: "hannover",
    mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2435.5!2d9.738!3d52.395!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47b00b514d494f85%3A0x425ac6d94ac4720!2sVahrenwalder+Str.+213%2C+30165+Hannover!5e0!3m2!1sde!2sde!4v1704900000000!5m2!1sde!2sde",
  },
  {
    name: "Garbsen",
    tagline: "Region Hannover",
    address: "Planetenring 25 – 27",
    zip: "30823 Garbsen",
    phone: "05131 345 678",
    email: "info@mep-agentur.de",
    slug: "garbsen",
    mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d38891.32614375611!2d9.559087149999999!3d52.43!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47b0715d1c28e55d%3A0x422435029b0e6e0!2sGarbsen!5e0!3m2!1sde!2sde!4v1704900000000!5m2!1sde!2sde",
  },
  {
    name: "Bremen",
    tagline: "Norddeutschland",
    address: "Bahnhofsplatz 41",
    zip: "28195 Bremen",
    phone: "0421 789 012",
    email: "info@mep-agentur.de",
    slug: "bremen",
    mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2395.5!2d8.8!3d53.08!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47b1281e22502089%3A0x4240fe7314f89f0!2sBremen%20Hauptbahnhof!5e0!3m2!1sde!2sde!4v1704900000000!5m2!1sde!2sde",
  },
];

export default function ContactPage() {
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
              Besuchen Sie uns an einem unserer drei modernen Schulungsstandorte.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {locations.map((location) => (
              <div key={location.slug} className="bg-card rounded-2xl border border-border overflow-hidden">
                {/* Map */}
                <div className="aspect-video bg-muted relative overflow-hidden">
                  <iframe
                    src={location.mapUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="absolute inset-0"
                  />
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="mb-4">
                    <p className="text-primary font-medium text-sm mb-1">{location.tagline}</p>
                    <h3 className="font-display font-bold text-2xl text-foreground">{location.name}</h3>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-start gap-3 text-sm">
                      <MapPin className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                      <div>
                        <p className="text-foreground">{location.address}</p>
                        <p className="text-muted-foreground">{location.zip}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="h-5 w-5 text-muted-foreground shrink-0" />
                      <a href={`tel:${location.phone.replace(/\s/g, '')}`} className="text-foreground hover:text-primary transition-colors">
                        {location.phone}
                      </a>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="h-5 w-5 text-muted-foreground shrink-0" />
                      <a href={`mailto:${location.email}`} className="text-foreground hover:text-primary transition-colors">
                        {location.email}
                      </a>
                    </div>
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
        </div>
      </section>

      {/* Contact Form */}
      <Contact />

      <Footer />
    </div>
  );
}
