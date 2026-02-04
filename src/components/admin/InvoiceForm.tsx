import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useCreateInvoice } from "@/hooks/useInvoices";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ParticipantSearch, type ParticipantSearchResult } from "./ParticipantSearch";
import { Plus, Trash2, Loader2, User, X, Mail, Send } from "lucide-react";
import { format, addDays } from "date-fns";

interface InvoiceFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  registrationId?: string;
  participantId?: string;
}

interface InvoiceItemInput {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  vat_rate: number;
}

export function InvoiceForm({
  onSuccess,
  onCancel,
  registrationId,
  participantId,
}: InvoiceFormProps) {
  const { toast } = useToast();
  const { data: settings } = useSiteSettings();
  const createInvoice = useCreateInvoice();

  // Selected participant
  const [selectedParticipant, setSelectedParticipant] = useState<ParticipantSearchResult | null>(null);

  // Form fields
  const [recipientName, setRecipientName] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [recipientZipCity, setRecipientZipCity] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [serviceDate, setServiceDate] = useState("");
  const [dueDate, setDueDate] = useState(
    format(addDays(new Date(), parseInt(settings?.invoice_payment_terms || "14")), "yyyy-MM-dd")
  );
  const [notes, setNotes] = useState("");
  const [internalNotes, setInternalNotes] = useState("");
  const [sendEmailNotification, setSendEmailNotification] = useState(true);
  
  const [items, setItems] = useState<InvoiceItemInput[]>([
    {
      id: crypto.randomUUID(),
      description: "",
      quantity: 1,
      unit: "Stück",
      unit_price: 0,
      vat_rate: parseInt(settings?.default_vat_rate || "19"),
    },
  ]);

  // Update due date when settings change
  useEffect(() => {
    if (settings?.invoice_payment_terms) {
      setDueDate(format(addDays(new Date(), parseInt(settings.invoice_payment_terms)), "yyyy-MM-dd"));
    }
  }, [settings?.invoice_payment_terms]);

  // Handle participant selection from search
  const handleParticipantSelect = async (participant: ParticipantSearchResult) => {
    setSelectedParticipant(participant);
    setRecipientName(`${participant.first_name} ${participant.last_name}`);
    setRecipientAddress(participant.address || "");
    setRecipientZipCity(participant.zip_city || "");
    setRecipientEmail(participant.email);

    // Try to load latest course for this participant
    const { data: regData } = await supabase
      .from("registrations")
      .select(`
        course_dates (
          courses (title, price)
        )
      `)
      .eq("email", participant.email)
      .eq("is_deleted", false)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (regData?.course_dates?.courses) {
      setItems([
        {
          id: crypto.randomUUID(),
          description: regData.course_dates.courses.title,
          quantity: 1,
          unit: "Teilnahme",
          unit_price: regData.course_dates.courses.price || 0,
          vat_rate: parseInt(settings?.default_vat_rate || "19"),
        },
      ]);
    }
  };

  const clearParticipant = () => {
    setSelectedParticipant(null);
    setRecipientName("");
    setRecipientAddress("");
    setRecipientZipCity("");
    setRecipientEmail("");
  };

  const addItem = () => {
    setItems([
      ...items,
      {
        id: crypto.randomUUID(),
        description: "",
        quantity: 1,
        unit: "Stück",
        unit_price: 0,
        vat_rate: parseInt(settings?.default_vat_rate || "19"),
      },
    ]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof InvoiceItemInput, value: string | number) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const calculateTotals = () => {
    let netTotal = 0;
    let vatTotal = 0;

    items.forEach((item) => {
      const net = item.quantity * item.unit_price;
      const vat = net * (item.vat_rate / 100);
      netTotal += net;
      vatTotal += vat;
    });

    return {
      net: netTotal,
      vat: vatTotal,
      gross: netTotal + vatTotal,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!recipientName.trim()) {
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Bitte geben Sie einen Empfängernamen ein.",
      });
      return;
    }

    if (items.some((item) => !item.description.trim())) {
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Bitte füllen Sie alle Positionsbeschreibungen aus.",
      });
      return;
    }

    try {
      const result = await createInvoice.mutateAsync({
        registration_id: registrationId,
        participant_id: selectedParticipant?.id || participantId,
        recipient_name: recipientName,
        recipient_address: recipientAddress,
        recipient_zip_city: recipientZipCity,
        recipient_email: recipientEmail,
        invoice_date: invoiceDate,
        service_date: serviceDate || undefined,
        due_date: dueDate,
        notes,
        internal_notes: internalNotes,
        items: items.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          unit_price: item.unit_price,
          vat_rate: item.vat_rate,
        })),
      });

      // Send email notification if enabled and email exists
      if (sendEmailNotification && recipientEmail && result?.id) {
        try {
          await supabase.functions.invoke("send-invoice-notification", {
            body: { invoiceId: result.id },
          });
          toast({
            title: "Rechnung erstellt & E-Mail gesendet",
            description: `Die Rechnung wurde erstellt und eine Benachrichtigung an ${recipientEmail} gesendet.`,
          });
        } catch (emailError) {
          console.error("Email notification failed:", emailError);
          toast({
            title: "Rechnung erstellt",
            description: "Die Rechnung wurde erstellt. E-Mail-Benachrichtigung konnte nicht gesendet werden.",
          });
        }
      } else {
        toast({
          title: "Rechnung erstellt",
          description: "Die Rechnung wurde erfolgreich erstellt.",
        });
      }

      onSuccess();
    } catch (error) {
      console.error("Error creating invoice:", error);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Die Rechnung konnte nicht erstellt werden.",
      });
    }
  };

  const totals = calculateTotals();
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(amount);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Smart Participant Search */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Teilnehmer auswählen</Label>
        
        {selectedParticipant ? (
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">
                      {selectedParticipant.first_name} {selectedParticipant.last_name}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {selectedParticipant.email}
                    </div>
                    {selectedParticipant.user_id && (
                      <Badge variant="outline" className="mt-1 text-xs">
                        Portal-Zugang aktiv
                      </Badge>
                    )}
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearParticipant}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <ParticipantSearch
            onSelect={handleParticipantSelect}
            placeholder="Name oder E-Mail eingeben..."
          />
        )}

        {selectedParticipant?.user_id && (
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <span className="inline-flex h-2 w-2 rounded-full bg-green-500" />
            Diese Rechnung wird im Teilnehmer-Portal sichtbar sein.
          </p>
        )}
      </div>

      {/* Recipient Info - Always visible for manual editing */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="recipientName">Empfänger *</Label>
          <Input
            id="recipientName"
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
            placeholder="Name des Rechnungsempfängers"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="recipientEmail">E-Mail</Label>
          <Input
            id="recipientEmail"
            type="email"
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
            placeholder="E-Mail-Adresse"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="recipientAddress">Adresse</Label>
          <Input
            id="recipientAddress"
            value={recipientAddress}
            onChange={(e) => setRecipientAddress(e.target.value)}
            placeholder="Straße und Hausnummer"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="recipientZipCity">PLZ / Ort</Label>
          <Input
            id="recipientZipCity"
            value={recipientZipCity}
            onChange={(e) => setRecipientZipCity(e.target.value)}
            placeholder="PLZ Ort"
          />
        </div>
      </div>

      {/* Dates */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="invoiceDate">Rechnungsdatum</Label>
          <Input
            id="invoiceDate"
            type="date"
            value={invoiceDate}
            onChange={(e) => setInvoiceDate(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="serviceDate">Leistungsdatum</Label>
          <Input
            id="serviceDate"
            type="date"
            value={serviceDate}
            onChange={(e) => setServiceDate(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dueDate">Fällig am</Label>
          <Input
            id="dueDate"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
      </div>

      {/* Items */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Rechnungspositionen</Label>
          <Button type="button" variant="outline" size="sm" onClick={addItem}>
            <Plus className="mr-1 h-4 w-4" />
            Position hinzufügen
          </Button>
        </div>

        {items.map((item) => (
          <div key={item.id} className="grid gap-3 p-4 border rounded-lg bg-muted/50">
            <div className="flex items-start gap-3">
              <div className="flex-1 space-y-2">
                <Label>Beschreibung</Label>
                <Input
                  value={item.description}
                  onChange={(e) => updateItem(item.id, "description", e.target.value)}
                  placeholder="Beschreibung der Leistung"
                />
              </div>
              {items.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="mt-6"
                  onClick={() => removeItem(item.id)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              )}
            </div>
            <div className="grid gap-3 md:grid-cols-4">
              <div className="space-y-2">
                <Label>Menge</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={item.quantity}
                  onChange={(e) => updateItem(item.id, "quantity", parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label>Einheit</Label>
                <Input
                  value={item.unit}
                  onChange={(e) => updateItem(item.id, "unit", e.target.value)}
                  placeholder="Stück"
                />
              </div>
              <div className="space-y-2">
                <Label>Einzelpreis (€)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={item.unit_price}
                  onChange={(e) => updateItem(item.id, "unit_price", parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label>MwSt. (%)</Label>
                <Select
                  value={item.vat_rate.toString()}
                  onValueChange={(val) => updateItem(item.id, "vat_rate", parseInt(val))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0%</SelectItem>
                    <SelectItem value="7">7%</SelectItem>
                    <SelectItem value="19">19%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="text-right text-sm text-muted-foreground">
              Netto: {formatCurrency(item.quantity * item.unit_price)} | 
              Brutto: {formatCurrency(item.quantity * item.unit_price * (1 + item.vat_rate / 100))}
            </div>
          </div>
        ))}

        {/* Totals */}
        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Nettobetrag:</span>
            <span>{formatCurrency(totals.net)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>MwSt.:</span>
            <span>{formatCurrency(totals.vat)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg">
            <span>Gesamtbetrag:</span>
            <span className="text-primary">{formatCurrency(totals.gross)}</span>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="notes">Hinweise (auf Rechnung)</Label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Wird auf der Rechnung angezeigt"
            rows={3}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="internalNotes">Interne Notizen</Label>
          <Textarea
            id="internalNotes"
            value={internalNotes}
            onChange={(e) => setInternalNotes(e.target.value)}
            placeholder="Nur für interne Zwecke"
            rows={3}
          />
        </div>
      </div>

      {/* Email notification option */}
      {recipientEmail && (
        <div className="flex items-center space-x-2 p-4 bg-muted/50 rounded-lg">
          <Checkbox
            id="sendEmail"
            checked={sendEmailNotification}
            onCheckedChange={(checked) => setSendEmailNotification(checked === true)}
          />
          <Label htmlFor="sendEmail" className="flex items-center gap-2 cursor-pointer">
            <Send className="h-4 w-4" />
            E-Mail-Benachrichtigung an {recipientEmail} senden
          </Label>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Abbrechen
        </Button>
        <Button type="submit" disabled={createInvoice.isPending}>
          {createInvoice.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Rechnung erstellen
        </Button>
      </div>
    </form>
  );
}
