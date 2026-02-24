import { useState, useEffect, useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Navigation } from "lucide-react";
import { findBestRedirect, findTopRedirects } from "@/lib/smart-redirect";

type LightState = "off" | "red" | "yellow" | "green";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [light, setLight] = useState<LightState>("off");
  const [phase, setPhase] = useState<"intro" | "idle" | "leaving">("intro");
  const [hovered, setHovered] = useState(false);

  // Smart redirect analysis
  const bestMatch = useMemo(() => findBestRedirect(location.pathname), [location.pathname]);
  const suggestions = useMemo(() => findTopRedirects(location.pathname, 3), [location.pathname]);
  const autoRedirect = bestMatch?.confidence === "high";

  useEffect(() => {
    console.error("404:", location.pathname, bestMatch ? `→ suggest: ${bestMatch.path} (${bestMatch.confidence})` : "no match");
  }, [location.pathname, bestMatch]);

  // Intro sequence: off → red, then yellow blink
  useEffect(() => {
    const t1 = setTimeout(() => setLight("red"), 400);
    const t2 = setTimeout(() => setLight("yellow"), 2400);
    const t3 = setTimeout(() => setLight("red"), 2900);
    const t4 = setTimeout(() => {
      setLight(autoRedirect ? "green" : "red");
      setPhase(autoRedirect ? "leaving" : "idle");
    }, 3200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [autoRedirect]);

  // Auto-redirect for high confidence matches
  useEffect(() => {
    if (autoRedirect && bestMatch && phase === "leaving") {
      const t = setTimeout(() => navigate(bestMatch.path, { replace: true }), 1200);
      return () => clearTimeout(t);
    }
  }, [autoRedirect, bestMatch, phase, navigate]);

  const handleGo = useCallback((target?: string) => {
    setLight("green");
    setPhase("leaving");
    setTimeout(() => navigate(target || "/", { replace: true }), 1200);
  }, [navigate]);

  const subtitle = autoRedirect && bestMatch
    ? `Wir haben „${bestMatch.label}" erkannt – Weiterleitung läuft…`
    : light === "yellow"
      ? "Moment… wir denken nach."
      : light === "green"
        ? "Grüne Welle – du wirst weitergeleitet."
        : bestMatch
          ? `Meintest du vielleicht „${bestMatch.label}"?`
          : "Aber keine Sorge. Wir bringen dich zurück auf die richtige Spur.";

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center relative overflow-hidden transition-all duration-1000 ${
        phase === "leaving" ? "opacity-0 scale-105" : "opacity-100 scale-100"
      }`}
      style={{ background: "radial-gradient(ellipse at 50% 40%, hsl(220,20%,12%) 0%, hsl(220,25%,5%) 100%)" }}
    >
      {/* Fog / ambient */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-[30%] left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full blur-[150px] transition-all duration-700"
          style={{
            opacity: light === "off" ? 0 : hovered ? 0.35 : 0.2,
            backgroundColor: light === "red" ? "#ef4444" : light === "yellow" ? "#facc15" : light === "green" ? "#22c55e" : "transparent",
          }}
        />
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/40 to-transparent" />
        <div
          className="absolute bottom-[10%] left-0 right-0 h-32 opacity-[0.04]"
          style={{ background: "repeating-linear-gradient(90deg, transparent 0px, transparent 80px, white 80px, white 81px)" }}
        />
      </div>

      {/* Giant 404 watermark */}
      <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[18rem] sm:text-[26rem] lg:text-[32rem] font-display font-black text-white/[0.015] select-none pointer-events-none leading-none tracking-tighter">
        404
      </span>

      {/* Traffic light */}
      <TrafficLight light={light} hovered={hovered} setHovered={setHovered} />

      {/* Content */}
      <div className="relative z-10 mt-12 text-center max-w-lg px-6">
        <h1
          className="font-display font-bold text-white mb-4 transition-all duration-700"
          style={{ fontSize: "clamp(1.75rem, 5vw, 2.75rem)", letterSpacing: "-0.025em" }}
        >
          404 – Stop.{" "}
          <span className="text-white/50">Diese Seite gibt es nicht.</span>
        </h1>

        <p className="text-white/40 text-sm sm:text-base leading-relaxed mb-8 min-h-[2.5rem] transition-all duration-500">
          {subtitle}
        </p>

        {/* Smart suggestions */}
        {phase === "idle" && suggestions.length > 0 && !autoRedirect && (
          <div className="mb-8 flex flex-col gap-2">
            {suggestions.map((s) => (
              <button
                key={s.path}
                onClick={() => handleGo(s.path)}
                className="group flex items-center justify-between gap-3 w-full text-left px-5 py-3 rounded-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(34,197,94,0.3)";
                  e.currentTarget.style.background = "rgba(34,197,94,0.06)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                }}
              >
                <div className="flex items-center gap-3">
                  <Navigation className="h-3.5 w-3.5 text-white/30 group-hover:text-[#22c55e] transition-colors" />
                  <span className="text-white/70 text-sm group-hover:text-white transition-colors">{s.label}</span>
                </div>
                <span className="text-[10px] uppercase tracking-wider text-white/20">
                  {s.confidence === "high" ? "Treffer" : s.confidence === "medium" ? "Ähnlich" : "Vorschlag"}
                </span>
              </button>
            ))}
          </div>
        )}

        {phase !== "leaving" ? (
          <button
            onClick={() => handleGo()}
            className="group relative inline-flex items-center gap-3 text-white font-semibold px-8 py-4 rounded-full transition-all duration-300 hover:scale-[1.04] active:scale-[0.97] cursor-pointer"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)",
              border: "1px solid rgba(255,255,255,0.1)",
              backdropFilter: "blur(12px)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(34,197,94,0.4)";
              e.currentTarget.style.boxShadow = "0 8px 40px rgba(34,197,94,0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
              e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.3)";
            }}
          >
            <span>Zur Startseite</span>
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/10 transition-all duration-300 group-hover:bg-[#22c55e]">
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </span>
          </button>
        ) : (
          <div className="inline-flex items-center gap-2 text-[#22c55e] font-medium animate-pulse">
            <div className="w-2 h-2 rounded-full bg-[#22c55e]" />
            Weiterleitung…
          </div>
        )}
      </div>

      {/* Road center line */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pb-4 pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="w-0.5 rounded-full bg-white/[0.06]"
            style={{ height: `${12 + i * 4}px`, opacity: 0.04 + i * 0.015 }}
          />
        ))}
      </div>
    </div>
  );
};

// Extracted traffic light component
function TrafficLight({ light, hovered, setHovered }: { light: LightState; hovered: boolean; setHovered: (v: boolean) => void }) {
  return (
    <div
      className="relative z-10 flex flex-col items-center cursor-default"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="w-2 h-8 bg-gradient-to-b from-zinc-500 to-zinc-600 rounded-t-full" />
      <div
        className="relative rounded-[1.25rem] p-3.5 sm:p-4 flex flex-col items-center gap-2.5 sm:gap-3 transition-shadow duration-500"
        style={{
          background: "linear-gradient(180deg, hsl(220,10%,18%) 0%, hsl(220,12%,10%) 100%)",
          border: "1px solid rgba(255,255,255,0.06)",
          boxShadow: hovered
            ? `0 0 60px 10px ${light === "red" ? "rgba(239,68,68,0.15)" : light === "yellow" ? "rgba(250,204,21,0.15)" : light === "green" ? "rgba(34,197,94,0.15)" : "transparent"}, 0 25px 50px -12px rgba(0,0,0,0.8)`
            : "0 25px 50px -12px rgba(0,0,0,0.6)",
        }}
      >
        {(["red", "yellow", "green"] as const).map((color) => {
          const isActive = light === color;
          const cfg = {
            red: { bg: "#ef4444", glow: "rgba(239,68,68,0.6)", ring: "rgba(239,68,68,0.3)" },
            yellow: { bg: "#facc15", glow: "rgba(250,204,21,0.6)", ring: "rgba(250,204,21,0.3)" },
            green: { bg: "#22c55e", glow: "rgba(34,197,94,0.6)", ring: "rgba(34,197,94,0.3)" },
          };
          return (
            <div key={color} className="relative flex items-center justify-center">
              <div
                className="absolute -top-1.5 left-1/2 -translate-x-1/2 h-3 rounded-t-md"
                style={{
                  width: "calc(100% + 12px)",
                  background: "linear-gradient(180deg, hsl(220,10%,14%) 0%, hsl(220,10%,10%) 100%)",
                  borderTop: "1px solid rgba(255,255,255,0.04)",
                  borderLeft: "1px solid rgba(255,255,255,0.03)",
                  borderRight: "1px solid rgba(255,255,255,0.03)",
                }}
              />
              <div
                className={`w-14 h-14 sm:w-[4.5rem] sm:h-[4.5rem] rounded-full transition-all duration-500 ${
                  isActive && light === "red" ? "animate-[pulse_2s_ease-in-out_infinite]" : ""
                }`}
                style={{
                  backgroundColor: isActive ? cfg[color].bg : "hsl(220,8%,13%)",
                  border: `2px solid ${isActive ? cfg[color].ring : "hsl(220,8%,18%)"}`,
                  boxShadow: isActive
                    ? `0 0 30px 6px ${cfg[color].glow}, inset 0 -4px 8px rgba(0,0,0,0.3)`
                    : "inset 0 2px 4px rgba(0,0,0,0.4)",
                }}
              >
                <div
                  className={`w-full h-full rounded-full transition-opacity duration-500 ${isActive ? "opacity-100" : "opacity-0"}`}
                  style={{
                    background: "radial-gradient(ellipse at 35% 28%, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.05) 40%, transparent 70%)",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="w-2 h-24 bg-gradient-to-b from-zinc-600 via-zinc-700 to-zinc-800" />
      <div className="w-12 h-1.5 bg-zinc-700 rounded-full shadow-lg" />
    </div>
  );
}

export default NotFound;
