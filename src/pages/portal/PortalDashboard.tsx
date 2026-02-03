import { Link } from "react-router-dom";
import { PortalLayout } from "@/components/portal/PortalLayout";
import { useParticipantProfile, useParticipantCourses, useParticipantCertificates, useParticipantInvoices } from "@/hooks/usePortal";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Award, FileText, ArrowRight, Calendar, Euro } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

export default function PortalDashboard() {
  const { data: profile, isLoading: profileLoading } = useParticipantProfile();
  const { data: courses, isLoading: coursesLoading } = useParticipantCourses();
  const { data: certificates, isLoading: certificatesLoading } = useParticipantCertificates();
  const { data: invoices, isLoading: invoicesLoading } = useParticipantInvoices();

  const activeCourses = courses?.filter(c => c.status === "confirmed" || c.status === "pending") || [];
  const openInvoices = invoices?.filter(i => i.status === "sent" || i.status === "overdue") || [];

  const formatDate = (date: string) => {
    return format(new Date(date), "dd.MM.yyyy", { locale: de });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-500">Bestätigt</Badge>;
      case "pending":
        return <Badge variant="secondary">Ausstehend</Badge>;
      case "completed":
        return <Badge className="bg-blue-500">Abgeschlossen</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Storniert</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <PortalLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {profileLoading ? (
              <Skeleton className="h-9 w-48" />
            ) : (
              <>Willkommen, {profile?.first_name || "Teilnehmer"}!</>
            )}
          </h1>
          <p className="text-muted-foreground mt-1">
            Hier finden Sie eine Übersicht Ihrer Kurse, Zertifikate und Rechnungen.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Aktive Kurse</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {coursesLoading ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                <div className="text-2xl font-bold">{activeCourses.length}</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Zertifikate</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {certificatesLoading ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                <div className="text-2xl font-bold">{certificates?.length || 0}</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Offene Rechnungen</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {invoicesLoading ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                <div className="text-2xl font-bold">{openInvoices.length}</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Courses */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Anstehende Kurse</CardTitle>
              <CardDescription>Ihre nächsten Kurstermine</CardDescription>
            </div>
            <Button variant="ghost" asChild>
              <Link to="/portal/kurse">
                Alle anzeigen <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {coursesLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : activeCourses.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Keine anstehenden Kurse
              </p>
            ) : (
              <div className="space-y-3">
                {activeCourses.slice(0, 3).map((course) => (
                  <div
                    key={course.id}
                    className="flex items-center justify-between p-4 rounded-lg border"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <BookOpen className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {course.course_dates?.courses?.title || "Kurs"}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {course.course_dates?.start_date && formatDate(course.course_dates.start_date)}
                          {course.course_dates?.locations?.name && (
                            <> • {course.course_dates.locations.name}</>
                          )}
                        </div>
                      </div>
                    </div>
                    {getStatusBadge(course.status)}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Invoices */}
        {openInvoices.length > 0 && (
          <Card className="border-orange-200 bg-orange-50/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-orange-800">Offene Rechnungen</CardTitle>
                <CardDescription>Bitte begleichen Sie diese Rechnungen</CardDescription>
              </div>
              <Button variant="ghost" asChild>
                <Link to="/portal/rechnungen">
                  Alle anzeigen <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {openInvoices.slice(0, 3).map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-background"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                        <Euro className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="font-medium">{invoice.invoice_number}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(invoice.invoice_date)}
                          {invoice.due_date && (
                            <> • Fällig: {formatDate(invoice.due_date)}</>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {invoice.gross_amount.toLocaleString("de-DE", {
                          style: "currency",
                          currency: "EUR",
                        })}
                      </p>
                      <Badge variant={invoice.status === "overdue" ? "destructive" : "secondary"}>
                        {invoice.status === "overdue" ? "Überfällig" : "Offen"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Latest Certificates */}
        {certificates && certificates.length > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Neueste Zertifikate</CardTitle>
                <CardDescription>Ihre ausgestellten Zertifikate</CardDescription>
              </div>
              <Button variant="ghost" asChild>
                <Link to="/portal/zertifikate">
                  Alle anzeigen <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {certificates.slice(0, 3).map((cert) => (
                  <div
                    key={cert.id}
                    className="flex items-center justify-between p-4 rounded-lg border"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                        <Award className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">{cert.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {cert.certificate_number} • {formatDate(cert.issued_at)}
                        </p>
                      </div>
                    </div>
                    {cert.pdf_url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={cert.pdf_url} target="_blank" rel="noopener noreferrer">
                          Download
                        </a>
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PortalLayout>
  );
}
