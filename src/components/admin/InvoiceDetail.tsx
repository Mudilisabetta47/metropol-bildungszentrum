import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useInvoiceHistory, useSendInvoiceEmail, type InvoiceWithItems } from "@/hooks/useInvoices";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import {
  Download,
  Mail,
  CheckCircle,
  History,
  FileText,
  Loader2,
  Send,
  Ban,
} from "lucide-react";

interface InvoiceDetailProps {
  invoice: InvoiceWithItems;
  onStatusChange: (status: string) => void;
  onDownloadPDF: () => void;
  onCancel?: () => void;
}

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
  draft: "bg-muted text-muted-foreground",
  sent: "bg-blue-100 text-blue-800",
  paid: "bg-green-100 text-green-800",
  partial: "bg-yellow-100 text-yellow-800",
  overdue: "bg-destructive/20 text-destructive",
  cancelled: "bg-muted text-muted-foreground line-through",
  refunded: "bg-purple-100 text-purple-800",
};

const actionLabels: Record<string, string> = {
  created: "Erstellt",
  updated: "Aktualisiert",
  status_changed: "Status geändert",
  sent: "Versendet",
  paid: "Bezahlt",
  cancelled: "Storniert",
  pdf_generated: "PDF generiert",
};

export function InvoiceDetail({
  invoice,
  onStatusChange,
  onDownloadPDF,
  onCancel,
}: InvoiceDetailProps) {
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [emailTo, setEmailTo] = useState(invoice.recipient_email || "");
  const [emailMessage, setEmailMessage] = useState("");

  const { data: history, isLoading: historyLoading } = useInvoiceHistory(invoice.id);
  const sendEmail = useSendInvoiceEmail();

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(amount);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    return format(new Date(dateStr), "dd.MM.yyyy", { locale: de });
  };

  const formatDateTime = (dateStr: string) => {
    return format(new Date(dateStr), "dd.MM.yyyy HH:mm", { locale: de });
  };

  const handleSendEmail = async () => {
    if (!emailTo) return;
    await sendEmail.mutateAsync({
      invoiceId: invoice.id,
      recipientEmail: emailTo,
      message: emailMessage || undefined,
    });
    setShowEmailDialog(false);
    setEmailMessage("");
  };

  return (
    <>
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="items">Positionen</TabsTrigger>
          <TabsTrigger value="history">
            <History className="mr-1 h-4 w-4" />
            Historie
          </TabsTrigger>
        </TabsList>

        {/* Details Tab */}
        <TabsContent value="details" className="space-y-6 pt-4">
          {/* Status & Actions */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-4">
              <Badge className={`${statusColors[invoice.status]} text-sm px-3 py-1`}>
                {statusLabels[invoice.status]}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Version {invoice.version}
              </span>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" size="sm" onClick={onDownloadPDF}>
                <Download className="mr-1 h-4 w-4" />
                PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEmailDialog(true)}
                disabled={!invoice.recipient_email}
              >
                <Send className="mr-1 h-4 w-4" />
                Per E-Mail
              </Button>
              {invoice.status === "draft" && (
                <Button size="sm" onClick={() => onStatusChange("sent")}>
                  <Mail className="mr-1 h-4 w-4" />
                  Als versendet
                </Button>
              )}
              {(invoice.status === "sent" || invoice.status === "partial" || invoice.status === "overdue") && (
                <Button size="sm" onClick={() => onStatusChange("paid")}>
                  <CheckCircle className="mr-1 h-4 w-4" />
                  Als bezahlt
                </Button>
              )}
              {invoice.status !== "cancelled" && invoice.status !== "paid" && onCancel && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={onCancel}
                >
                  <Ban className="mr-1 h-4 w-4" />
                  Stornieren
                </Button>
              )}
            </div>
          </div>

          <Separator />

          {/* Invoice Info */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <h4 className="font-semibold">Rechnungsempfänger</h4>
              <div className="space-y-1 text-sm">
                <p className="font-medium">{invoice.recipient_name}</p>
                {invoice.recipient_address && <p>{invoice.recipient_address}</p>}
                {invoice.recipient_zip_city && <p>{invoice.recipient_zip_city}</p>}
                {invoice.recipient_email && (
                  <p className="text-muted-foreground">{invoice.recipient_email}</p>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Rechnungsdaten</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <Label className="text-muted-foreground">Rechnungsnummer</Label>
                  <p className="font-medium">{invoice.invoice_number}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Rechnungsdatum</Label>
                  <p>{formatDate(invoice.invoice_date)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Leistungsdatum</Label>
                  <p>{formatDate(invoice.service_date)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Fällig am</Label>
                  <p
                    className={
                      invoice.due_date &&
                      new Date(invoice.due_date) < new Date() &&
                      invoice.status !== "paid"
                        ? "text-destructive font-medium"
                        : ""
                    }
                  >
                    {formatDate(invoice.due_date)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Amounts */}
          <div className="space-y-4">
            <h4 className="font-semibold">Beträge</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-muted rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground">Netto</p>
                <p className="text-xl font-bold">{formatCurrency(invoice.net_amount)}</p>
              </div>
              <div className="bg-muted rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground">MwSt. ({invoice.vat_rate}%)</p>
                <p className="text-xl font-bold">{formatCurrency(invoice.vat_amount)}</p>
              </div>
              <div className="bg-primary/10 rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground">Brutto</p>
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(invoice.gross_amount)}
                </p>
              </div>
            </div>

            {invoice.paid_amount && invoice.paid_amount > 0 && (
              <div className="flex justify-between items-center bg-green-50 dark:bg-green-950/20 rounded-lg p-4">
                <span>Bereits bezahlt:</span>
                <span className="font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(invoice.paid_amount)}
                </span>
              </div>
            )}
          </div>

          {/* Notes */}
          {(invoice.notes || invoice.internal_notes) && (
            <>
              <Separator />
              <div className="grid gap-4 md:grid-cols-2">
                {invoice.notes && (
                  <div>
                    <Label className="text-muted-foreground">Hinweise</Label>
                    <p className="mt-1 text-sm">{invoice.notes}</p>
                  </div>
                )}
                {invoice.internal_notes && (
                  <div>
                    <Label className="text-muted-foreground">Interne Notizen</Label>
                    <p className="mt-1 text-sm">{invoice.internal_notes}</p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Cancellation Info */}
          {invoice.status === "cancelled" && invoice.cancellation_reason && (
            <>
              <Separator />
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                <h4 className="font-semibold text-destructive mb-2">Storniert</h4>
                <p className="text-sm">{invoice.cancellation_reason}</p>
                {invoice.cancelled_at && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Storniert am {formatDateTime(invoice.cancelled_at)}
                  </p>
                )}
              </div>
            </>
          )}
        </TabsContent>

        {/* Items Tab */}
        <TabsContent value="items" className="pt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Pos.</TableHead>
                <TableHead>Beschreibung</TableHead>
                <TableHead className="text-right">Menge</TableHead>
                <TableHead className="text-right">Einzelpreis</TableHead>
                <TableHead className="text-right">MwSt.</TableHead>
                <TableHead className="text-right">Gesamt</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.invoice_items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.position}</TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell className="text-right">
                    {item.quantity} {item.unit}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(item.unit_price)}
                  </TableCell>
                  <TableCell className="text-right">{item.vat_rate}%</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(item.gross_amount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="mt-4 border-t pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Nettobetrag:</span>
              <span>{formatCurrency(invoice.net_amount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>MwSt. ({invoice.vat_rate}%):</span>
              <span>{formatCurrency(invoice.vat_amount)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>Gesamtbetrag:</span>
              <span>{formatCurrency(invoice.gross_amount)}</span>
            </div>
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="pt-4">
          {historyLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : history && history.length > 0 ? (
            <div className="space-y-4">
              {history.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-start gap-4 p-4 border rounded-lg"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <History className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">
                        {actionLabels[entry.action] || entry.action}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {formatDateTime(entry.performed_at)}
                      </span>
                    </div>
                    {entry.change_reason && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {entry.change_reason}
                      </p>
                    )}
                    {entry.action === "status_changed" && entry.old_data && entry.new_data && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {statusLabels[(entry.old_data as { status?: string }).status || ""] || "?"} →{" "}
                        {statusLabels[(entry.new_data as { status?: string }).status || ""] || "?"}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Keine Historieneinträge vorhanden
            </div>
          )}

          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              GoBD-Hinweis
            </h4>
            <p className="text-sm text-muted-foreground">
              Diese Rechnung ist revisionssicher gespeichert. Alle Änderungen werden protokolliert
              und können nicht gelöscht werden. Die Aufbewahrungsfrist beträgt 10 Jahre.
            </p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Email Dialog */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rechnung per E-Mail versenden</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="emailTo">Empfänger E-Mail</Label>
              <Input
                id="emailTo"
                type="email"
                value={emailTo}
                onChange={(e) => setEmailTo(e.target.value)}
                placeholder="E-Mail-Adresse"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emailMessage">Persönliche Nachricht (optional)</Label>
              <Textarea
                id="emailMessage"
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
                placeholder="Zusätzliche Nachricht an den Empfänger..."
                rows={3}
              />
            </div>
            <div className="bg-muted/50 rounded-lg p-3 text-sm">
              <p className="font-medium mb-1">Inhalt der E-Mail:</p>
              <ul className="text-muted-foreground space-y-1">
                <li>• Rechnung {invoice.invoice_number}</li>
                <li>• Betrag: {formatCurrency(invoice.gross_amount)}</li>
                <li>• Rechnungsdetails und Positionen</li>
                <li>• Bankverbindung für Überweisung</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEmailDialog(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleSendEmail} disabled={!emailTo || sendEmail.isPending}>
              {sendEmail.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Senden
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
