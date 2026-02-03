import { useState } from "react";
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
import { Plus, Trash2, Loader2 } from "lucide-react";
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

  const [registrations, setRegistrations] = useState<Array<{
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    address: string | null;
    zip_city: string | null;
    course_dates: {
      courses: { title: string; price: number | null } | null;
    } | null;
  }>>([]);
  const [selectedRegistration, setSelectedRegistration] = useState<string>("");
  const [isLoadingRegistrations, setIsLoadingRegistrations] = useState(false);

  // Load registrations for selection
  const loadRegistrations = async () => {
    setIsLoadingRegistrations(true);
    try {
      const { data, error } = await supabase
        .from("registrations")
        .select(`
          id, first_name, last_name, email, address, zip_city,
          course_dates (
            courses (title, price)
          )
        `)
        .eq("status", "confirmed")
        .eq("is_deleted", false)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;
      setRegistrations(data || []);
    } catch (error) {
      console.error("Error loading registrations:", error);
    } finally {
      setIsLoadingRegistrations(false);
    }
  };

  const handleRegistrationSelect = (regId: string) => {
    const reg = registrations.find((r) => r.id === regId);
    if (reg) {
      setSelectedRegistration(regId);
      setRecipientName(`${reg.first_name} ${reg.last_name}`);
      setRecipientAddress(reg.address || "");
      setRecipientZipCity(reg.zip_city || "");
      setRecipientEmail(reg.email);

      // Add course as item if available
      if (reg.course_dates?.courses) {
        setItems([
          {
            id: crypto.randomUUID(),
            description: reg.course_dates.courses.title,
            quantity: 1,
            unit: "Teilnahme",
            unit_price: reg.course_dates.courses.price || 0,
            vat_rate: parseInt(settings?.default_vat_rate || "19"),
          },
        ]);
      }
    }
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
      await createInvoice.mutateAsync({
        registration_id: selectedRegistration || registrationId,
        participant_id: participantId,
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

      toast({
        title: "Rechnung erstellt",
        description: "Die Rechnung wurde erfolgreich erstellt.",
      });
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
      {/* Registration Selection */}
      <div className="space-y-2">
        <Label>Aus Anmeldung erstellen (optional)</Label>
        <div className="flex gap-2">
          <Select
            value={selectedRegistration}
            onValueChange={handleRegistrationSelect}
            onOpenChange={(open) => open && loadRegistrations()}
          >
            <SelectTrigger>
              <SelectValue placeholder="Anmeldung auswählen..." />
            </SelectTrigger>
            <SelectContent>
              {isLoadingRegistrations ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : (
                registrations.map((reg) => (
                  <SelectItem key={reg.id} value={reg.id}>
                    {reg.first_name} {reg.last_name} - {reg.course_dates?.courses?.title || "Kurs"}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Recipient Info */}
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
            <span>{formatCurrency(totals.gross)}</span>
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
