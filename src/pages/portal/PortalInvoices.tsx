import { PortalLayout } from "@/components/portal/PortalLayout";
import { useParticipantInvoices } from "@/hooks/usePortal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileText, Download, Euro } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

export default function PortalInvoices() {
  const { data: invoices, isLoading } = useParticipantInvoices();

  const formatDate = (date: string) => {
    return format(new Date(date), "dd.MM.yyyy", { locale: de });
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("de-DE", {
      style: "currency",
      currency: "EUR",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-500">Bezahlt</Badge>;
      case "sent":
        return <Badge variant="secondary">Offen</Badge>;
      case "overdue":
        return <Badge variant="destructive">Überfällig</Badge>;
      case "partial":
        return <Badge className="bg-orange-500">Teilbezahlt</Badge>;
      case "cancelled":
        return <Badge variant="outline">Storniert</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <PortalLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rechnungen</h1>
          <p className="text-muted-foreground mt-1">
            Übersicht Ihrer Rechnungen
          </p>
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        ) : invoices && invoices.length > 0 ? (
          <>
            {/* Desktop Table */}
            <Card className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rechnungsnummer</TableHead>
                    <TableHead>Datum</TableHead>
                    <TableHead>Fällig</TableHead>
                    <TableHead className="text-right">Betrag</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aktion</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">
                        {invoice.invoice_number}
                      </TableCell>
                      <TableCell>{formatDate(invoice.invoice_date)}</TableCell>
                      <TableCell>
                        {invoice.due_date ? formatDate(invoice.due_date) : "–"}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(invoice.gross_amount)}
                      </TableCell>
                      <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                      <TableCell className="text-right">
                        {invoice.pdf_url ? (
                          <Button variant="ghost" size="sm" asChild>
                            <a
                              href={invoice.pdf_url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Download className="h-4 w-4" />
                            </a>
                          </Button>
                        ) : (
                          <Button variant="ghost" size="sm" disabled>
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
              {invoices.map((invoice) => (
                <Card key={invoice.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-medium">{invoice.invoice_number}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(invoice.invoice_date)}
                        </p>
                      </div>
                      {getStatusBadge(invoice.status)}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Euro className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold">
                          {formatCurrency(invoice.gross_amount)}
                        </span>
                      </div>
                      {invoice.pdf_url ? (
                        <Button variant="outline" size="sm" asChild>
                          <a
                            href={invoice.pdf_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Download className="mr-2 h-4 w-4" />
                            PDF
                          </a>
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" disabled>
                          <Download className="mr-2 h-4 w-4" />
                          PDF
                        </Button>
                      )}
                    </div>
                    {invoice.due_date && invoice.status !== "paid" && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Fällig: {formatDate(invoice.due_date)}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Keine Rechnungen</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Ihre Rechnungen werden hier angezeigt, sobald welche erstellt wurden.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </PortalLayout>
  );
}
