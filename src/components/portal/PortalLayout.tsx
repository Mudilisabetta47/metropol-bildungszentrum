import { ReactNode, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useParticipantProfile } from "@/hooks/usePortal";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  FileText,
  Award,
  User,
  LogOut,
  Home,
  Menu,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import logoMetropol from "@/assets/logo-metropol.webp";

interface PortalLayoutProps {
  children: ReactNode;
}

const navItems = [
  { href: "/portal", label: "Übersicht", icon: Home },
  { href: "/portal/kurse", label: "Meine Kurse", icon: BookOpen },
  { href: "/portal/zertifikate", label: "Zertifikate", icon: Award },
  { href: "/portal/rechnungen", label: "Rechnungen", icon: FileText },
  { href: "/portal/profil", label: "Profil", icon: User },
];

export function PortalLayout({ children }: PortalLayoutProps) {
  const { user, isLoading, signOut, isStaff } = useAuth();
  const { data: profile } = useParticipantProfile();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/portal/login");
    }
    // If user is staff, redirect to admin
    if (!isLoading && user && isStaff && !profile) {
      navigate("/admin");
    }
  }, [user, isLoading, navigate, isStaff, profile]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/portal/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const NavLinks = ({ onNavigate }: { onNavigate?: () => void }) => (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => {
        const isActive = location.pathname === item.href;
        return (
          <Link
            key={item.href}
            to={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <Link to="/portal" className="flex items-center gap-2">
            <img src={logoMetropol} alt="Metropol" className="h-8" />
          </Link>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64">
              <div className="flex flex-col h-full">
                <div className="py-4">
                  <img src={logoMetropol} alt="Metropol" className="h-10" />
                </div>
                <div className="flex-1">
                  <NavLinks />
                </div>
                <div className="py-4 border-t">
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3"
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-4 w-4" />
                    Abmelden
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-background border-r">
          <div className="flex flex-col h-full">
            <div className="p-6 border-b">
              <Link to="/portal">
                <img src={logoMetropol} alt="Metropol" className="h-10" />
              </Link>
            </div>
            <div className="flex-1 p-4">
              <NavLinks />
            </div>
            <div className="p-4 border-t">
              <div className="mb-3 px-3">
                <p className="text-sm font-medium">
                  {profile?.first_name} {profile?.last_name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4" />
                Abmelden
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:pl-64">
          <div className="container py-6 lg:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
