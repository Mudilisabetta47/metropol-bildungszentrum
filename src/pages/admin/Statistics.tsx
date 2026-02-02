import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Download, TrendingUp, Users, GraduationCap } from "lucide-react";
import { format, subMonths, startOfMonth } from "date-fns";
import { de } from "date-fns/locale";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

interface StatData {
  registrationsByMonth: { month: string; count: number }[];
  registrationsByLocation: { name: string; count: number }[];
  registrationsByCourse: { name: string; count: number }[];
  registrationsBySource: { source: string; count: number }[];
  totalRegistrations: number;
  confirmedRegistrations: number;
  conversionRate: number;
}

const COLORS = ["#00CC28", "#00A320", "#007D18", "#005710", "#003108"];

export default function Statistics() {
  const [stats, setStats] = useState<StatData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState("6");

  useEffect(() => {
    fetchStatistics();
  }, [period]);

  const fetchStatistics = async () => {
    setIsLoading(true);
    try {
      const monthsAgo = parseInt(period);
      const startDate = startOfMonth(subMonths(new Date(), monthsAgo - 1));

      // Fetch registrations with related data
      const { data: registrations, error } = await supabase
        .from("registrations")
        .select(`
          id,
          status,
          created_at,
          source,
          utm_source,
          course_dates (
            courses (title),
            locations (name)
          )
        `)
        .gte("created_at", startDate.toISOString());

      if (error) throw error;

      // Process data for charts
      const monthlyData: Record<string, number> = {};
      const locationData: Record<string, number> = {};
      const courseData: Record<string, number> = {};
      const sourceData: Record<string, number> = {};

      let confirmedCount = 0;

      registrations?.forEach((reg: any) => {
        // Monthly data
        const month = format(new Date(reg.created_at), "MMM yyyy", { locale: de });
        monthlyData[month] = (monthlyData[month] || 0) + 1;

        // Location data
        const location = reg.course_dates?.locations?.name || "Unbekannt";
        locationData[location] = (locationData[location] || 0) + 1;

        // Course data
        const course = reg.course_dates?.courses?.title || "Unbekannt";
        courseData[course] = (courseData[course] || 0) + 1;

        // Source data
        const source = reg.utm_source || reg.source || "Direkt";
        sourceData[source] = (sourceData[source] || 0) + 1;

        // Count confirmed
        if (reg.status === "confirmed" || reg.status === "completed") {
          confirmedCount++;
        }
      });

      setStats({
        registrationsByMonth: Object.entries(monthlyData)
          .map(([month, count]) => ({ month, count }))
          .reverse(),
        registrationsByLocation: Object.entries(locationData)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count),
        registrationsByCourse: Object.entries(courseData)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count),
        registrationsBySource: Object.entries(sourceData)
          .map(([source, count]) => ({ source, count }))
          .sort((a, b) => b.count - a.count),
        totalRegistrations: registrations?.length || 0,
        confirmedRegistrations: confirmedCount,
        conversionRate: registrations?.length
          ? Math.round((confirmedCount / registrations.length) * 100)
          : 0,
      });
    } catch (error) {
      console.error("Error fetching statistics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportStatistics = () => {
    if (!stats) return;

    const csvContent = [
      "Statistik-Export",
      `Zeitraum: Letzte ${period} Monate`,
      `Exportiert am: ${format(new Date(), "dd.MM.yyyy HH:mm")}`,
      "",
      "Zusammenfassung",
      `Gesamtanmeldungen;${stats.totalRegistrations}`,
      `Bestätigte Anmeldungen;${stats.confirmedRegistrations}`,
      `Konversionsrate;${stats.conversionRate}%`,
      "",
      "Anmeldungen nach Monat",
      "Monat;Anzahl",
      ...stats.registrationsByMonth.map((d) => `${d.month};${d.count}`),
      "",
      "Anmeldungen nach Standort",
      "Standort;Anzahl",
      ...stats.registrationsByLocation.map((d) => `${d.name};${d.count}`),
      "",
      "Anmeldungen nach Kurs",
      "Kurs;Anzahl",
      ...stats.registrationsByCourse.map((d) => `${d.name};${d.count}`),
      "",
      "Anmeldungen nach Quelle",
      "Quelle;Anzahl",
      ...stats.registrationsBySource.map((d) => `${d.source};${d.count}`),
    ].join("\n");

    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `statistiken_${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Keine Daten verfügbar
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Statistiken</h1>
          <p className="text-muted-foreground">Auswertungen und Reports</p>
        </div>
        <div className="flex gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Zeitraum" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">Letzte 3 Monate</SelectItem>
              <SelectItem value="6">Letzte 6 Monate</SelectItem>
              <SelectItem value="12">Letzte 12 Monate</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={exportStatistics}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Gesamtanmeldungen
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalRegistrations}</div>
            <p className="text-xs text-muted-foreground">
              in den letzten {period} Monaten
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Bestätigte Anmeldungen
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.confirmedRegistrations}</div>
            <p className="text-xs text-muted-foreground">
              erfolgreich konvertiert
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Konversionsrate
            </CardTitle>
            <GraduationCap className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.conversionRate}%</div>
            <p className="text-xs text-muted-foreground">
              Anmeldungen → Bestätigt
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Monthly trend */}
        <Card>
          <CardHeader>
            <CardTitle>Anmeldungen pro Monat</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.registrationsByMonth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#00CC28"
                    strokeWidth={2}
                    dot={{ fill: "#00CC28" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* By location */}
        <Card>
          <CardHeader>
            <CardTitle>Anmeldungen nach Standort</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.registrationsByLocation}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} (${(percent * 100).toFixed(0)}%)`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {stats.registrationsByLocation.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* By course */}
        <Card>
          <CardHeader>
            <CardTitle>Anmeldungen nach Kurs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.registrationsByCourse.slice(0, 5)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tick={{ fontSize: 11 }}
                    width={120}
                  />
                  <Tooltip />
                  <Bar dataKey="count" fill="#00CC28" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* By source */}
        <Card>
          <CardHeader>
            <CardTitle>Anmeldungen nach Quelle</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.registrationsBySource.slice(0, 5)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis
                    dataKey="source"
                    type="category"
                    tick={{ fontSize: 11 }}
                    width={100}
                  />
                  <Tooltip />
                  <Bar dataKey="count" fill="#00A320" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
