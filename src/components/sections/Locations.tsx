import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const locations = [
  {
    id: "hannover",
    city: "Hannover",
    tagline: "Unser Hauptstandort",
    address: "Beispielstraße 123",
    zip: "30159 Hannover",
    phone: "0511 123 456",
    email: "hannover@metropol-bildung.de",
    hours: "Mo-Fr: 8:00 - 18:00 Uhr",
    features: ["Alle Ausbildungen", "Fahrsimulator", "Theorieräume"],
    mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d155422.35684374573!2d9.625855874999999!3d52.3758916!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47b00b514d494f85%3A0x425ac6d94ac4720!2sHannover!5e0!3m2!1sde!2sde!4v1704900000000!5m2!1sde!2sde",
  },
  {
    id: "bremen",
    city: "Bremen",
    tagline: "Standort Norddeutschland",
    address: "Musterweg 45",
    zip: "28195 Bremen",
    phone: "0421 789 012",
    email: "bremen@metropol-bildung.de",
    hours: "Mo-Fr: 8:00 - 17:00 Uhr",
    features: ["LKW & Bus Ausbildung", "BKF-Module", "Theorieräume"],
    mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d152519.31548391066!2d8.68125355!3d53.10896015!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47b1281e22502089%3A0x4240fe7314f89f0!2sBremen!5e0!3m2!1sde!2sde!4v1704900000000!5m2!1sde!2sde",
  },
  {
    id: "garbsen",
    city: "Garbsen",
    tagline: "Region Hannover",
    address: "Fahrweg 78",
    zip: "30823 Garbsen",
    phone: "05131 345 678",
    email: "garbsen@metropol-bildung.de",
    hours: "Mo-Fr: 8:00 - 17:00 Uhr",
    features: ["LKW Ausbildung", "BKF-Module", "Übungsgelände"],
    mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d38891.32614375611!2d9.559087149999999!3d52.43!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47b0715d1c28e55d%3A0x422435029b0e6e0!2sGarbsen!5e0!3m2!1sde!2sde!4v1704900000000!5m2!1sde!2sde",
  },
];

export function Locations() {
  return (
    <section id="standorte" className="py-24 bg-background">
      <div className="section-container">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-accent font-semibold text-sm uppercase tracking-wider mb-4">Unsere Standorte</p>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            3 Standorte in Ihrer Nähe
          </h2>
          <p className="text-lg text-muted-foreground">
            Besuchen Sie uns an einem unserer modernen Schulungsstandorte in Niedersachsen und Bremen.
          </p>
        </div>

        {/* Locations grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {locations.map((location) => (
            <div
              key={location.id}
              className="group card-elevated overflow-hidden"
            >
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
                  <p className="text-accent font-medium text-sm mb-1">{location.tagline}</p>
                  <h3 className="font-display font-bold text-2xl text-foreground">{location.city}</h3>
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
                    <a href={`tel:${location.phone}`} className="text-foreground hover:text-accent transition-colors">
                      {location.phone}
                    </a>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-5 w-5 text-muted-foreground shrink-0" />
                    <a href={`mailto:${location.email}`} className="text-foreground hover:text-accent transition-colors">
                      {location.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="h-5 w-5 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground">{location.hours}</span>
                  </div>
                </div>

                {/* Features */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {location.features.map((feature) => (
                    <span
                      key={feature}
                      className="px-3 py-1 bg-secondary text-secondary-foreground text-xs font-medium rounded-full"
                    >
                      {feature}
                    </span>
                  ))}
                </div>

                <Button variant="outline" className="w-full group/btn" asChild>
                  <Link to={`/standort/${location.id}`}>
                    Standort Details
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}