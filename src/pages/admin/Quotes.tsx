import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
  useQuotes,
  useUpdateQuoteStatus,
  useSoftDeleteQuote,
  useConvertQuoteToInvoice,
  type QuoteWithItems,
} from "@/hooks/useQuotes";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { downloadQuotePDF } from "@/lib/quote-pdf";
import { QuoteForm } from "@/components/admin/QuoteForm";
import {
  Loader2,
  Search,
  Download,
  MoreVertical,
  Plus,
  Send,
  CheckCircle,
  XCircle,
  FileText,
  ArrowRightCircle,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

const statusOptions = [
  { value: "all", label: "Alle Status" },
  { value: "draft", label: "Entwurf" },
  { value: "sent", label: "Versendet" },
  { value: "accepted", label: "Angenommen" },
  { value: "declined", label: "Abgelehnt" },
  { value: "expired", label: "Abgelaufen" },
  { value: "converted", label: "In Rechnung" },
  { value: "cancelled", label: "Storniert" },
];

const statusLabels: Record<string, string> = {
  draft: "Entwurf",
  sent: "Versendet",
  accepted: "Angenommen",
  declined: "Abgelehnt",
  expired: "Abgelaufen",
  converted: "In Rechnung",
  cancelled: "Storniert",
};

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800",
  sent: "bg-blue-100 text-blue-800",
  accepted: "bg-green-100 text-green-800",
  declined: "bg-red-100 text-red-800",
  expired: "bg-yellow-100 text-yellow-800",
  converted: "bg-purple-100 text-purple-800",
  cancelled: "bg-gray-100 text-gray-500 line-through",
};

export default function Quotes() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const { data: quotes, isLoading } = useQuotes(statusFilter);
  const { data: settings } = useSiteSettings();
  const updateStatus = useUpdateQuoteStatus();
  const softDelete = useSoftDeleteQuote();
  const convert = useConvertQuoteToInvoice();
  const { toast } = useToast();

  const currency = (a: number) =>
    new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(a);

  const filtered = (quotes || []).filter((q) => {
    if (!searchQuery) return true;
    const s = searchQuery.toLowerCase();
    return (
      q.quote_number.toLowerCase().includes(s) ||
      q.recipient_name.toLowerCase().includes(s) ||
      (q.recipient_email || "").toLowerCase().includes(s)
    );
  });

  const handleDownload = async (q: QuoteWithItems) => {
    if (!settings) return;
    try {
      await downloadQuotePDF(q, settings);
      toast({ title: "PDF heruntergeladen" });
    } catch (err) {
      console.error(err);
      toast({ variant: "destructive", title: "Fehler beim Erstellen des PDFs" });
    }
  };

  const handleConvert = async (q: QuoteWithItems) => {
    try {
      const inv = await convert.mutateAsync(q);
      toast({
        title: "Rechnung erstellt",
        description: `Rechnung ${inv.invoice_number} wurde aus dem KV erstellt.`,
      });
    } catch (err) {
      console.error(err);
      toast({ variant: "destructive", title: "Umwandlung fehlgeschlagen" });
    }
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Kostenvoranschläge</h1>
          <p className="text-muted-foreground">
            {filtered.length} von {quotes?.length || 0} Kostenvoranschlägen
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Neuer Kostenvoranschlag
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Nummer, Kunde oder E-Mail suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>KV-Nr.</TableHead>
                <TableHead>Kunde</TableHead>
                <TableHead>Datum</TableHead>
                <TableHead>Gültig bis</TableHead>
                <TableHead className="text-right">Betrag</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Keine Kostenvoranschläge gefunden
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((q) => (
                  <TableRow key={q.id}>
                    <TableCell className="font-medium">{q.quote_number}</TableCell>
                    <TableCell>
                      <div className="font-medium">{q.recipient_name}</div>
                      {q.recipient_email && (
                        <div className="text-xs text-muted-foreground">{q.recipient_email}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      {format(new Date(q.quote_date), "dd.MM.yyyy", { locale: de })}
                    </TableCell>
                    <TableCell>
                      {q.valid_until
                        ? format(new Date(q.valid_until), "dd.MM.yyyy", { locale: de })
                        : "-"}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {currency(Number(q.gross_amount) || Number(q.net_amount))}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[q.status]}>
                        {statusLabels[q.status] || q.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleDownload(q)}>
                            <Download className="mr-2 h-4 w-4" />
                            PDF herunterladen
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {q.status === "draft" && (
                            <DropdownMenuItem
                              onClick={() => updateStatus.mutate({ id: q.id, status: "sent" })}
                            >
                              <Send className="mr-2 h-4 w-4" />
                              Als versendet markieren
                            </DropdownMenuItem>
                          )}
                          {(q.status === "sent" || q.status === "draft") && (
                            <>
                              <DropdownMenuItem
                                onClick={() =>
                                  updateStatus.mutate({ id: q.id, status: "accepted" })
                                }
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Als angenommen markieren
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  updateStatus.mutate({ id: q.id, status: "declined" })
                                }
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                Als abgelehnt markieren
                              </DropdownMenuItem>
                            </>
                          )}
                          {q.status !== "converted" && q.status !== "cancelled" && (
                            <DropdownMenuItem onClick={() => handleConvert(q)}>
                              <ArrowRightCircle className="mr-2 h-4 w-4" />
                              In Rechnung umwandeln
                            </DropdownMenuItem>
                          )}
                          {q.status === "converted" && q.converted_to_invoice_id && (
                            <DropdownMenuItem asChild>
                              <a href={`/admin/invoices`}>
                                <FileText className="mr-2 h-4 w-4" />
                                Zur Rechnung
                              </a>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => {
                              if (confirm(`KV ${q.quote_number} löschen?`)) {
                                softDelete.mutate(q.id);
                              }
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Löschen
                          </DropdownMenuItem>
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

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Neuer Kostenvoranschlag</DialogTitle>
          </DialogHeader>
          <QuoteForm onSuccess={() => setShowCreate(false)} onCancel={() => setShowCreate(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
