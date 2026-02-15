import { useEffect } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import logoMetropol from "@/assets/logo-metropol.webp";
import {
  LayoutDashboard,
  GraduationCap,
  Calendar,
  Users,
  MessageSquare,
  BarChart3,
  MapPin,
  Settings,
  LogOut,
  Loader2,
  Menu,
  Receipt,
  CreditCard,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { AdminCommandSearch } from "./AdminCommandSearch";
import { AdminNotifications } from "./AdminNotifications";
import { AdminBreadcrumbs } from "./AdminBreadcrumbs";
import { AdminThemeToggle } from "./AdminThemeToggle";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Teilnehmer", href: "/admin/participants", icon: Users },
  { name: "Kurse", href: "/admin/courses", icon: GraduationCap },
  { name: "Termine", href: "/admin/schedule", icon: Calendar },
  { name: "Anmeldungen", href: "/admin/registrations", icon: Users },
  { name: "Rechnungen", href: "/admin/invoices", icon: Receipt },
  { name: "Zertifikate", href: "/admin/certificates", icon: Award },
  { name: "Zahlungen", href: "/admin/payments", icon: CreditCard },
  { name: "Kontaktanfragen", href: "/admin/contacts", icon: MessageSquare },
  { name: "Statistiken", href: "/admin/statistics", icon: BarChart3 },
  { name: "Standorte", href: "/admin/locations", icon: MapPin },
  { name: "Team", href: "/admin/team", icon: Users },
  { name: "Einstellungen", href: "/admin/settings", icon: Settings },
];

// Mobile bottom nav - most important items
const mobileNavItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Teilnehmer", href: "/admin/participants", icon: Users },
  { name: "Rechnungen", href: "/admin/invoices", icon: Receipt },
  { name: "Termine", href: "/admin/schedule", icon: Calendar },
  { name: "Mehr", href: "#menu", icon: Menu },
];

export function AdminLayout() {
  const { user, isLoading, isStaff, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth");
    }
  }, [isLoading, user, navigate]);

  useEffect(() => {
    if (!isLoading && user && !isStaff) {
      // User is logged in but not staff
    }
  }, [isLoading, user, isStaff]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Laden...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleMobileNavClick = (href: string) => {
    if (href === "#menu") {
      setSidebarOpen(true);
    } else {
      navigate(href);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 border-b border-border">
            <Link to="/" className="flex items-center gap-2">
              <img src={logoMetropol} alt="Metropol" className="h-10" />
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-semibold text-primary">
                  {user.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {user.email}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isStaff ? "Mitarbeiter" : "Benutzer"}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Abmelden
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64 pb-16 lg:pb-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-muted"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Global Search */}
            <div className="flex-1 flex justify-center lg:justify-start lg:ml-4">
              <AdminCommandSearch />
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-1">
              <AdminThemeToggle />
              <AdminNotifications />
              <Link to="/" className="hidden sm:block">
                <Button variant="outline" size="sm">
                  Zur Website
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">
          <AdminBreadcrumbs />
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-border lg:hidden">
        <div className="flex items-center justify-around py-1.5">
          {mobileNavItems.map((item) => {
            const isActive = item.href !== "#menu" && location.pathname === item.href;
            return (
              <button
                key={item.name}
                onClick={() => handleMobileNavClick(item.href)}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-colors min-w-[56px]",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                <item.icon className={cn("h-5 w-5", isActive && "stroke-[2.5px]")} />
                <span className="text-[10px] font-medium">{item.name}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
