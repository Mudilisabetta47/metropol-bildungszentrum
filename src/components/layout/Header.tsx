import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown, ArrowRight } from "lucide-react";
import logoMetropol from "@/assets/logo-metropol.webp";
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
  { name: "Startseite", href: "/", num: "01" },
  { name: "Führerschein", href: "#", num: "02", hasDropdown: true },
  { name: "Ausbildungsklassen", href: "/ueber-uns", num: "03" },
  { name: "Kontakt", href: "/kontakt", num: "04" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (href: string) => location.pathname === href;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-background/98 backdrop-blur-xl shadow-lg"
          : "bg-background/95 backdrop-blur-lg"
      }`}
    >
      {/* Top green accent line */}
      <div className="h-1 bg-primary w-full" />

      {/* Main navigation */}
      <nav className="section-container py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <img
              src={logoMetropol}
              alt="Metropol Bildungszentrum GmbH"
              className="h-12 sm:h-14 w-auto transition-transform duration-300 group-hover:scale-105"
            />
          </Link>

          {/* Desktop navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navigation.map((item) =>
              item.hasDropdown ? (
                <DropdownMenu key={item.name}>
                  <DropdownMenuTrigger className="relative flex items-center gap-1 text-sm font-medium text-foreground/70 hover:text-foreground transition-colors duration-300 group outline-none">
                    <span>{item.name}</span>
                    <sup className="text-[10px] text-primary font-bold -top-1 ml-0.5">{item.num}</sup>
                    <ChevronDown className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
                    <span className="absolute -bottom-1 left-0 h-[2px] w-0 bg-primary transition-all duration-300 group-hover:w-full" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-64">
                    {licenseClasses.map((cls) => (
                      <DropdownMenuItem key={cls.href} asChild className="flex-col !items-start">
                        <Link to={cls.href} className="py-2">
                          <span className="font-medium">{cls.name}</span>
                          <span className="text-xs text-muted-foreground">{cls.description}</span>
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link
                  key={item.name}
                  to={item.href}
                  className="relative text-sm font-medium text-foreground/70 hover:text-foreground transition-colors duration-300 group"
                >
                  <span>{item.name}</span>
                  <sup className="text-[10px] text-primary font-bold -top-1 ml-0.5">{item.num}</sup>
                  <span
                    className={`absolute -bottom-1 left-0 h-[2px] bg-primary transition-all duration-300 ${
                      isActive(item.href) ? "w-full" : "w-0 group-hover:w-full"
                    }`}
                  />
                </Link>
              )
            )}
          </div>

          {/* CTA Button */}
          <div className="hidden lg:flex items-center">
            <Link
              to="/kontakt"
              className="group relative inline-flex items-center gap-2 bg-primary text-primary-foreground font-semibold px-6 py-3 rounded-full overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_-6px_hsl(136_100%_40%/0.5)] hover:scale-105 active:scale-95"
            >
              <span className="relative z-10 flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary-foreground/20 transition-transform duration-300 group-hover:rotate-45">
                  <ArrowRight className="h-4 w-4" />
                </span>
                <span>Freie Fahrt!</span>
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-primary to-[hsl(136_80%_35%)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 animate-fade-in">
            <div className="flex flex-col gap-1">
              {navigation
                .filter((i) => !i.hasDropdown)
                .map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="px-4 py-3 rounded-lg text-foreground hover:bg-muted transition-colors flex items-center justify-between"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span>{item.name}</span>
                    <sup className="text-[10px] text-primary font-bold">{item.num}</sup>
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

              <Link
                to="/kontakt"
                className="mt-4 flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold px-6 py-3 rounded-full"
                onClick={() => setMobileMenuOpen(false)}
              >
                <ArrowRight className="h-4 w-4" />
                Freie Fahrt!
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
