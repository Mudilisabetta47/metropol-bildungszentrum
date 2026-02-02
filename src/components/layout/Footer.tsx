import { Link } from "react-router-dom";
import { Phone, Mail, Clock, Facebook, Instagram, Linkedin } from "lucide-react";

const locations = [
  {
    city: "Hannover",
    address: "Beispielstraße 123, 30159 Hannover",
    phone: "0511 123 456",
  },
  {
    city: "Bremen",
    address: "Musterweg 45, 28195 Bremen",
    phone: "0421 789 012",
  },
  {
    city: "Garbsen",
    address: "Fahrweg 78, 30823 Garbsen",
    phone: "05131 345 678",
  },
];

const courses = [
  "Berufskraftfahrer C/CE",
  "Busführerschein D/DE",
  "Fahrlehrer*innen-Ausbildung",
  "BKF-Weiterbildung Module 1-5",
  "Sprachkurse für BKF",
];

const legal = [
  { name: "Impressum", href: "/impressum" },
  { name: "Datenschutz", href: "/datenschutz" },
  { name: "AGB", href: "/agb" },
];

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      {/* Main footer content */}
      <div className="section-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-lg bg-primary-foreground/10 flex items-center justify-center">
                <span className="font-display font-bold text-xl">M</span>
              </div>
              <div>
                <p className="font-display font-bold text-lg">Fahrschule Metropol</p>
                <p className="text-sm text-primary-foreground/70">Bildungszentrum</p>
              </div>
            </div>
            <p className="text-sm text-primary-foreground/80 leading-relaxed mb-6">
              Ihr Partner für professionelle Berufskraftfahrer-Ausbildung und Weiterbildung in Niedersachsen und Bremen.
            </p>
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
                <li key={course}>
                  <a href="#kurse" className="text-sm text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                    {course}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Locations */}
          <div>
            <h3 className="font-display font-semibold text-lg mb-6">Standorte</h3>
            <ul className="space-y-4">
              {locations.map((location) => (
                <li key={location.city} className="text-sm">
                  <p className="font-medium mb-1">{location.city}</p>
                  <p className="text-primary-foreground/70">{location.address}</p>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display font-semibold text-lg mb-6">Kontakt</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm">
                <Phone className="h-5 w-5 text-accent mt-0.5" />
                <div>
                  <p className="font-medium">Telefon</p>
                  <a href="tel:+49511123456" className="text-primary-foreground/80 hover:text-primary-foreground">
                    0511 123 456
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <Mail className="h-5 w-5 text-accent mt-0.5" />
                <div>
                  <p className="font-medium">E-Mail</p>
                  <a href="mailto:info@metropol-bildung.de" className="text-primary-foreground/80 hover:text-primary-foreground">
                    info@metropol-bildung.de
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3 text-sm">
                <Clock className="h-5 w-5 text-accent mt-0.5" />
                <div>
                  <p className="font-medium">Öffnungszeiten</p>
                  <p className="text-primary-foreground/80">Mo-Fr: 8:00 - 18:00 Uhr</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-primary-foreground/10">
        <div className="section-container py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-primary-foreground/60">
            © {new Date().getFullYear()} Fahrschule Metropol Bildungszentrum. Alle Rechte vorbehalten.
          </p>
          <div className="flex gap-6">
            {legal.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}