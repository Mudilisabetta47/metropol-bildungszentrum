import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  UserPlus,
  Receipt,
  Calendar,
  Download,
  Search,
  Users,
  GraduationCap,
  FileText,
  BarChart3,
  Settings,
  MessageSquare,
} from "lucide-react";

export function DashboardQuickActions() {
  const primaryActions = [
    {
      label: "Teilnehmer anlegen",
      icon: UserPlus,
      href: "/admin/participants",
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      label: "Rechnung erstellen",
      icon: Receipt,
      href: "/admin/invoices",
      color: "bg-emerald-500 hover:bg-emerald-600",
    },
    {
      label: "Kurstermin planen",
      icon: Calendar,
      href: "/admin/schedule",
      color: "bg-violet-500 hover:bg-violet-600",
    },
    {
      label: "Export erstellen",
      icon: Download,
      href: "/admin/statistics",
      color: "bg-amber-500 hover:bg-amber-600",
    },
  ];

  const navigationItems = [
    { label: "Teilnehmer", icon: Users, href: "/admin/participants", badge: null },
    { label: "Kurse", icon: GraduationCap, href: "/admin/courses", badge: null },
    { label: "Anmeldungen", icon: FileText, href: "/admin/registrations", badge: null },
    { label: "Rechnungen", icon: Receipt, href: "/admin/invoices", badge: null },
    { label: "Statistiken", icon: BarChart3, href: "/admin/statistics", badge: null },
    { label: "Kontakte", icon: MessageSquare, href: "/admin/contacts", badge: null },
    { label: "Einstellungen", icon: Settings, href: "/admin/settings", badge: null },
  ];

  return (
    <div className="space-y-6">
      {/* Primary Actions */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
          Schnellaktionen
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {primaryActions.map((action) => (
            <Link key={action.label} to={action.href}>
              <Button
                className={`w-full h-auto py-4 flex flex-col gap-2 text-white ${action.color} shadow-md hover:shadow-lg transition-all`}
              >
                <action.icon className="h-5 w-5" />
                <span className="text-sm font-medium">{action.label}</span>
              </Button>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Navigation */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            Schnellzugriff
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
            {navigationItems.map((item) => (
              <Link key={item.label} to={item.href}>
                <Button
                  variant="outline"
                  className="w-full h-auto py-3 flex flex-col gap-1.5 hover:bg-muted hover:border-primary/20 transition-all"
                >
                  <item.icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs">{item.label}</span>
                </Button>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
