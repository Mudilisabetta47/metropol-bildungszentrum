import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import {
  useInvoices,
  useInvoiceStats,
  useUpdateInvoiceStatus,
  type InvoiceWithItems,
} from "@/hooks/useInvoices";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { downloadInvoicePDF } from "@/lib/invoice-pdf";
import { exportInvoicesCSV, exportInvoicesDATEV, exportInvoicesDetailed } from "@/lib/invoice-export";
import {
  Loader2,
  Search,
  Download,
  Eye,
  Euro,
  FileText,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  MoreVertical,
  Mail,
  Ban,
  Plus,
  FileSpreadsheet,
} from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { InvoiceForm } from "@/components/admin/InvoiceForm";
import { InvoiceDetail } from "@/components/admin/InvoiceDetail";

const statusOptions = [
  { value: "all", label: "Alle Status" },
  { value: "draft", label: "Entwurf" },
  { value: "sent", label: "Versendet" },
  { value: "paid", label: "Bezahlt" },
  { value: "partial", label: "Teilbezahlt" },
  { value: "overdue", label: "Überfällig" },
  { value: "cancelled", label: "Storniert" },
];

const statusLabels: Record<string, string> = {
  draft: "Entwurf",
  sent: "Versendet",
  paid: "Bezahlt",
  partial: "Teilbezahlt",
  overdue: "Überfällig",
  cancelled: "Storniert",
  refunded: "Erstattet",
};

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800",
  sent: "bg-blue-100 text-blue-800",
  paid: "bg-green-100 text-green-800",
  partial: "bg-yellow-100 text-yellow-800",
  overdue: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-500 line-through",
  refunded: "bg-purple-100 text-purple-800",
};

const statusIcons: Record<string, React.ReactNode> = {
  draft: <FileText className="h-4 w-4" />,
  sent: <Mail className="h-4 w-4" />,
  paid: <CheckCircle className="h-4 w-4" />,
  partial: <Clock className="h-4 w-4" />,
  overdue: <AlertCircle className="h-4 w-4" />,
  cancelled: <Ban className="h-4 w-4" />,
  refunded: <Euro className="h-4 w-4" />,
};

