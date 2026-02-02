import { ArrowRight, Award, Users, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-truck.jpg";

const stats = [
  { icon: Users, value: "5.000+", label: "Absolventen" },
  { icon: Award, value: "25+", label: "Jahre Erfahrung" },
  { icon: Building2, value: "3", label: "Standorte" },
];

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-32 pb-20 overflow-hidden">
      {/* Background gradient - Metropol Green */}
      <div 
        className="absolute inset-0 -z-10"
        style={{
          background: "linear-gradient(135deg, hsl(136 100% 35%) 0%, hsl(136 85% 28%) 50%, hsl(140 80% 22%) 100%)"
        }}
      />
      
      {/* Decorative elements */}
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-1/4 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -z-10" />

      <div className="section-container">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Content */}
          <div className="text-white">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm mb-8 animate-fade-up">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span className="text-sm font-medium">Jetzt neue Kurse für 2026 verfügbar</span>
            </div>
            
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6 animate-fade-up animation-delay-100">
              Ihre Karriere im
              <span className="block text-white/90">Transportwesen</span>
              beginnt hier
            </h1>
            
            <p className="text-lg sm:text-xl text-white/80 leading-relaxed mb-8 max-w-xl animate-fade-up animation-delay-200">
              Professionelle Ausbildung zum Berufskraftfahrer, Busfahrer und Fahrlehrer. 
              An drei Standorten in Niedersachsen und Bremen.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12 animate-fade-up animation-delay-300">
              <Button variant="heroWhite" size="xl" className="group">
                Kursangebot entdecken
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button variant="heroOutline" size="xl">
                Beratungsgespräch
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 animate-fade-up animation-delay-400">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center sm:text-left">
                  <stat.icon className="h-6 w-6 text-white/80 mb-2 mx-auto sm:mx-0" />
                  <p className="font-display text-2xl sm:text-3xl font-bold">{stat.value}</p>
                  <p className="text-sm text-white/60">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Image/Visual */}
          <div className="relative hidden lg:block animate-fade-up animation-delay-200">
            <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src={heroImage} 
                alt="Professioneller LKW auf der Autobahn" 
                className="w-full h-auto object-cover aspect-[4/3]"
              />
            </div>
            
            {/* Floating cards */}
            <div className="absolute -bottom-6 -left-6 bg-white text-foreground rounded-xl p-4 shadow-xl animate-scale-in animation-delay-400">
              <p className="text-sm font-medium text-muted-foreground mb-1">Nächster Kursstart</p>
              <p className="font-display font-bold text-lg">03. März 2026</p>
            </div>
            
            <div className="absolute -top-6 -right-6 bg-white text-foreground rounded-xl p-4 shadow-xl animate-scale-in animation-delay-300">
              <p className="text-sm font-medium text-primary mb-1">Förderung möglich</p>
              <p className="font-display font-bold text-lg">bis 100%</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}