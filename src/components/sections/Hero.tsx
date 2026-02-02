import fleetTeam from "@/assets/fleet-team.webp";

export function Hero() {
  return (
    <section className="pt-28 sm:pt-32">
      {/* Full-width hero image */}
      <div className="relative w-full">
        <img 
          src={fleetTeam} 
          alt="Metropol Bildungszentrum - Unser Team und Fahrzeugflotte" 
          className="w-full h-auto object-cover"
        />
      </div>
    </section>
  );
}