export default function Invoices() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceWithItems | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  
  const { data: invoices, isLoading, refetch } = useInvoices(statusFilter);
  const { data: stats } = useInvoiceStats();
  const { data: settings } = useSiteSettings();
  const updateStatus = useUpdateInvoiceStatus();
  const { toast } = useToast();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  const filteredInvoices = (invoices || []).filter((inv) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      inv.invoice_number.toLowerCase().includes(query) ||
      inv.recipient_name.toLowerCase().includes(query) ||
      (inv.recipient_email || "").toLowerCase().includes(query)
    );
  });

  const handleDownloadPDF = (invoice: InvoiceWithItems) => {
    if (!settings) {
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Einstellungen konnten nicht geladen werden.",
      });
      return;
    }
    downloadInvoicePDF(invoice, settings);
    toast({
      title: "PDF erstellt",
      description: `Rechnung ${invoice.invoice_number} wurde heruntergeladen.`,
    });
  };

  const handleStatusChange = async (invoiceId: string, newStatus: string) => {
    try {
      await updateStatus.mutateAsync({ invoiceId, status: newStatus });
      toast({
        title: "Status aktualisiert",
        description: `Rechnungsstatus wurde auf "${statusLabels[newStatus]}" geändert.`,
      });
    } catch {
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Status konnte nicht aktualisiert werden.",
      });
    }
  };

  const handleExportCSV = () => {
    if (filteredInvoices.length === 0) {
      toast({
        variant: "destructive",
        title: "Keine Daten",
        description: "Keine Rechnungen zum Exportieren vorhanden.",
      });
      return;
    }
    exportInvoicesCSV(filteredInvoices);
    toast({ title: "CSV-Export erstellt" });
  };

  const handleExportDATEV = () => {
    if (filteredInvoices.length === 0) {
      toast({
        variant: "destructive",
        title: "Keine Daten",
        description: "Keine Rechnungen zum Exportieren vorhanden.",
      });
      return;
    }
    exportInvoicesDATEV(filteredInvoices);
    toast({ title: "DATEV-Export erstellt" });
  };

  const handleExportDetailed = () => {
    if (filteredInvoices.length === 0) {
      toast({
        variant: "destructive",
        title: "Keine Daten",
        description: "Keine Rechnungen zum Exportieren vorhanden.",
      });
      return;
    }
    exportInvoicesDetailed(filteredInvoices);
    toast({ title: "Detaillierter Export erstellt" });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Rechnungen</h1>
          <p className="text-muted-foreground">
            {filteredInvoices.length} von {invoices?.length || 0} Rechnungen • GoBD-konform
          </p>
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportCSV}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                CSV Export
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportDATEV}>
                <FileText className="mr-2 h-4 w-4" />
                DATEV Export
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleExportDetailed}>
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Detailliert (mit Positionen)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Neue Rechnung
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Gesamtumsatz
            </CardTitle>
            <Euro className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats?.totalRevenue || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.paidCount || 0} bezahlte Rechnungen
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Offene Beträge
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats?.openAmount || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.openCount || 0} offene Rechnungen
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Diesen Monat
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats?.thisMonthRevenue || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Überfällig
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(stats?.overdueAmount || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.overdueCount || 0} überfällige Rechnungen
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechnungsnr., Kunde oder E-Mail suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Status filtern" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Invoices Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rechnung</TableHead>
                <TableHead>Kunde</TableHead>
                <TableHead>Datum</TableHead>
                <TableHead className="text-right">Betrag</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Fällig</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Keine Rechnungen gefunden
                  </TableCell>
                </TableRow>
              ) : (
                filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>
                      <div className="font-medium">{invoice.invoice_number}</div>
                      <div className="text-xs text-muted-foreground">
                        v{invoice.version}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{invoice.recipient_name}</div>
                      {invoice.recipient_email && (
                        <div className="text-xs text-muted-foreground">
                          {invoice.recipient_email}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {format(new Date(invoice.invoice_date), "dd.MM.yyyy", { locale: de })}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(invoice.gross_amount)}
                    </TableCell>
                    <TableCell>
                      <Badge className={`${statusColors[invoice.status]} flex items-center gap-1 w-fit`}>
                        {statusIcons[invoice.status]}
                        {statusLabels[invoice.status] || invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {invoice.due_date ? (
                        <span
                          className={
                            new Date(invoice.due_date) < new Date() &&
                            invoice.status !== "paid" &&
                            invoice.status !== "cancelled"
                              ? "text-red-600 font-medium"
                              : ""
                          }
                        >
                          {format(new Date(invoice.due_date), "dd.MM.yyyy", { locale: de })}
                        </span>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedInvoice(invoice);
                              setShowDetailDialog(true);
                            }}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Details anzeigen
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDownloadPDF(invoice)}>
                            <Download className="mr-2 h-4 w-4" />
                            PDF herunterladen
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {invoice.status === "draft" && (
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(invoice.id, "sent")}
                            >
                              <Mail className="mr-2 h-4 w-4" />
                              Als versendet markieren
                            </DropdownMenuItem>
                          )}
                          {(invoice.status === "sent" || invoice.status === "partial" || invoice.status === "overdue") && (
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(invoice.id, "paid")}
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Als bezahlt markieren
                            </DropdownMenuItem>
                          )}
                          {invoice.status !== "cancelled" && invoice.status !== "paid" && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleStatusChange(invoice.id, "cancelled")}
                              >
                                <Ban className="mr-2 h-4 w-4" />
                                Stornieren
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Invoice Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Neue Rechnung erstellen</DialogTitle>
          </DialogHeader>
          <InvoiceForm
            onSuccess={() => {
              setShowCreateDialog(false);
              refetch();
            }}
            onCancel={() => setShowCreateDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Invoice Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Rechnung {selectedInvoice?.invoice_number}
            </DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <InvoiceDetail
              invoice={selectedInvoice}
              onStatusChange={(status) => handleStatusChange(selectedInvoice.id, status)}
              onDownloadPDF={() => handleDownloadPDF(selectedInvoice)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
