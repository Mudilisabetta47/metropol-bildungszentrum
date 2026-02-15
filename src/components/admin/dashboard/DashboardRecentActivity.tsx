import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
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

const statusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case "confirmed":
    case "paid":
    case "completed":
      return "default";
    case "overdue":
    case "cancelled":
      return "destructive";
    case "pending":
    case "draft":
    case "partial":
      return "secondary";
    default:
      return "outline";
  }
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
      <div className="grid gap-4 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2"><Skeleton className="h-4 w-32" /></CardHeader>
            <CardContent className="space-y-3">
              {[0, 1, 2].map((j) => <Skeleton key={j} className="h-14 w-full" />)}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {/* Registrations */}
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Neueste Anmeldungen
          </CardTitle>
          <Link to="/admin/registrations">
            <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground">
              Alle <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {registrations.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              Keine Anmeldungen
            </p>
          ) : (
            <div className="divide-y divide-border">
              {registrations.map((reg) => (
                <div key={reg.id} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">
                      {reg.first_name} {reg.last_name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {reg.course_dates?.courses?.title || "–"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                      {format(new Date(reg.created_at), "dd.MM.", { locale: de })}
                    </span>
                    <Badge variant={statusVariant(reg.status)} className="text-[10px] px-1.5 py-0">
                      {statusLabels[reg.status] || reg.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invoices */}
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Letzte Rechnungen
          </CardTitle>
          <Link to="/admin/invoices">
            <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground">
              Alle <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              Keine Rechnungen
            </p>
          ) : (
            <div className="divide-y divide-border">
              {invoices.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{inv.invoice_number}</p>
                    <p className="text-xs text-muted-foreground truncate">{inv.recipient_name}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    <span className="text-sm font-medium tabular-nums">
                      {formatCurrency(inv.gross_amount)}
                    </span>
                    <Badge variant={statusVariant(inv.status)} className="text-[10px] px-1.5 py-0">
                      {statusLabels[inv.status] || inv.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Courses */}
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Nächste Kurse
          </CardTitle>
          <Link to="/admin/schedule">
            <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground">
              Alle <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {courseDates.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              Keine Termine
            </p>
          ) : (
            <div className="divide-y divide-border">
              {courseDates.map((course) => {
                const capacity = Math.round((course.current_participants / course.max_participants) * 100);
                return (
                  <div key={course.id} className="py-2.5 first:pt-0 last:pb-0 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium truncate flex-1">
                        {course.courses?.title || "–"}
                      </p>
                      <span className="text-xs text-muted-foreground ml-2">
                        {format(new Date(course.start_date), "dd.MM.", { locale: de })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                        <MapPin className="h-2.5 w-2.5" />
                        {course.locations?.name || "–"}
                      </span>
                      <div className="flex-1" />
                      <span className="text-[10px] tabular-nums text-muted-foreground">
                        {course.current_participants}/{course.max_participants}
                      </span>
                    </div>
                    <Progress value={capacity} className="h-1" />
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
