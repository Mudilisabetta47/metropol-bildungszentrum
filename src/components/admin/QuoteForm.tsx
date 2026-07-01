import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useCreateQuote } from "@/hooks/useQuotes";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { ServiceItemPicker } from "./ServiceItemPicker";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2, Loader2, Info } from "lucide-react";
import { format, addDays } from "date-fns";

interface QuoteFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

interface QuoteItemInput {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  catalog_item_id?: string;
}

export function QuoteForm({ onSuccess, onCancel }: QuoteFormProps) {
  const { toast } = useToast();
  const { data: settings } = useSiteSettings();
  const createQuote = useCreateQuote();

  const vatExempt = (settings?.vat_exemption_active || "true") === "true";
  const vatNote =
    settings?.vat_exemption_note ||
    "Umsatzsteuerbefreit gemäß §4 Nr. 21 UStG (Bildungsleistung).";
  const validityDays = parseInt(settings?.quote_validity_days || "30");

  const [recipientName, setRecipientName] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [recipientZipCity, setRecipientZipCity] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [quoteDate, setQuoteDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [validUntil, setValidUntil] = useState(
    format(addDays(new Date(), validityDays), "yyyy-MM-dd")
  );
  const [notes, setNotes] = useState("");
  const [internalNotes, setInternalNotes] = useState("");

  const [items, setItems] = useState<QuoteItemInput[]>([
    { id: crypto.randomUUID(), description: "", quantity: 1, unit: "Stück", unit_price: 0 },
  ]);

  const addItem = () =>
    setItems([
      ...items,
      { id: crypto.randomUUID(), description: "", quantity: 1, unit: "Stück", unit_price: 0 },
    ]);

  const removeItem = (id: string) => {
    if (items.length > 1) setItems(items.filter((i) => i.id !== id));
  };

  const updateItem = <K extends keyof QuoteItemInput>(
    id: string,
    field: K,
    value: QuoteItemInput[K]
  ) => {
    setItems(items.map((it) => (it.id === id ? { ...it, [field]: value } : it)));
  };

  const totals = items.reduce(
    (acc, it) => {
      const net = it.quantity * it.unit_price;
      acc.net += net;
      return acc;
    },
    { net: 0 }
  );

  const currency = (n: number) =>
    new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(n);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientName.trim()) {
      toast({ variant: "destructive", title: "Fehler", description: "Empfänger fehlt." });
      return;
    }
    if (items.some((i) => !i.description.trim())) {
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Bitte alle Positionen ausfüllen.",
      });
      return;
    }
    try {
      await createQuote.mutateAsync({
        recipient_name: recipientName,
        recipient_address: recipientAddress,
        recipient_zip_city: recipientZipCity,
        recipient_email: recipientEmail,
        quote_date: quoteDate,
        valid_until: validUntil,
        notes,
        internal_notes: internalNotes,
        vat_rate: vatExempt ? 0 : 19,
        items: items.map((it) => ({
          description: it.description,
          quantity: it.quantity,
          unit: it.unit,
          unit_price: it.unit_price,
          vat_rate: vatExempt ? 0 : 19,
          catalog_item_id: it.catalog_item_id,
        })),
      });
      toast({ title: "Kostenvoranschlag erstellt" });
      onSuccess();
    } catch (err) {
      console.error(err);
      toast({
        variant: "destructive",
        title: "Fehler",
        description: "Kostenvoranschlag konnte nicht erstellt werden.",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {vatExempt && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-3 flex items-start gap-2 text-sm">
            <Info className="h-4 w-4 mt-0.5 text-primary shrink-0" />
            <span>{vatNote}</span>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Empfänger *</Label>
          <Input value={recipientName} onChange={(e) => setRecipientName(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label>E-Mail</Label>
          <Input type="email" value={recipientEmail} onChange={(e) => setRecipientEmail(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Adresse</Label>
          <Input value={recipientAddress} onChange={(e) => setRecipientAddress(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>PLZ / Ort</Label>
          <Input value={recipientZipCity} onChange={(e) => setRecipientZipCity(e.target.value)} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Datum</Label>
          <Input type="date" value={quoteDate} onChange={(e) => setQuoteDate(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Gültig bis</Label>
          <Input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Positionen</Label>
          <div className="flex gap-2">
            <ServiceItemPicker
              onSelect={(it) =>
                setItems((prev) => [
                  ...prev.filter((p) => p.description || p.unit_price),
                  {
                    id: crypto.randomUUID(),
                    description: it.name + (it.description ? ` – ${it.description}` : ""),
                    quantity: 1,
                    unit: it.unit,
                    unit_price: Number(it.unit_price),
                    catalog_item_id: it.id,
                  },
                ])
              }
            />
            <Button type="button" variant="outline" size="sm" onClick={addItem}>
              <Plus className="mr-1 h-4 w-4" />
              Position
            </Button>
          </div>
        </div>

        {items.map((item) => (
          <div key={item.id} className="grid gap-3 p-4 border rounded-lg bg-muted/50">
            <div className="flex items-start gap-3">
              <div className="flex-1 space-y-2">
                <Label>Beschreibung</Label>
                <Input
                  value={item.description}
                  onChange={(e) => updateItem(item.id, "description", e.target.value)}
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
            <div className="grid gap-3 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Menge</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={item.quantity}
                  onChange={(e) =>
                    updateItem(item.id, "quantity", parseFloat(e.target.value) || 0)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Einheit</Label>
                <Input value={item.unit} onChange={(e) => updateItem(item.id, "unit", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Einzelpreis (€)</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={item.unit_price}
                  onChange={(e) =>
                    updateItem(item.id, "unit_price", parseFloat(e.target.value) || 0)
                  }
                />
              </div>
            </div>
            <div className="text-right text-sm text-muted-foreground">
              Summe: {currency(item.quantity * item.unit_price)}
            </div>
          </div>
        ))}

        <div className="border-t pt-4 flex justify-between font-bold text-lg">
          <span>Gesamtbetrag:</span>
          <span className="text-primary">{currency(totals.net)}</span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Hinweise (auf KV)</Label>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
        </div>
        <div className="space-y-2">
          <Label>Interne Notizen</Label>
          <Textarea value={internalNotes} onChange={(e) => setInternalNotes(e.target.value)} rows={3} />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Abbrechen
        </Button>
        <Button type="submit" disabled={createQuote.isPending}>
          {createQuote.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Kostenvoranschlag erstellen
        </Button>
      </div>
    </form>
  );
}
