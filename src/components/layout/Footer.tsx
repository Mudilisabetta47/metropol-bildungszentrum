import { Link } from "react-router-dom";
import { Phone, Mail, Clock, Facebook, Instagram, Linkedin, Star } from "lucide-react";
import logoMetropol from "@/assets/logo-metropol.webp";
import { useLocations } from "@/hooks/useLocations";
import { useSiteSettings, formatPhoneLink } from "@/hooks/useSiteSettings";
const courses = [
  { name: "Berufskraftfahrer C/CE", href: "/fuehrerschein/c-ce" },
  { name: "Führerschein C1/C1E", href: "/fuehrerschein/c1-c1e" },
  { name: "Busführerschein D/DE", href: "/fuehrerschein/d-de" },
  { name: "Fahrlehrer*innen-Ausbildung", href: "/fuehrerschein/fahrlehrer" },
  { name: "BKF-Weiterbildung Module 1-5", href: "/fuehrerschein/bkf-weiterbildung" },
  { name: "Auslieferungsfahrer", href: "/fuehrerschein/auslieferungsfahrer" },
  { name: "Citylogistiker", href: "/fuehrerschein/citylogistiker" },
];

const seoLinks = [
  { name: "Fahrlehrer Ausbildung Hannover", href: "/standort/hannover", location: "Hannover" },
  { name: "Fahrlehrer werden Bremen", href: "/standort/bremen", location: "Bremen" },
  { name: "Fahrlehrer werden Garbsen", href: "/standort/garbsen", location: "Garbsen" },
  { name: "LKW Führerschein Hannover", href: "/fuehrerschein/c-ce", location: "Hannover" },
  { name: "Busfahrer Ausbildung Bremen", href: "/fuehrerschein/d-de", location: "Bremen" },
  { name: "BKF Weiterbildung Hannover", href: "/fuehrerschein/bkf-weiterbildung", location: "Hannover" },
  { name: "Berufskraftfahrer Ausbildung Niedersachsen", href: "/fuehrerschein/c-ce", location: "Region" },
  { name: "BKF Module Niedersachsen", href: "/fuehrerschein/bkf-weiterbildung", location: "Region" },
  { name: "LKW Führerschein Bremen", href: "/fuehrerschein/c-ce", location: "Bremen" },
  { name: "Bus Führerschein Hannover", href: "/fuehrerschein/d-de", location: "Hannover" },
];

const legal = [
  { name: "Impressum", href: "/impressum" },
  { name: "Datenschutz", href: "/datenschutz" },
  { name: "AGB", href: "/agb" },
];

export function Footer() {
  const { data: locations = [] } = useLocations();
  const { data: settings } = useSiteSettings();
  return (
    <footer className="bg-primary text-primary-foreground">
      {/* Main footer content */}
      <div className="section-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <div className="mb-6">
              <img 
                src={logoMetropol} 
                alt="Metropol Bildungszentrum GmbH" 
                className="h-16 w-auto brightness-0"
              />
            </div>
            <p className="text-sm text-primary-foreground/80 leading-relaxed mb-4">
              Ihr Partner für professionelle Berufskraftfahrer-Ausbildung und Weiterbildung in Niedersachsen und Bremen.
            </p>
            
            {/* Google Review Badge */}
            <a 
              href="https://www.google.com/maps/place/METROPOL+Bildungszentrum+GmbH"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 bg-primary-foreground/10 rounded-lg hover:bg-primary-foreground/20 transition-colors mb-6 w-fit"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 flex-shrink-0">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <div className="flex items-center gap-1">
                <span className="font-semibold text-primary-foreground">4.8</span>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-3 w-3 ${
                        star <= 4
                          ? "fill-yellow-400 text-yellow-400"
                          : "fill-yellow-400/50 text-yellow-400"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-primary-foreground/70">(127)</span>
              </div>
            </a>
            
            <div className="flex gap-4">
              <a href="#" className="p-2 rounded-lg bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Courses */}
          <div>
            <h3 className="font-display font-semibold text-lg mb-6">Unsere Kurse</h3>
            <ul className="space-y-3">
              {courses.map((course) => (
                <li key={course.name}>
                  <Link to={course.href} className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                    {course.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Locations - Now from Database */}
          <div>
            <h3 className="font-display font-semibold text-lg mb-6">Standorte</h3>
            <ul className="space-y-4">
              {locations.map((location) => (
                <li key={location.id} className="text-sm">
                  <Link to={`/standort/${location.slug}`} className="hover:text-primary-foreground/100 transition-colors">
                    <p className="font-medium mb-1">{location.name}</p>
                    <p className="text-primary-foreground/70">{location.address}, {location.zip_city}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display font-semibold text-lg mb-6">Kontakt</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm">
                <Phone className="h-5 w-5 text-primary-foreground/80 mt-0.5" />
                <div>
                  <p className="font-medium">Telefon</p>
                  <a href={formatPhoneLink(settings?.central_phone || "")} className="text-primary-foreground/80 hover:text-primary-foreground">
                    {settings?.central_phone}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <Mail className="h-5 w-5 text-primary-foreground/80 mt-0.5" />
                <div>
                  <p className="font-medium">E-Mail</p>
                  <a href={`mailto:${settings?.central_email}`} className="text-primary-foreground/80 hover:text-primary-foreground">
                    {settings?.central_email}
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <Clock className="h-5 w-5 text-primary-foreground/80 mt-0.5" />
                <div>
                  <p className="font-medium">Öffnungszeiten</p>
                  <p className="text-primary-foreground/80">Mo-Fr: 08:00 - 12:00</p>
                  <p className="text-primary-foreground/80">12:30 - 16:30 Uhr</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* SEO Keywords Section */}
      <div className="border-t border-primary-foreground/10">
        <div className="section-container py-8">
          <h3 className="font-display font-semibold text-sm text-primary-foreground/70 mb-4 uppercase tracking-wider">
            Ausbildungen & Standorte
          </h3>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {seoLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>
          <p className="text-xs text-primary-foreground/40 mt-6 max-w-4xl">
            METROPOL Bildungszentrum – Ihre Fahrschule für Berufskraftfahrer-Ausbildung in Niedersachsen und Bremen. 
            Wir bieten LKW-Führerschein (Klasse C/CE), Bus-Führerschein (Klasse D/DE), Fahrlehrer-Ausbildung und 
            BKF-Weiterbildung an unseren Standorten Hannover, Bremen und Garbsen.
          </p>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-primary-foreground/10">
        <div className="section-container py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-primary-foreground/60">
            © {new Date().getFullYear()} {settings?.company_name}. Alle Rechte vorbehalten.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            {legal.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors"
              >
                {item.name}
              </Link>
            ))}
            <span className="text-primary-foreground/30">|</span>
            <Link
              to="/portal/login"
              className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors"
            >
              Teilnehmer-Login
            </Link>
            <Link
              to="/auth"
              className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors"
            >
              Mitarbeiter-Login
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
