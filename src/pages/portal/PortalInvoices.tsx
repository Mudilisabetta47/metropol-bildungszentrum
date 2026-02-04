import { PortalLayout } from "@/components/portal/PortalLayout";
import { useParticipantInvoices } from "@/hooks/usePortal";
import { useSiteSettings } from "@/hooks/useSiteSettings";
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
import { FileText, Download, Euro, Loader2, Calendar, AlertCircle, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function PortalInvoices() {
  const { data: invoices, isLoading } = useParticipantInvoices();
  const { data: settings } = useSiteSettings();
  const { toast } = useToast();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const formatDate = (date: string) => {
    return format(new Date(date), "dd.MM.yyyy", { locale: de });
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("de-DE", {
      style: "currency",
      currency: "EUR",
    });
  };

  const handleDownloadPDF = async (invoice: NonNullable<typeof invoices>[number]) => {
    if (!settings) return;
    
    setDownloadingId(invoice.id);
    try {
      // Dynamic import of PDF generation
      const { downloadInvoicePDF } = await import("@/lib/invoice-pdf");
      
      // We need to fetch full invoice data for PDF
      const { supabase } = await import("@/integrations/supabase/client");
      const { data: fullInvoice, error } = await supabase
        .from("invoices")
        .select("*, invoice_items (*)")
        .eq("id", invoice.id)
        .single();
      
      if (error || !fullInvoice) {
        throw new Error("Rechnung konnte nicht geladen werden");
      }
      
      await downloadInvoicePDF(fullInvoice as any, settings);
      toast({
        title: "PDF heruntergeladen",
        description: `Rechnung ${invoice.invoice_number} wurde heruntergeladen.`,
      });
    } catch (error) {
      console.error("PDF download error:", error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "PDF konnte nicht erstellt werden.",
      });
    } finally {
      setDownloadingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Bezahlt
          </Badge>
        );
      case "sent":
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Offen
          </Badge>
        );
      case "overdue":
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Überfällig
          </Badge>
        );
      case "partial":
        return (
          <Badge className="bg-orange-100 text-orange-800 flex items-center gap-1">
            <Euro className="h-3 w-3" />
            Teilbezahlt
          </Badge>
        );
      case "cancelled":
        return <Badge variant="outline">Storniert</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Calculate summary stats
  const stats = invoices?.reduce(
    (acc, inv) => {
      if (inv.status === "paid") {
        acc.paidAmount += inv.gross_amount;
        acc.paidCount++;
      } else if (inv.status === "sent" || inv.status === "overdue" || inv.status === "partial") {
        acc.openAmount += inv.gross_amount;
        acc.openCount++;
      }
      return acc;
    },
    { paidAmount: 0, openAmount: 0, paidCount: 0, openCount: 0 }
  );

  return (
    <PortalLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rechnungen</h1>
          <p className="text-muted-foreground mt-1">
            Übersicht Ihrer Rechnungen
          </p>
        </div>

        {/* Stats Cards */}
        {invoices && invoices.length > 0 && stats && (
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Bezahlt</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats.paidAmount)}</p>
                  <p className="text-xs text-muted-foreground">{stats.paidCount} Rechnungen</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                  <AlertCircle className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Offen</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats.openAmount)}</p>
                  <p className="text-xs text-muted-foreground">{stats.openCount} Rechnungen</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

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
                    <TableHead className="text-right">PDF</TableHead>
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
                        {invoice.due_date ? (
                          <span className={
                            new Date(invoice.due_date) < new Date() && 
                            invoice.status !== "paid" && 
                            invoice.status !== "cancelled" 
                              ? "text-red-600 font-medium" 
                              : ""
                          }>
                            {formatDate(invoice.due_date)}
                          </span>
                        ) : "–"}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(invoice.gross_amount)}
                      </TableCell>
                      <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDownloadPDF(invoice)}
                          disabled={downloadingId === invoice.id}
                        >
                          {downloadingId === invoice.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Download className="h-4 w-4 mr-1" />
                              PDF
                            </>
                          )}
                        </Button>
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
                        <span className="font-bold text-lg">
                          {formatCurrency(invoice.gross_amount)}
                        </span>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleDownloadPDF(invoice)}
                        disabled={downloadingId === invoice.id}
                      >
                        {downloadingId === invoice.id ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Download className="mr-2 h-4 w-4" />
                        )}
                        PDF
                      </Button>
                    </div>
                    {invoice.due_date && invoice.status !== "paid" && (
                      <p className={`text-sm mt-2 ${
                        new Date(invoice.due_date) < new Date() && invoice.status !== "cancelled"
                          ? "text-red-600 font-medium"
                          : "text-muted-foreground"
                      }`}>
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
