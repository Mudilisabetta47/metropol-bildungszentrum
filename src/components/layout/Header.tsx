import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Phone, MapPin, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import logoMetropol from "@/assets/logo-metropol.webp";
import { useSiteSettings, formatPhoneLink } from "@/hooks/useSiteSettings";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const licenseClasses = [
  { name: "Führerschein C/CE", href: "/fuehrerschein/c-ce", description: "LKW-Führerschein" },
  { name: "Führerschein C1/C1E", href: "/fuehrerschein/c1-c1e", description: "LKW bis 7,5t" },
  { name: "Führerschein D/DE", href: "/fuehrerschein/d-de", description: "Bus-Führerschein" },
  { name: "Fahrlehrer-Ausbildung", href: "/fuehrerschein/fahrlehrer", description: "Werden Sie Fahrlehrer" },
  { name: "BKF-Weiterbildung", href: "/fuehrerschein/bkf-weiterbildung", description: "Module 1-5" },
  { name: "Auslieferungsfahrer", href: "/fuehrerschein/auslieferungsfahrer", description: "Klasse B" },
  { name: "Citylogistiker", href: "/fuehrerschein/citylogistiker", description: "Klasse B/BE" },
];

const navigation = [
  { name: "Startseite", href: "/" },
  { name: "Standorte", href: "/kontakt" },
  { name: "Über uns", href: "/ueber-uns" },
  { name: "Kontakt", href: "/kontakt" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: settings } = useSiteSettings();
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border">
      {/* Top bar */}
      <div className="bg-primary text-primary-foreground py-2">
        <div className="section-container flex justify-between items-center text-sm">
          <div className="flex items-center gap-6">
            <a href={formatPhoneLink(settings?.central_phone || "")} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Phone className="h-4 w-4" />
              <span className="hidden sm:inline">{settings?.central_phone}</span>
            </a>
            <div className="hidden md:flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>Hannover • Bremen • Garbsen</span>
            </div>
          </div>
          <span className="text-primary-foreground/60 text-xs">Bildungszentrum GmbH</span>
        </div>
      </div>

      {/* Main navigation */}
      <nav className="section-container py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img 
              src={logoMetropol} 
              alt="Metropol Bildungszentrum GmbH" 
              className="h-14 sm:h-16 w-auto"
            />
          </Link>

          {/* Desktop navigation */}
          <div className="hidden lg:flex items-center gap-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
              >
                {item.name}
              </Link>
            ))}
            
            {/* Dropdown for license classes */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
                Führerscheinklassen
                <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                {licenseClasses.map((item) => (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link to={item.href} className="flex flex-col items-start py-2">
                      <span className="font-medium">{item.name}</span>
                      <span className="text-xs text-muted-foreground">{item.description}</span>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* CTA Button */}
          <div className="hidden lg:flex items-center gap-4">
            <Button variant="accent" size="lg" asChild>
              <Link to="/kontakt">Jetzt anmelden</Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 animate-fade-in">
            <div className="flex flex-col gap-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="px-4 py-3 rounded-lg text-foreground hover:bg-muted transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              <div className="px-4 py-2 text-sm font-semibold text-muted-foreground mt-2">
                Führerscheinklassen
              </div>
              {licenseClasses.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className="px-4 py-3 rounded-lg text-foreground hover:bg-muted transition-colors ml-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              <Button variant="accent" className="mt-4" asChild>
                <Link to="/kontakt" onClick={() => setMobileMenuOpen(false)}>Jetzt anmelden</Link>
              </Button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}