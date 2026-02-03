import { useRef, useEffect, useState } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";

export function VideoPromo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    // Auto-play when in viewport
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

  return (
    <section className="relative bg-black">
      {/* Video Container - Mobile optimized aspect ratio */}
      <div className="relative w-full aspect-[9/16] sm:aspect-video max-h-[80vh] overflow-hidden">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          poster="/videos/metropol-promo-poster.jpg"
        >
          <source src="/videos/metropol-promo.mp4" type="video/mp4" />
        </video>

        {/* Gradient overlay for better text visibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />

        {/* Content overlay */}
        <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-12">
          <div className="max-w-2xl">
            <p className="text-accent font-semibold text-sm uppercase tracking-wider mb-2">
              Erleben Sie METROPOL
            </p>
            <h2 className="font-display text-2xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              Ihr Weg zum Berufskraftfahrer
            </h2>
            <p className="text-white/80 text-sm sm:text-base mb-6 max-w-lg">
              Moderne Ausbildung mit erfahrenen Fahrlehrern, neuester Fahrzeugtechnik 
              und 100% Fördermöglichkeit durch die Agentur für Arbeit.
            </p>
          </div>
        </div>

        {/* Video controls */}
        <div className="absolute bottom-4 right-4 sm:bottom-8 sm:right-8 flex gap-2">
          <button
            onClick={togglePlay}
            className="p-3 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
            aria-label={isPlaying ? "Video pausieren" : "Video abspielen"}
          >
            {isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5" />
            )}
          </button>
          <button
            onClick={toggleMute}
            className="p-3 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
            aria-label={isMuted ? "Ton aktivieren" : "Ton deaktivieren"}
          >
            {isMuted ? (
              <VolumeX className="h-5 w-5" />
            ) : (
              <Volume2 className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Swipe indicator for mobile */}
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 sm:hidden">
          <div className="flex flex-col items-center text-white/60 animate-bounce">
            <span className="text-xs">Nach unten wischen</span>
            <svg className="w-6 h-6 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
