import { PortalLayout } from "@/components/portal/PortalLayout";
import { useParticipantCertificates } from "@/hooks/usePortal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Award, Download, Calendar, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

export default function PortalCertificates() {
  const { data: certificates, isLoading } = useParticipantCertificates();

  const formatDate = (date: string) => {
    return format(new Date(date), "dd.MM.yyyy", { locale: de });
  };

  const isExpiringSoon = (validUntil: string | null) => {
    if (!validUntil) return false;
    const expiryDate = new Date(validUntil);
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
    return expiryDate <= threeMonthsFromNow;
  };

  const isExpired = (validUntil: string | null) => {
    if (!validUntil) return false;
    return new Date(validUntil) < new Date();
  };

  return (
    <PortalLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Zertifikate</h1>
          <p className="text-muted-foreground mt-1">
            Ihre ausgestellten Zertifikate und Bescheinigungen
          </p>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        ) : certificates && certificates.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {certificates.map((cert) => (
              <Card key={cert.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="h-14 w-14 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                        <Award className="h-7 w-7 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg truncate">{cert.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {cert.certificate_number}
                        </p>
                        {cert.courses && (
                          <Badge variant="secondary" className="mt-2 capitalize">
                            {cert.courses.category}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Ausgestellt: {formatDate(cert.issued_at)}</span>
                      </div>

                      {cert.valid_until && (
                        <div className="flex items-center gap-2 text-sm">
                          {isExpired(cert.valid_until) ? (
                            <>
                              <AlertCircle className="h-4 w-4 text-destructive" />
                              <span className="text-destructive">
                                Abgelaufen: {formatDate(cert.valid_until)}
                              </span>
                            </>
                          ) : isExpiringSoon(cert.valid_until) ? (
                            <>
                              <AlertCircle className="h-4 w-4 text-orange-500" />
                              <span className="text-orange-600">
                                Läuft ab: {formatDate(cert.valid_until)}
                              </span>
                            </>
                          ) : (
                            <>
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>Gültig bis: {formatDate(cert.valid_until)}</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="px-6 py-4 bg-muted/50 border-t">
                    {cert.pdf_url ? (
                      <Button className="w-full" asChild>
                        <a href={cert.pdf_url} target="_blank" rel="noopener noreferrer">
                          <Download className="mr-2 h-4 w-4" />
                          PDF herunterladen
                        </a>
                      </Button>
                    ) : (
                      <Button className="w-full" disabled variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Wird vorbereitet...
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Noch keine Zertifikate</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Ihre Zertifikate werden hier angezeigt, sobald Sie einen Kurs erfolgreich abgeschlossen haben.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </PortalLayout>
  );
}
