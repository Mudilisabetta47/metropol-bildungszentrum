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
      iconColor: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      title: "Offene Rechnungen",
      value: formatCurrency(stats.openInvoicesAmount),
      subtitle: `${stats.openInvoicesCount} Rechnungen`,
      icon: Clock,
      iconColor: stats.openInvoicesAmount > 0 ? "text-amber-500" : "text-muted-foreground",
      bgColor: stats.openInvoicesAmount > 0 ? "bg-amber-500/10" : "bg-muted/50",
      alert: stats.overdueInvoicesCount > 0 ? `${stats.overdueInvoicesCount} überfällig` : undefined,
    },
    {
      title: "Anmeldungen",
      value: stats.registrationsThisMonth,
      subtitle: (
        <span className="flex items-center gap-1">
          {growthPercentage >= 0 ? (
            <TrendingUp className="h-3 w-3 text-emerald-500" />
          ) : (
            <TrendingDown className="h-3 w-3 text-red-500" />
          )}
          <span className={growthPercentage >= 0 ? "text-emerald-500" : "text-red-500"}>
            {growthPercentage >= 0 ? "+" : ""}{growthPercentage}%
          </span>
          {" "}vs. Vormonat
        </span>
      ),
      icon: Users,
      iconColor: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Ausstehend",
      value: stats.pendingRegistrations,
      subtitle: "Warten auf Bestätigung",
      icon: AlertTriangle,
      iconColor: stats.pendingRegistrations > 0 ? "text-amber-500" : "text-muted-foreground",
      bgColor: stats.pendingRegistrations > 0 ? "bg-amber-500/10" : "bg-muted/50",
    },
    {
      title: "Teilnehmer",
      value: stats.totalParticipants,
      subtitle: `${stats.activeParticipants} aktiv`,
      icon: GraduationCap,
      iconColor: "text-violet-500",
      bgColor: "bg-violet-500/10",
    },
    {
      title: "Kurstermine",
      value: stats.upcomingCourseDates,
      subtitle: `${stats.totalCourses} aktive Kurse`,
      icon: Calendar,
      iconColor: "text-indigo-500",
      bgColor: "bg-indigo-500/10",
    },
    {
      title: "Auslastung",
      value: `${stats.averageCapacity}%`,
      subtitle: "Durchschn. Kursauslastung",
      icon: Target,
      iconColor: stats.averageCapacity >= 70 ? "text-emerald-500" : "text-amber-500",
      bgColor: stats.averageCapacity >= 70 ? "bg-emerald-500/10" : "bg-amber-500/10",
    },
    {
      title: "Anfragen",
      value: stats.unreadContacts,
      subtitle: "Ungelesen",
      icon: MessageSquare,
      iconColor: stats.unreadContacts > 0 ? "text-rose-500" : "text-muted-foreground",
      bgColor: stats.unreadContacts > 0 ? "bg-rose-500/10" : "bg-muted/50",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-5">
              <div className="h-4 bg-muted rounded w-24 mb-3" />
              <div className="h-8 bg-muted rounded w-20 mb-2" />
              <div className="h-3 bg-muted rounded w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi, index) => (
        <Card 
          key={index} 
          className="relative overflow-hidden border-border/50 hover:border-border hover:shadow-md transition-all duration-200"
        >
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  {kpi.title}
                </p>
                <p className="text-2xl font-bold tracking-tight">{kpi.value}</p>
                <div className="text-xs text-muted-foreground">
                  {kpi.subtitle}
                </div>
              </div>
              <div className={cn("p-2.5 rounded-xl", kpi.bgColor)}>
                <kpi.icon className={cn("h-5 w-5", kpi.iconColor)} />
              </div>
            </div>
            {kpi.alert && (
              <div className="absolute bottom-0 left-0 right-0 bg-red-500/10 border-t border-red-500/20 px-4 py-1.5">
                <span className="text-xs font-medium text-red-600 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {kpi.alert}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
