import { ArrowRight, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import busImage from "@/assets/bus-metropol.jpg";
import { useSiteSettings, formatPhoneLink } from "@/hooks/useSiteSettings";
export function CTA() {
  const { data: settings } = useSiteSettings();
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background - Green gradient */}
      <div 
        className="absolute inset-0 -z-10"
        style={{
          background: "linear-gradient(135deg, hsl(136 100% 35%) 0%, hsl(136 85% 28%) 100%)"
        }}
      />
      
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -z-10" />

      <div className="section-container">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-white">
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              Bereit für Ihre neue Karriere?
            </h2>
            <p className="text-lg sm:text-xl text-white/80 mb-10">
              Starten Sie jetzt Ihre Ausbildung zum Berufskraftfahrer und sichern Sie sich 
              einen der gefragtesten Jobs auf dem Arbeitsmarkt.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="heroWhite" size="xl" className="group">
                Jetzt Beratungstermin buchen
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button variant="heroOutline" size="xl" asChild>
                <a href={formatPhoneLink(settings?.central_phone || "")}>
                  <Phone className="mr-2 h-5 w-5" />
                  {settings?.central_phone}
                </a>
              </Button>
            </div>
          </div>

          {/* Image */}
          <div className="hidden lg:block">
            <img 
              src={busImage}
              alt="Metropol Bus - Busführerschein Ausbildung"
              className="rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
}