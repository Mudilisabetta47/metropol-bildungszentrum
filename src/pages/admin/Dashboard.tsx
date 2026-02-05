import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  useDashboardStats,
  useRecentRegistrations,
  useRecentInvoices,
  useUpcomingCourseDates,
  useMonthlyTrend,
} from "@/hooks/useDashboardData";
import { DashboardKPICards } from "@/components/admin/dashboard/DashboardKPICards";
import { DashboardQuickActions } from "@/components/admin/dashboard/DashboardQuickActions";
import { DashboardCharts } from "@/components/admin/dashboard/DashboardCharts";
import { DashboardRecentActivity } from "@/components/admin/dashboard/DashboardRecentActivity";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useDashboardStats();
  const { data: registrations = [], isLoading: regsLoading } = useRecentRegistrations();
  const { data: invoices = [], isLoading: invoicesLoading } = useRecentInvoices();
  const { data: courseDates = [], isLoading: coursesLoading } = useUpcomingCourseDates();
  const { data: monthlyData = [], isLoading: trendLoading } = useMonthlyTrend();

  const isInitialLoading = statsLoading && !stats;

  const handleRefresh = () => {
    refetchStats();
  };

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Guten Morgen";
    if (hour < 18) return "Guten Tag";
    return "Guten Abend";
  };

  const defaultStats = {
    totalRegistrations: 0,
    pendingRegistrations: 0,
    confirmedRegistrations: 0,
    totalCourses: 0,
    upcomingCourseDates: 0,
    unreadContacts: 0,
    registrationsThisMonth: 0,
    registrationsLastMonth: 0,
    totalRevenue: 0,
    openInvoicesAmount: 0,
    openInvoicesCount: 0,
    overdueInvoicesCount: 0,
    paidThisMonth: 0,
    totalParticipants: 0,
    activeParticipants: 0,
    averageCapacity: 0,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            {getGreeting()}! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            {isInitialLoading ? (
              <Skeleton className="h-4 w-64 mt-1" />
            ) : (
              <>
                Hier ist dein Überblick für {format(new Date(), "EEEE, dd. MMMM yyyy", { locale: de })}
              </>
            )}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={statsLoading}
          className="self-start sm:self-auto"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${statsLoading ? "animate-spin" : ""}`} />
          Aktualisieren
        </Button>
      </div>

      {/* KPI Cards */}
      <DashboardKPICards stats={stats || defaultStats} isLoading={isInitialLoading} />

      {/* Quick Actions */}
      <DashboardQuickActions />

      {/* Charts */}
      <DashboardCharts data={monthlyData} isLoading={trendLoading} />

      {/* Recent Activity */}
      <DashboardRecentActivity
        registrations={registrations}
        invoices={invoices}
        courseDates={courseDates}
        isLoading={regsLoading || invoicesLoading || coursesLoading}
      />
    </div>
  );
}
