import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Clock, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocations } from "@/hooks/useLocations";

export function Locations() {
  const { data: locations = [], isLoading } = useLocations();

  return (
    <section id="standorte" className="py-24 bg-background">
      <div className="section-container">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-accent font-semibold text-sm uppercase tracking-wider mb-4">Unsere Standorte</p>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            {locations.length} Standorte in Ihrer Nähe
          </h2>
          <p className="text-lg text-muted-foreground">
            Besuchen Sie uns an einem unserer modernen Schulungsstandorte in Niedersachsen und Bremen.
          </p>
        </div>

        {/* Loading state */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : locations.length === 0 ? (
          <p className="text-center text-muted-foreground">Keine Standorte verfügbar.</p>
        ) : (
          /* Locations grid */
          <div className="grid lg:grid-cols-3 gap-8">
            {locations.map((location) => (
              <div
                key={location.id}
                className="group card-elevated overflow-hidden"
              >
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
                    <p className="text-accent font-medium text-sm mb-1">Standort</p>
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
                        <a href={`tel:${location.phone.replace(/\s/g, '')}`} className="text-foreground hover:text-accent transition-colors">
                          {location.phone}
                        </a>
                      </div>
                    )}
                    {location.email && (
                      <div className="flex items-center gap-3 text-sm">
                        <Mail className="h-5 w-5 text-muted-foreground shrink-0" />
                        <a href={`mailto:${location.email}`} className="text-foreground hover:text-accent transition-colors">
                          {location.email}
                        </a>
                      </div>
                    )}
                    {location.opening_hours && (
                      <div className="flex items-center gap-3 text-sm">
                        <Clock className="h-5 w-5 text-muted-foreground shrink-0" />
                        <span className="text-muted-foreground">{location.opening_hours}</span>
                      </div>
                    )}
                  </div>

                  <Button variant="outline" className="w-full group/btn" asChild>
                    <Link to={`/standort/${location.slug}`}>
                      Standort Details
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
