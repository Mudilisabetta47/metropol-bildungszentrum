import { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight } from "lucide-react";

type LightState = "red" | "yellow" | "green";

const NotFound = () => {
  const location = useLocation();
  const [light, setLight] = useState<LightState>("red");
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  // Auto cycle: red → yellow → red
  useEffect(() => {
    if (light === "green") return;
    const interval = setInterval(() => {
      setLight((prev) => (prev === "red" ? "yellow" : "red"));
    }, 2000);
    return () => clearInterval(interval);
  }, [light]);

  const handleGo = useCallback(() => {
    setTransitioning(true);
    setLight("green");
  }, []);

  const message =
    light === "red"
      ? "Stop! Diese Seite existiert nicht."
      : light === "yellow"
        ? "Moment… wir suchen die richtige Richtung."
        : "Gute Fahrt! Du wirst weitergeleitet…";

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden transition-colors duration-700 ${
        light === "green" ? "bg-[hsl(136,30%,8%)]" : "bg-[hsl(220,20%,8%)]"
      }`}
    >
      {/* Subtle street atmosphere */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-1/3 opacity-10 bg-gradient-to-t from-white to-transparent" />
        <div className="absolute bottom-0 left-[calc(50%-60px)] w-px h-1/4 opacity-5 bg-gradient-to-t from-white to-transparent" />
        <div className="absolute bottom-0 left-[calc(50%+60px)] w-px h-1/4 opacity-5 bg-gradient-to-t from-white to-transparent" />
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full blur-[120px] opacity-20 transition-colors duration-700"
          style={{
            backgroundColor:
              light === "red" ? "#ef4444" : light === "yellow" ? "#eab308" : "#22c55e",
          }}
        />
      </div>

      {/* 404 large background text */}
      <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[16rem] sm:text-[24rem] font-display font-black text-white/[0.03] select-none pointer-events-none leading-none">
        404
      </span>

      {/* Traffic Light */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Pole top */}
        <div className="w-3 h-10 bg-gradient-to-b from-zinc-500 to-zinc-700 rounded-t-full" />

        {/* Housing */}
        <div className="relative bg-gradient-to-b from-zinc-800 to-zinc-900 rounded-2xl p-4 flex flex-col items-center gap-3 shadow-2xl border border-white/5">
          {(["red", "yellow", "green"] as const).map((color) => {
            const isActive = light === color;
            const colorMap = {
              red: { bg: "#ef4444", shadow: "0 0 40px 8px rgba(239,68,68,0.5)" },
              yellow: { bg: "#eab308", shadow: "0 0 40px 8px rgba(234,179,8,0.5)" },
              green: { bg: "#22c55e", shadow: "0 0 40px 8px rgba(34,197,94,0.5)" },
            };

            return (
              <div key={color} className="relative">
                {/* Visor */}
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-[4.5rem] sm:w-[5.5rem] h-4 bg-zinc-900 rounded-t-lg border-x border-t border-white/5" />
                {/* Light */}
                <div
                  className="w-14 h-14 sm:w-[4.5rem] sm:h-[4.5rem] rounded-full border-2 transition-all duration-500"
                  style={{
                    backgroundColor: isActive ? colorMap[color].bg : "hsl(220,10%,15%)",
                    borderColor: isActive ? colorMap[color].bg : "hsl(220,10%,20%)",
                    boxShadow: isActive ? colorMap[color].shadow : "none",
                  }}
                >
                  {/* Inner reflection */}
                  <div
                    className={`w-full h-full rounded-full transition-opacity duration-500 ${
                      isActive ? "opacity-100" : "opacity-0"
                    }`}
                    style={{
                      background: "radial-gradient(circle at 38% 32%, rgba(255,255,255,0.35) 0%, transparent 55%)",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Pole bottom */}
        <div className="w-3 h-20 bg-gradient-to-b from-zinc-700 to-zinc-800" />
        <div className="w-10 h-2 bg-zinc-700 rounded-full" />
      </div>

      {/* Text content */}
      <div className="relative z-10 mt-10 text-center max-w-md">
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-white mb-3">
          404 – Falsche Richtung
        </h1>
        <p className="text-white/50 text-xs mb-2 font-mono">
          {location.pathname}
        </p>
        <p className="text-white/60 text-sm sm:text-base mb-8 transition-all duration-500 min-h-[3rem]">
          {message}
        </p>

        {transitioning ? (
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-[#22c55e] text-white font-semibold px-8 py-3.5 rounded-full shadow-[0_8px_30px_-6px_rgba(34,197,94,0.5)] animate-pulse"
          >
            Weiterleitung…
          </Link>
        ) : (
          <button
            onClick={handleGo}
            className="group inline-flex items-center gap-2 bg-white/10 hover:bg-[#22c55e] text-white font-semibold px-8 py-3.5 rounded-full backdrop-blur-sm border border-white/10 hover:border-[#22c55e] transition-all duration-300 hover:shadow-[0_8px_30px_-6px_rgba(34,197,94,0.5)] hover:scale-105 active:scale-95"
          >
            <span>Zur Startseite</span>
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        )}
      </div>

      {/* Bottom road dashes */}
      <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none">
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col gap-3 items-center">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="w-1 h-5 bg-white/[0.08] rounded-full" />
          ))}
        </div>
      </div>

      {transitioning && <AutoRedirect />}
    </div>
  );
};

function AutoRedirect() {
  useEffect(() => {
    const t = setTimeout(() => {
      window.location.href = "/";
    }, 1500);
    return () => clearTimeout(t);
  }, []);
  return null;
}

export default NotFound;
