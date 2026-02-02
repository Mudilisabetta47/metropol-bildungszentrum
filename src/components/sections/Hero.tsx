import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import fleetTeam from "@/assets/fleet-team.webp";
import trucksMetropol from "@/assets/trucks-metropol.jpg";
import busMetropol from "@/assets/bus-metropol.jpg";
import fleetVehicles from "@/assets/fleet-vehicles.jpg";

const slides = [
  {
    id: 1,
    image: fleetTeam,
    title: "Ausbildung für",
    highlight: "Berufskraftfahrer",
    subtitle: "LKW-Führerschein C/CE mit 100% Förderung möglich",
    link: "/fuehrerschein/c-ce",
    buttonText: "Jetzt Termin vereinbaren",
  },
  {
    id: 2,
    image: busMetropol,
    title: "Ausbildung für",
    highlight: "Busfahrer*in",
    subtitle: "Führerschein Klasse D/DE für den Personenverkehr",
    link: "/fuehrerschein/d-de",
    buttonText: "Jetzt Termin vereinbaren",
  },
  {
    id: 3,
    image: trucksMetropol,
    title: "Ausbildung für",
    highlight: "Fahrlehrer*in",
    subtitle: "Werden Sie Teil unseres Teams",
    link: "/fuehrerschein/fahrlehrer",
    buttonText: "Jetzt Termin vereinbaren",
  },
  {
    id: 4,
    image: fleetVehicles,
    title: "BKF-Weiterbildung",
    highlight: "Module 1-5",
    subtitle: "Gesetzlich vorgeschriebene Weiterbildung für Berufskraftfahrer",
    link: "/fuehrerschein/bkf-weiterbildung",
    buttonText: "Jetzt Termin vereinbaren",
  },
];

export function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [isAutoPlaying]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    // Resume autoplay after 10 seconds
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  return (
    <section className="pt-28 sm:pt-32 relative">
      <div className="relative w-full overflow-hidden">
        {/* Slides */}
        <div 
          className="flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slide) => (
            <div
              key={slide.id}
              className="w-full flex-shrink-0 relative"
            >
              {/* Image */}
              <div className="relative aspect-[16/9] md:aspect-[21/9] w-full">
                <img
                  src={slide.image}
                  alt={`${slide.title} ${slide.highlight}`}
                  className="w-full h-full object-cover"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
                
                {/* Content overlay */}
                <div className="absolute inset-0 flex items-center">
                  <div className="section-container">
                    <div className="max-w-2xl text-white">
                      <p className="text-sm sm:text-base font-medium text-white/80 mb-2 uppercase tracking-wider">
                        {slide.title}
                      </p>
                      <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
                        {slide.highlight}
                      </h1>
                      <p className="text-base sm:text-lg text-white/90 mb-6 sm:mb-8 max-w-lg">
                        {slide.subtitle}
                      </p>
                      <Link to={slide.link}>
                        <Button 
                          variant="accent" 
                          size="lg"
                          className="text-base px-8 py-6 shadow-xl hover:shadow-2xl"
                        >
                          {slide.buttonText}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation arrows */}
        <button
          onClick={goToPrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors z-10"
          aria-label="Vorheriger Slide"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={goToNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors z-10"
          aria-label="Nächster Slide"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        {/* Slide indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? "w-8 bg-white" 
                  : "w-2 bg-white/50 hover:bg-white/70"
              }`}
              aria-label={`Gehe zu Slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
