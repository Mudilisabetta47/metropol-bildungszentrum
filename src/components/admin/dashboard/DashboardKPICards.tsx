import { Card, CardContent } from "@/components/ui/card";
import {
  Users,
  Euro,
  TrendingUp,
  TrendingDown,
  Clock,
  AlertTriangle,
  GraduationCap,
  Calendar,
  MessageSquare,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { DashboardStats } from "@/hooks/useDashboardData";

interface DashboardKPICardsProps {
  stats: DashboardStats;
  isLoading?: boolean;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(amount);

export function DashboardKPICards({ stats, isLoading }: DashboardKPICardsProps) {
  const growthPercentage = stats.registrationsLastMonth > 0
    ? Math.round(((stats.registrationsThisMonth - stats.registrationsLastMonth) / stats.registrationsLastMonth) * 100)
    : 0;

  const kpis = [
    {
      title: "Umsatz (bezahlt)",
      value: formatCurrency(stats.totalRevenue),
      subtitle: `${formatCurrency(stats.paidThisMonth)} diesen Monat`,
      icon: Euro,
      alert: false,
    },
    {
      title: "Offene Rechnungen",
      value: formatCurrency(stats.openInvoicesAmount),
      subtitle: `${stats.openInvoicesCount} Rechnungen`,
      icon: Clock,
      alert: stats.overdueInvoicesCount > 0,
      alertText: `${stats.overdueInvoicesCount} überfällig`,
    },
    {
      title: "Anmeldungen",
      value: String(stats.registrationsThisMonth),
      subtitle: (
        <span className="flex items-center gap-1">
          {growthPercentage >= 0 ? (
            <TrendingUp className="h-3 w-3 text-primary" />
          ) : (
            <TrendingDown className="h-3 w-3 text-destructive" />
          )}
          <span className={growthPercentage >= 0 ? "text-primary" : "text-destructive"}>
            {growthPercentage >= 0 ? "+" : ""}{growthPercentage}%
          </span>
          {" "}vs. Vormonat
        </span>
      ),
      icon: Users,
      alert: false,
    },
    {
      title: "Ausstehend",
      value: String(stats.pendingRegistrations),
      subtitle: "Warten auf Bestätigung",
      icon: AlertTriangle,
      alert: stats.pendingRegistrations > 0,
    },
    {
      title: "Teilnehmer",
      value: String(stats.totalParticipants),
      subtitle: `${stats.activeParticipants} aktiv`,
      icon: GraduationCap,
      alert: false,
    },
    {
      title: "Kurstermine",
      value: String(stats.upcomingCourseDates),
      subtitle: `${stats.totalCourses} aktive Kurse`,
      icon: Calendar,
      alert: false,
    },
    {
      title: "Auslastung",
      value: `${stats.averageCapacity}%`,
      subtitle: "Ø Kursauslastung",
      icon: Target,
      alert: false,
    },
    {
      title: "Anfragen",
      value: String(stats.unreadContacts),
      subtitle: "Ungelesen",
      icon: MessageSquare,
      alert: stats.unreadContacts > 0,
    },
  ];

  if (isLoading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-3 bg-muted rounded w-20 mb-2" />
              <div className="h-6 bg-muted rounded w-16 mb-1" />
              <div className="h-3 bg-muted rounded w-28" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi, index) => (
        <Card
          key={index}
          className={cn(
            "border transition-colors",
            kpi.alert ? "border-destructive/30" : "border-border"
          )}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {kpi.title}
              </p>
              <kpi.icon className="h-4 w-4 text-muted-foreground/60" />
            </div>
            <p className="text-xl font-semibold tracking-tight text-foreground">{kpi.value}</p>
            <div className="text-xs text-muted-foreground mt-0.5">
              {kpi.subtitle}
            </div>
            {kpi.alert && kpi.alertText && (
              <p className="text-xs font-medium text-destructive mt-1 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {kpi.alertText}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
