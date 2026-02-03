import { useRef, useEffect, useState } from "react";
import { Play, Pause, Volume2, VolumeX, CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function VideoPromo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && videoRef.current) {
            videoRef.current.play();
            setIsPlaying(true);
          } else if (videoRef.current) {
            videoRef.current.pause();
            setIsPlaying(false);
          }
        });
      },
      { threshold: 0.5 }
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const benefits = [
    "Moderne Fahrzeugflotte",
    "Erfahrene Fahrlehrer",
    "100% Förderung möglich",
    "AZAV zertifiziert",
  ];

  return (
    <section className="py-16 lg:py-24 bg-background">
      <div className="section-container">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Text Content - Left side on desktop */}
          <div className="order-2 lg:order-1">
            <p className="text-primary font-semibold text-sm uppercase tracking-wider mb-4">
              Einblick ins Bildungszentrum
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-6">
              Erleben Sie METROPOL
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Moderne Ausbildung mit erfahrenen Fahrlehrern und neuester Fahrzeugtechnik. 
              Überzeugen Sie sich selbst von unseren Schulungsräumen und unserem Fuhrpark.
            </p>

            <ul className="space-y-3 mb-8">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-accent flex-shrink-0" />
                  <span className="text-foreground">{benefit}</span>
                </li>
              ))}
            </ul>

            <Button variant="accent" size="lg" asChild>
              <Link to="/ueber-uns">
                Mehr über uns
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {/* Video - Right side on desktop, full width on mobile */}
          <div className="order-1 lg:order-2">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-black">
              {/* Mobile: Taller aspect ratio, Desktop: Standard video ratio */}
              <div className="relative aspect-[9/16] sm:aspect-[4/5] lg:aspect-video">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                >
                  <source src="/videos/metropol-promo.mp4" type="video/mp4" />
                </video>

                {/* Subtle gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                {/* Video controls */}
                <div className="absolute bottom-4 right-4 flex gap-2">
                  <button
                    onClick={togglePlay}
                    className="p-2.5 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
                    aria-label={isPlaying ? "Video pausieren" : "Video abspielen"}
                  >
                    {isPlaying ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={toggleMute}
                    className="p-2.5 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
                    aria-label={isMuted ? "Ton aktivieren" : "Ton deaktivieren"}
                  >
                    {isMuted ? (
                      <VolumeX className="h-4 w-4" />
                    ) : (
                      <Volume2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
