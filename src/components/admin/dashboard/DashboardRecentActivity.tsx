import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  Receipt,
  Calendar,
  ArrowRight,
  MapPin,
  Clock,
} from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import type { RecentRegistration, RecentInvoice, UpcomingCourseDate } from "@/hooks/useDashboardData";

interface DashboardRecentActivityProps {
  registrations: RecentRegistration[];
  invoices: RecentInvoice[];
  courseDates: UpcomingCourseDate[];
  isLoading?: boolean;
}

const statusLabels: Record<string, string> = {
  pending: "Ausstehend",
  confirmed: "Bestätigt",
  cancelled: "Storniert",
  completed: "Abgeschlossen",
  waitlist: "Warteliste",
  draft: "Entwurf",
  sent: "Versendet",
  paid: "Bezahlt",
  partial: "Teilbezahlt",
  overdue: "Überfällig",
};

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  confirmed: "bg-emerald-100 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
  completed: "bg-slate-100 text-slate-700 border-slate-200",
  waitlist: "bg-blue-100 text-blue-700 border-blue-200",
  draft: "bg-slate-100 text-slate-600 border-slate-200",
  sent: "bg-blue-100 text-blue-700 border-blue-200",
  paid: "bg-emerald-100 text-emerald-700 border-emerald-200",
  partial: "bg-amber-100 text-amber-700 border-amber-200",
  overdue: "bg-red-100 text-red-700 border-red-200",
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(amount);

export function DashboardRecentActivity({
  registrations,
  invoices,
  courseDates,
  isLoading,
}: DashboardRecentActivityProps) {
  if (isLoading) {
    return (
      <div className="grid gap-6 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-40" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[...Array(4)].map((_, j) => (
                <Skeleton key={j} className="h-16 w-full" />
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Recent Registrations */}
      <Card className="border-border/50">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-500" />
            Neueste Anmeldungen
          </CardTitle>
          <Link to="/admin/registrations">
            <Button variant="ghost" size="sm" className="text-xs">
              Alle <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="space-y-3">
          {registrations.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Keine Anmeldungen
            </p>
          ) : (
            registrations.map((reg) => (
              <div
                key={reg.id}
                className="flex items-start justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <p className="font-medium text-sm truncate">
                    {reg.first_name} {reg.last_name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {reg.course_dates?.courses?.title || "Kurs"}
                  </p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {format(new Date(reg.created_at), "dd. MMM, HH:mm", { locale: de })}
                  </p>
                </div>
                <Badge className={`ml-2 flex-shrink-0 border ${statusColors[reg.status]}`}>
                  {statusLabels[reg.status] || reg.status}
                </Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Recent Invoices */}
      <Card className="border-border/50">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Receipt className="h-4 w-4 text-emerald-500" />
            Letzte Rechnungen
          </CardTitle>
          <Link to="/admin/invoices">
            <Button variant="ghost" size="sm" className="text-xs">
              Alle <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="space-y-3">
          {invoices.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Keine Rechnungen
            </p>
          ) : (
            invoices.map((inv) => (
              <div
                key={inv.id}
                className="flex items-start justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <p className="font-medium text-sm">{inv.invoice_number}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {inv.recipient_name}
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {formatCurrency(inv.gross_amount)}
                  </p>
                </div>
                <Badge className={`ml-2 flex-shrink-0 border ${statusColors[inv.status]}`}>
                  {statusLabels[inv.status] || inv.status}
                </Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Upcoming Courses */}
      <Card className="border-border/50">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Calendar className="h-4 w-4 text-violet-500" />
            Nächste Kurse
          </CardTitle>
          <Link to="/admin/schedule">
            <Button variant="ghost" size="sm" className="text-xs">
              Alle <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="space-y-3">
          {courseDates.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Keine Termine
            </p>
          ) : (
            courseDates.map((course) => {
              const capacity = Math.round((course.current_participants / course.max_participants) * 100);
              return (
                <div
                  key={course.id}
                  className="p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">
                        {course.courses?.title || "Kurs"}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {course.locations?.name || "Standort"}
                      </p>
                    </div>
                    <p className="text-xs font-medium text-muted-foreground">
                      {format(new Date(course.start_date), "dd. MMM", { locale: de })}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Auslastung</span>
                      <span className="font-medium">
                        {course.current_participants}/{course.max_participants}
                      </span>
                    </div>
                    <Progress 
                      value={capacity} 
                      className="h-1.5"
                    />
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
