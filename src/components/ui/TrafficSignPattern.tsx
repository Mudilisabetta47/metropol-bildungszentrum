export function TrafficSignPattern({ className = "" }: { className?: string }) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      <svg className="absolute w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="traffic-signs" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
            {/* Yield triangle */}
            <polygon points="50,10 70,45 30,45" fill="none" stroke="currentColor" strokeWidth="2" />
            {/* Speed limit circle */}
            <circle cx="140" cy="30" r="20" fill="none" stroke="currentColor" strokeWidth="2" />
            <text x="140" y="36" textAnchor="middle" fontSize="14" fill="currentColor" fontWeight="bold">30</text>
            {/* Stop sign octagon */}
            <polygon points="50,120 62,108 78,108 90,120 90,136 78,148 62,148 50,136" fill="none" stroke="currentColor" strokeWidth="2" />
            {/* Arrow sign */}
            <line x1="130" y1="130" x2="170" y2="130" stroke="currentColor" strokeWidth="2" />
            <polyline points="160,122 170,130 160,138" fill="none" stroke="currentColor" strokeWidth="2" />
            {/* Parking P */}
            <rect x="130" y="160" width="30" height="30" rx="3" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <text x="145" y="182" textAnchor="middle" fontSize="16" fill="currentColor" fontWeight="bold">P</text>
            {/* Road lines */}
            <line x1="10" y1="180" x2="25" y2="180" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 3" />
            <line x1="35" y1="180" x2="50" y2="180" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 3" />
            {/* Small diamond warning */}
            <polygon points="100,80 110,90 100,100 90,90" fill="none" stroke="currentColor" strokeWidth="1.5" />
            {/* Truck silhouette */}
            <rect x="15" y="70" width="20" height="12" rx="1" fill="none" stroke="currentColor" strokeWidth="1" />
            <rect x="5" y="76" width="10" height="6" rx="1" fill="none" stroke="currentColor" strokeWidth="1" />
            <circle cx="12" cy="84" r="2" fill="none" stroke="currentColor" strokeWidth="1" />
            <circle cx="28" cy="84" r="2" fill="none" stroke="currentColor" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#traffic-signs)" />
      </svg>
    </div>
  );
}
