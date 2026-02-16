import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  useDashboardStats,
  useRecentRegistrations,
  useRecentInvoices,
  useUpcomingCourseDates,
  useMonthlyTrend,
} from "@/hooks/useDashboardData";
import { DashboardQuickActions } from "@/components/admin/dashboard/DashboardQuickActions";
import { DashboardKPICards } from "@/components/admin/dashboard/DashboardKPICards";
import { DashboardCharts } from "@/components/admin/dashboard/DashboardCharts";
import { DashboardRecentActivity } from "@/components/admin/dashboard/DashboardRecentActivity";

export default function Dashboard() {
  const { user } = useAuth();
  
  const { data: profile } = useQuery({
    queryKey: ["staff-profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("first_name, last_name, position")
        .eq("user_id", user!.id)
        .single();
      return data;
    },
    enabled: !!user?.id,
  });
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useDashboardStats();
  const { data: registrations = [], isLoading: regsLoading } = useRecentRegistrations();
  const { data: invoices = [], isLoading: invoicesLoading } = useRecentInvoices();
  const { data: courseDates = [], isLoading: coursesLoading } = useUpcomingCourseDates();
  const { data: monthlyData = [], isLoading: trendLoading } = useMonthlyTrend();

  const isInitialLoading = statsLoading && !stats;

  const handleRefresh = () => {
    refetchStats();
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-foreground">
            Moin{profile?.first_name ? ` ${profile.first_name}` : ""}{profile?.position ? `, ${profile.position}` : ""} 👋
          </h1>
          {isInitialLoading ? (
            <Skeleton className="h-4 w-48 mt-1" />
          ) : (
            <p className="text-sm text-muted-foreground">
              {format(new Date(), "EEEE, dd. MMMM yyyy", { locale: de })}
            </p>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={statsLoading}
        >
          <RefreshCw className={`mr-2 h-3.5 w-3.5 ${statsLoading ? "animate-spin" : ""}`} />
          Aktualisieren
        </Button>
      </div>

      {/* Quick Actions */}
      <DashboardQuickActions />

      {/* KPI Cards */}
      <DashboardKPICards stats={stats || defaultStats} isLoading={isInitialLoading} />

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
