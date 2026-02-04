import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useParticipantInvoices } from "@/hooks/useParticipantInvoices";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { downloadInvoicePDF } from "@/lib/invoice-pdf";
import {
  Loader2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Tag,
  StickyNote,
  UserCheck,
  Send,
  Copy,
  Link as LinkIcon,
  FileText,
  History,
  Euro,
  Download,
  AlertCircle,
  CheckCircle,
  Clock,
  Plus,
} from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface Participant {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  address: string | null;
  zip_city: string | null;
  date_of_birth: string | null;
  status: string;
  internal_notes: string | null;
  tags: string[];
  user_id: string | null;
  created_at: string;
  updated_at: string;
}

interface ParticipantHistory {
  id: string;
  action: string;
  details: unknown;
  created_at: string;
}

interface PortalInvitation {
  id: string;
  token: string;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
}

interface ParticipantDetailDialogProps {
  participant: Participant | null;
  onClose: () => void;
  onUpdate: () => void;
  onCreateInvoice?: (participantId: string) => void;
}

const statusOptions = [
  { value: "lead", label: "Interessent" },
  { value: "registered", label: "Angemeldet" },
  { value: "confirmed", label: "Bestätigt" },
  { value: "completed", label: "Abgeschlossen" },
  { value: "cancelled", label: "Storniert" },
  { value: "dropped", label: "Abgebrochen" },
];
const invoiceStatusLabels: Record<string, string> = {
  draft: "Entwurf",
  sent: "Versendet",
  paid: "Bezahlt",
  partial: "Teilbezahlt",
  overdue: "Überfällig",
  cancelled: "Storniert",
};

const invoiceStatusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800",
  sent: "bg-blue-100 text-blue-800",
  paid: "bg-green-100 text-green-800",
  partial: "bg-yellow-100 text-yellow-800",
  overdue: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-500",
};

