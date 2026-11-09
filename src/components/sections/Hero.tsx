import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, ArrowRight, Phone } from "lucide-react";
import fleetTeam from "@/assets/fleet-team.webp";
import fahrlehrerSlide from "@/assets/fahrlehrer-slide.png";
import busMetropol from "@/assets/bus-metropol.jpg";
import fleetVehicles from "@/assets/fleet-vehicles.jpg";

const slides = [
  {
    id: 1,
    image: fleetTeam,
    title: "Neue Jobperspektive",
    highlight: "bei Metropol.",
    subtitle: "Starten Sie Ihre Karriere als Berufskraftfahrer – mit professioneller Ausbildung, erfahrenen Fahrlehrern und 100% Förderung durch Bildungsgutschein.",
    link: "/fuehrerschein/c-ce",
    objectPosition: "center center",
  },
  {
    id: 2,
    image: busMetropol,
    title: "Ausbildung für",
    highlight: "Busfahrer*in.",
    subtitle: "Führerschein Klasse D/DE für den Personenverkehr – starte deine Karriere im ÖPNV.",
    link: "/fuehrerschein/d-de",
    objectPosition: "center center",
  },
  {
    id: 3,
    image: fahrlehrerSlide,
    title: "Werde",
    highlight: "Fahrlehrer*in.",
    subtitle: "Werden Sie Teil unseres Teams und geben Sie Ihr Wissen an die nächste Generation weiter.",
    link: "/fahrlehrer-ausbildung",
    objectPosition: "center 15%",
  },
  {
    id: 4,
    image: fleetVehicles,
    title: "BKF-Weiterbildung",
    highlight: "Module 1–5.",
    subtitle: "Gesetzlich vorgeschriebene Weiterbildung für Berufskraftfahrer – flexibel und praxisnah.",
    link: "/fuehrerschein/bkf-weiterbildung",
    objectPosition: "center center",
  },
];

const badges = [
  { icon: "✓", text: "Zertifizierte Ausbildung" },
  { icon: "✓", text: "Hohe Erstbestehensquote" },
  { icon: "🛣", text: "Prüfungsstrecken-Training" },
  { icon: "✓", text: "Keine versteckten Kosten" },
];

export function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [scrollY, setScrollY] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        if (rect.bottom > 0) setScrollY(window.scrollY);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isAutoPlaying]);

  const pause = () => {
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToSlide = (i: number) => { setCurrentSlide(i); pause(); };
  const goToPrevious = () => { setCurrentSlide((p) => (p - 1 + slides.length) % slides.length); pause(); };
  const goToNext = () => { setCurrentSlide((p) => (p + 1) % slides.length); pause(); };

  const parallaxOffset = scrollY * 0.35;

  return (
    <section ref={sectionRef} className="relative w-full h-screen min-h-[600px] max-h-[1000px] overflow-hidden">
      {/* Stacked slides – no bleed */}
      {slides.map((slide, index) => {
        const isActive = index === currentSlide;
        return (
          <div
            key={slide.id}
            className="absolute inset-0 transition-opacity duration-700 ease-in-out"
            style={{ opacity: isActive ? 1 : 0, zIndex: isActive ? 1 : 0, pointerEvents: isActive ? "auto" : "none" }}
          >
            {/* Image */}
            <img
              src={slide.image}
              alt={`${slide.title} ${slide.highlight}`}
              className="absolute inset-0 w-full h-full object-cover will-change-transform"
              style={{ transform: `translateY(${parallaxOffset * 0.3}px) scale(1.1)`, objectPosition: slide.objectPosition }}
            />
            {/* Overlays */}
            <div className="absolute inset-0 bg-gradient-to-r from-foreground/90 via-foreground/55 to-foreground/10" />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-transparent to-transparent" />

            {/* Content */}
            <div
              className="absolute inset-0 flex items-end pb-20 sm:pb-24 md:items-center md:pb-24"
              style={{ transform: `translateY(${-parallaxOffset * 0.1}px)` }}
            >
              <div className="section-container w-full">
                <div className="max-w-2xl text-background animate-fade-in" key={isActive ? "on" : "off"}>
                  <span className="inline-flex items-center gap-2 mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                    <span className="h-px w-8 bg-primary" />METROPOL Bildungszentrum · Hannover · Garbsen · Bremen
                  </span>
                  {/* Trust badges inside slide */}
                  <div className="flex flex-wrap gap-2 mb-5">
                    {badges.map((b, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-medium text-white/70 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1 border border-white/10"
                      >
                        <span className="text-primary">{b.icon}</span>
                        {b.text}
                      </span>
                    ))}
                  </div>

                  <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] mb-4">
                    {slide.title}
                    <br />
                    <span className="text-primary">{slide.highlight}</span>
                  </h1>
                  <p className="text-sm sm:text-base md:text-lg text-white/80 mb-6 sm:mb-8 max-w-lg leading-relaxed">
                    {slide.subtitle}
                  </p>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                    <Link
                      to={slide.link}
                      className="group inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-6 py-3 rounded-full transition-all duration-300 hover:shadow-[0_8px_30px_-6px_hsl(136_100%_40%/0.5)] hover:scale-105 active:scale-95"
                    >
                      Kostenlos beraten lassen
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                    <a
                      href="tel:+495116425068"
                      className="inline-flex items-center gap-2 text-white/90 hover:text-white font-medium transition-colors"
                    >
                      <Phone className="h-4 w-4" />
                      Direkt anrufen
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Navigation arrows */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-colors z-10"
        aria-label="Vorheriger Slide"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-colors z-10"
        aria-label="Nächster Slide"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Stats strip */}
      <div className="absolute bottom-0 inset-x-0 z-10 hidden md:block">
        <div className="section-container">
          <div className="grid grid-cols-4 rounded-t-2xl bg-background/95 backdrop-blur-md shadow-2xl border border-border/60 divide-x divide-border">
            {[
              ["25+", "Jahre Erfahrung"],
              ["95 %", "Erstbestehensquote"],
              ["100 %", "Förderung mit Bildungsgutschein"],
              ["3", "Standorte in Niedersachsen & Bremen"],
            ].map(([v, l]) => (
              <div key={l} className="px-6 py-5">
                <div className="font-display text-3xl font-bold text-foreground">{v}</div>
                <div className="text-sm text-muted-foreground">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Slide indicators */}
      <div className="absolute bottom-6 md:bottom-32 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? "w-8 bg-primary"
                : "w-2 bg-white/40 hover:bg-white/60"
            }`}
            aria-label={`Gehe zu Slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
