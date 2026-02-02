import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  GraduationCap,
  Calendar,
  MessageSquare,
  TrendingUp,
  Clock,
  CheckCircle,
} from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface DashboardStats {
  totalRegistrations: number;
  pendingRegistrations: number;
  confirmedRegistrations: number;
  totalCourses: number;
  upcomingCourseDates: number;
  unreadContacts: number;
  registrationsThisMonth: number;
  registrationsLastMonth: number;
}

interface RecentRegistration {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  status: string;
  created_at: string;
  course_dates: {
    courses: {
      title: string;
    };
    locations: {
      name: string;
    };
  };
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalRegistrations: 0,
    pendingRegistrations: 0,
    confirmedRegistrations: 0,
    totalCourses: 0,
    upcomingCourseDates: 0,
    unreadContacts: 0,
    registrationsThisMonth: 0,
    registrationsLastMonth: 0,
  });
  const [recentRegistrations, setRecentRegistrations] = useState<RecentRegistration[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const now = new Date();
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

      // Fetch all counts in parallel
      const [
        registrationsRes,
        pendingRes,
        confirmedRes,
        coursesRes,
        courseDatesRes,
        contactsRes,
        thisMonthRes,
        lastMonthRes,
        recentRes,
      ] = await Promise.all([
        supabase.from("registrations").select("*", { count: "exact", head: true }),
        supabase.from("registrations").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("registrations").select("*", { count: "exact", head: true }).eq("status", "confirmed"),
        supabase.from("courses").select("*", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("course_dates").select("*", { count: "exact", head: true }).gte("start_date", now.toISOString().split("T")[0]),
        supabase.from("contact_requests").select("*", { count: "exact", head: true }).eq("is_read", false),
        supabase.from("registrations").select("*", { count: "exact", head: true }).gte("created_at", thisMonthStart.toISOString()),
        supabase.from("registrations").select("*", { count: "exact", head: true }).gte("created_at", lastMonthStart.toISOString()).lte("created_at", lastMonthEnd.toISOString()),
        supabase
          .from("registrations")
          .select(`
            id,
            first_name,
            last_name,
            email,
            status,
            created_at,
            course_dates (
              courses (title),
              locations (name)
            )
          `)
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

      setStats({
        totalRegistrations: registrationsRes.count || 0,
        pendingRegistrations: pendingRes.count || 0,
        confirmedRegistrations: confirmedRes.count || 0,
        totalCourses: coursesRes.count || 0,
        upcomingCourseDates: courseDatesRes.count || 0,
        unreadContacts: contactsRes.count || 0,
        registrationsThisMonth: thisMonthRes.count || 0,
        registrationsLastMonth: lastMonthRes.count || 0,
      });

      if (recentRes.data) {
        setRecentRegistrations(recentRes.data as unknown as RecentRegistration[]);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const growthPercentage = stats.registrationsLastMonth > 0
    ? Math.round(((stats.registrationsThisMonth - stats.registrationsLastMonth) / stats.registrationsLastMonth) * 100)
    : 0;

  const getStatusBadge = (status: string) => {
    const statusStyles: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      waitlist: "bg-blue-100 text-blue-800",
      completed: "bg-gray-100 text-gray-800",
    };
    const statusLabels: Record<string, string> = {
      pending: "Ausstehend",
      confirmed: "Bestätigt",
      cancelled: "Storniert",
      waitlist: "Warteliste",
      completed: "Abgeschlossen",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[status] || statusStyles.pending}`}>
        {statusLabels[status] || status}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-24" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Übersicht aller Aktivitäten</p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Anmeldungen gesamt
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRegistrations}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              {growthPercentage >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : (
                <TrendingUp className="h-3 w-3 text-red-500 rotate-180" />
              )}
              <span className={growthPercentage >= 0 ? "text-green-500" : "text-red-500"}>
                {growthPercentage >= 0 ? "+" : ""}{growthPercentage}%
              </span>
              {" "}vs. Vormonat
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ausstehende Anmeldungen
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingRegistrations}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Warten auf Bestätigung
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Aktive Kurse
            </CardTitle>
            <GraduationCap className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCourses}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.upcomingCourseDates} anstehende Termine
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ungelesene Anfragen
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.unreadContacts}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Kontaktanfragen
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent registrations */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Neueste Anmeldungen
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentRegistrations.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Noch keine Anmeldungen vorhanden
              </p>
            ) : (
              <div className="space-y-4">
                {recentRegistrations.map((reg) => (
                  <div key={reg.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0">
                    <div>
                      <p className="font-medium">
                        {reg.first_name} {reg.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {reg.course_dates?.courses?.title || "Kurs"} • {reg.course_dates?.locations?.name || "Standort"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(reg.created_at), "dd. MMM yyyy, HH:mm", { locale: de })}
                      </p>
                    </div>
                    {getStatusBadge(reg.status)}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Schnellaktionen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link
              to="/admin/courses"
              className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted transition-colors"
            >
              <GraduationCap className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Kurs erstellen</p>
                <p className="text-sm text-muted-foreground">Neuen Kurs anlegen</p>
              </div>
            </Link>
            <Link
              to="/admin/schedule"
              className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted transition-colors"
            >
              <Calendar className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Termin planen</p>
                <p className="text-sm text-muted-foreground">Neuen Kurstermin festlegen</p>
              </div>
            </Link>
            <Link
              to="/admin/registrations"
              className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted transition-colors"
            >
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-medium">Anmeldungen bearbeiten</p>
                <p className="text-sm text-muted-foreground">{stats.pendingRegistrations} ausstehend</p>
              </div>
            </Link>
            <Link
              to="/admin/statistics"
              className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted transition-colors"
            >
              <TrendingUp className="h-5 w-5 text-blue-500" />
              <div>
                <p className="font-medium">Statistiken ansehen</p>
                <p className="text-sm text-muted-foreground">Auswertungen & Reports</p>
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