export function ParticipantDetailDialog({
  participant,
  onClose,
  onUpdate,
  onCreateInvoice,
}: ParticipantDetailDialogProps) {
  const { toast } = useToast();
  const { data: settings } = useSiteSettings();
  const { data: invoices, isLoading: isLoadingInvoices } = useParticipantInvoices(participant?.id || null);
  
  const [participantHistory, setParticipantHistory] = useState<ParticipantHistory[]>([]);
  const [participantInvitations, setParticipantInvitations] = useState<PortalInvitation[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [isSendingInvitation, setIsSendingInvitation] = useState(false);
  const [isCreatingInvitation, setIsCreatingInvitation] = useState(false);
  const [editedNotes, setEditedNotes] = useState("");
  const [activeTab, setActiveTab] = useState("info");

  useEffect(() => {
    if (participant) {
      setEditedNotes(participant.internal_notes || "");
      fetchParticipantHistory(participant.id);
      fetchParticipantInvitations(participant.id);
    }
  }, [participant]);

  const fetchParticipantHistory = async (participantId: string) => {
    setIsLoadingHistory(true);
    try {
      const { data, error } = await supabase
        .from("participant_history")
        .select("*")
        .eq("participant_id", participantId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setParticipantHistory(data || []);
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const fetchParticipantInvitations = async (participantId: string) => {
    try {
      const { data, error } = await supabase
        .from("participant_portal_invitations")
        .select("*")
        .eq("participant_id", participantId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setParticipantInvitations(data || []);
    } catch (error) {
      console.error("Error fetching invitations:", error);
    }
  };

  const saveNotes = async () => {
    if (!participant) return;

    setIsSavingNotes(true);
    try {
      const { error } = await supabase
        .from("participants")
        .update({ internal_notes: editedNotes })
        .eq("id", participant.id);

      if (error) throw error;

      toast({
        title: "Erfolg",
        description: "Notizen wurden gespeichert.",
      });
      onUpdate();
    } catch (error) {
      console.error("Error saving notes:", error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Notizen konnten nicht gespeichert werden.",
      });
    } finally {
      setIsSavingNotes(false);
    }
  };

  const updateStatus = async (newStatus: string) => {
    if (!participant) return;

    try {
      const { error } = await supabase
        .from("participants")
        .update({ status: newStatus })
        .eq("id", participant.id);

      if (error) throw error;

      toast({
        title: "Erfolg",
        description: "Status wurde aktualisiert.",
      });
      onUpdate();
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Status konnte nicht aktualisiert werden.",
      });
    }
  };

  const sendPortalInvitation = async () => {
    if (!participant) return;

    setIsSendingInvitation(true);
    try {
      const { error } = await supabase.functions.invoke("send-portal-invitation", {
        body: { participantId: participant.id },
      });

      if (error) throw error;

      toast({
        title: "Einladung gesendet",
        description: `Die Einladung wurde an ${participant.email} gesendet.`,
      });
      fetchParticipantInvitations(participant.id);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Einladung konnte nicht gesendet werden.";
      console.error("Error sending invitation:", error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: errorMessage,
      });
    } finally {
      setIsSendingInvitation(false);
    }
  };

  const createInvitationLink = async () => {
    if (!participant) return;

    setIsCreatingInvitation(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const token = crypto.randomUUID();

      const { error } = await supabase.from("participant_portal_invitations").insert({
        participant_id: participant.id,
        email: participant.email,
        token,
        created_by: user?.id,
      });

      if (error) throw error;

      const invitationLink = `${window.location.origin}/portal/einladung/${token}`;
      await navigator.clipboard.writeText(invitationLink);

      toast({
        title: "Einladungslink erstellt",
        description: "Der Link wurde in die Zwischenablage kopiert.",
      });

      fetchParticipantInvitations(participant.id);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Link konnte nicht erstellt werden.";
      console.error("Error creating invitation link:", error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: errorMessage,
      });
    } finally {
      setIsCreatingInvitation(false);
    }
  };

  const copyInvitationLink = async (token: string) => {
    const invitationLink = `${window.location.origin}/portal/einladung/${token}`;
    await navigator.clipboard.writeText(invitationLink);
    toast({
      title: "Link kopiert",
      description: "Der Einladungslink wurde in die Zwischenablage kopiert.",
    });
  };

  const handleDownloadPDF = async (invoice: any) => {
    if (!settings) {
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Einstellungen konnten nicht geladen werden.",
      });
      return;
    }

    try {
      // Fetch invoice with items
      const { data: fullInvoice, error } = await supabase
        .from("invoices")
        .select("*, invoice_items(*)")
        .eq("id", invoice.id)
        .single();

      if (error) throw error;

      const invoiceData = {
        ...fullInvoice,
        items: fullInvoice.invoice_items || [],
      };

      await downloadInvoicePDF(invoiceData as any, settings);
      toast({
        title: "PDF erstellt",
        description: `Rechnung ${invoice.invoice_number} wurde heruntergeladen.`,
      });
    } catch (error) {
      console.error("PDF generation error:", error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "PDF konnte nicht erstellt werden.",
      });
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(amount);

  // Calculate invoice summary
  const invoiceSummary = (invoices || []).reduce(
    (acc, inv) => {
      if (inv.status === "paid") {
        acc.paid += inv.gross_amount;
      } else if (inv.status !== "cancelled") {
        acc.open += inv.gross_amount - (inv.paid_amount || 0);
        if (inv.due_date && new Date(inv.due_date) < new Date()) {
          acc.overdue += 1;
        }
      }
      return acc;
    },
    { open: 0, paid: 0, overdue: 0 }
  );

  if (!participant) return null;

  return (
    <Dialog open={!!participant} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span>{participant.first_name} {participant.last_name}</span>
            {participant.user_id && (
              <Badge variant="outline" className="text-xs">
                <UserCheck className="h-3 w-3 mr-1" />
                Portal aktiv
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Offen</p>
                  <p className={`text-lg font-bold ${invoiceSummary.open > 0 ? "text-amber-600" : "text-foreground"}`}>
                    {formatCurrency(invoiceSummary.open)}
                  </p>
                </div>
                <Clock className={`h-5 w-5 ${invoiceSummary.open > 0 ? "text-amber-500" : "text-muted-foreground"}`} />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Bezahlt</p>
                  <p className="text-lg font-bold text-green-600">{formatCurrency(invoiceSummary.paid)}</p>
                </div>
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Überfällig</p>
                  <p className={`text-lg font-bold ${invoiceSummary.overdue > 0 ? "text-red-600" : "text-foreground"}`}>
                    {invoiceSummary.overdue}
                  </p>
                </div>
                <AlertCircle className={`h-5 w-5 ${invoiceSummary.overdue > 0 ? "text-red-500" : "text-muted-foreground"}`} />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="info">Infos</TabsTrigger>
            <TabsTrigger value="invoices" className="relative">
              Rechnungen
              {invoiceSummary.overdue > 0 && (
                <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500" />
              )}
            </TabsTrigger>
            <TabsTrigger value="notes">Notizen</TabsTrigger>
            <TabsTrigger value="documents">Dokumente</TabsTrigger>
            <TabsTrigger value="history">Historie</TabsTrigger>
          </TabsList>

          {/* Info Tab */}
          <TabsContent value="info" className="space-y-4 pt-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{participant.email}</span>
              </div>
              {participant.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{participant.phone}</span>
                </div>
              )}
              {participant.address && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {participant.address}
                    {participant.zip_city && `, ${participant.zip_city}`}
                  </span>
                </div>
              )}
              {participant.date_of_birth && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{format(new Date(participant.date_of_birth), "dd.MM.yyyy")}</span>
                </div>
              )}
            </div>

            <div className="border-t pt-4">
              <Label className="mb-2 block">Status</Label>
              <Select value={participant.status} onValueChange={updateStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {participant.tags && participant.tags.length > 0 && (
              <div className="border-t pt-4">
                <Label className="mb-2 block">Tags</Label>
                <div className="flex flex-wrap gap-2">
                  {participant.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Portal Access */}
            <div className="border-t pt-4">
              <Label className="mb-2 block">Portal-Zugang</Label>
              {participant.user_id ? (
                <div className="flex items-center gap-2 text-green-600">
                  <UserCheck className="h-4 w-4" />
                  <span className="text-sm">Teilnehmer hat Portal-Zugang</span>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      onClick={sendPortalInvitation}
                      disabled={isSendingInvitation}
                    >
                      {isSendingInvitation ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Wird gesendet...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Einladung per E-Mail
                        </>
                      )}
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={createInvitationLink}
                      disabled={isCreatingInvitation}
                    >
                      {isCreatingInvitation ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Erstellen...
                        </>
                      ) : (
                        <>
                          <LinkIcon className="mr-2 h-4 w-4" />
                          Link erstellen
                        </>
                      )}
                    </Button>
                  </div>

                  {participantInvitations.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Einladungen:</p>
                      {participantInvitations.slice(0, 3).map((inv) => {
                        const isExpired = new Date(inv.expires_at) < new Date();
                        const isAccepted = !!inv.accepted_at;
                        return (
                          <div
                            key={inv.id}
                            className="flex items-center justify-between p-2 rounded-lg bg-muted/50 text-sm"
                          >
                            <div className="flex items-center gap-2">
                              {isAccepted ? (
                                <Badge className="bg-green-100 text-green-800">Angenommen</Badge>
                              ) : isExpired ? (
                                <Badge variant="secondary">Abgelaufen</Badge>
                              ) : (
                                <Badge variant="outline">Offen</Badge>
                              )}
                              <span className="text-muted-foreground">
                                {format(new Date(inv.created_at), "dd.MM.yyyy HH:mm", { locale: de })}
                              </span>
                            </div>
                            {!isAccepted && !isExpired && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyInvitationLink(inv.token)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Invoices Tab */}
          <TabsContent value="invoices" className="pt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Euro className="h-4 w-4" />
                Rechnungen
              </h3>
              {onCreateInvoice && (
                <Button size="sm" onClick={() => onCreateInvoice(participant.id)}>
                  <Plus className="mr-1 h-4 w-4" />
                  Rechnung erstellen
                </Button>
              )}
            </div>

            {isLoadingInvoices ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (invoices || []).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Euro className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Keine Rechnungen vorhanden</p>
                {onCreateInvoice && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => onCreateInvoice(participant.id)}
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Erste Rechnung erstellen
                  </Button>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rechnung</TableHead>
                    <TableHead>Datum</TableHead>
                    <TableHead className="text-right">Betrag</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aktion</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(invoices || []).map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.invoice_number}</TableCell>
                      <TableCell>
                        {format(new Date(invoice.invoice_date), "dd.MM.yyyy", { locale: de })}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(invoice.gross_amount)}
                      </TableCell>
                      <TableCell>
                        <Badge className={invoiceStatusColors[invoice.status]}>
                          {invoiceStatusLabels[invoice.status] || invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadPDF(invoice)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes" className="pt-4">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <StickyNote className="h-4 w-4" />
                <span className="text-sm">Interne Notizen (nur für Mitarbeiter sichtbar)</span>
              </div>
              <Textarea
                rows={8}
                value={editedNotes}
                onChange={(e) => setEditedNotes(e.target.value)}
                placeholder="Notizen zu diesem Teilnehmer..."
              />
              <Button onClick={saveNotes} disabled={isSavingNotes}>
                {isSavingNotes ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Speichern...
                  </>
                ) : (
                  "Notizen speichern"
                )}
              </Button>
            </div>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="pt-4">
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Dokumenten-Upload kommt bald</p>
              <p className="text-sm">Hier können Sie Ausweise, Zertifikate etc. hochladen</p>
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="pt-4">
            {isLoadingHistory ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : participantHistory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Keine Historie vorhanden</p>
              </div>
            ) : (
              <div className="space-y-3">
                {participantHistory.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg"
                  >
                    <History className="h-4 w-4 mt-1 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{entry.action}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(entry.created_at), "dd.MM.yyyy HH:mm", { locale: de })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
