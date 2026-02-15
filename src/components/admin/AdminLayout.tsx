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
  ChevronRight,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { AdminCommandSearch } from "./AdminCommandSearch";
import { AdminNotifications } from "./AdminNotifications";
import { AdminBreadcrumbs } from "./AdminBreadcrumbs";
import { AdminThemeToggle } from "./AdminThemeToggle";
import { BugReportButton } from "./BugReportButton";

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
    if (!isLoading && !user) navigate("/auth");
  }, [isLoading, user, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) return null;

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
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-60 bg-card border-r border-border transform transition-transform duration-200 ease-in-out lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo + close */}
          <div className="h-12 px-4 flex items-center justify-between border-b border-border">
            <Link to="/" className="flex items-center">
              <img src={logoMetropol} alt="Metropol" className="h-7" />
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-2 px-2 space-y-0.5 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4 flex-shrink-0" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="p-3 border-t border-border">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center">
                <span className="text-xs font-semibold text-muted-foreground">
                  {user.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">
                  {user.email}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {isStaff ? "Mitarbeiter" : "Benutzer"}
                </p>
              </div>
            </div>
            <BugReportButton />
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-xs text-muted-foreground h-8"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-3.5 w-3.5" />
              Abmelden
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-60 pb-14 lg:pb-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-12 bg-background/95 backdrop-blur-sm border-b border-border">
          <div className="flex items-center justify-between h-full px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1.5 rounded-md hover:bg-muted"
            >
              <Menu className="h-4 w-4" />
            </button>

            <div className="flex-1 flex justify-center lg:justify-start lg:ml-2">
              <AdminCommandSearch />
            </div>

            <div className="flex items-center gap-0.5">
              <AdminThemeToggle />
              <AdminNotifications />
              <Link to="/" className="hidden sm:block ml-1">
                <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground">
                  Website
                  <ChevronRight className="ml-0.5 h-3 w-3" />
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
        <div className="flex items-center justify-around py-1">
          {mobileNavItems.map((item) => {
            const isActive = item.href !== "#menu" && location.pathname === item.href;
            return (
              <button
                key={item.name}
                onClick={() => handleMobileNavClick(item.href)}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-3 py-1.5 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <item.icon className="h-4.5 w-4.5" style={{ width: 18, height: 18 }} />
                <span className="text-[10px] font-medium">{item.name}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
