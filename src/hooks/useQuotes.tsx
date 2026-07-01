import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Quote {
  id: string;
  quote_number: string;
  participant_id: string | null;
  recipient_name: string;
  recipient_address: string | null;
  recipient_zip_city: string | null;
  recipient_email: string | null;
  net_amount: number;
  vat_rate: number;
  vat_amount: number;
  gross_amount: number;
  quote_date: string;
  valid_until: string | null;
  service_date: string | null;
  service_period_start: string | null;
  service_period_end: string | null;
  status: string;
  converted_to_invoice_id: string | null;
  converted_at: string | null;
  pdf_url: string | null;
  notes: string | null;
  internal_notes: string | null;
  version: number;
  is_locked: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface QuoteItem {
  id: string;
  quote_id: string;
  position: number;
  description: string;
  quantity: number;
  unit: string | null;
  unit_price: number;
  net_amount: number;
  vat_rate: number;
  vat_amount: number;
  gross_amount: number;
  catalog_item_id: string | null;
  course_id: string | null;
}

export interface QuoteWithItems extends Quote {
  quote_items: QuoteItem[];
  participants?: {
    first_name: string;
    last_name: string;
    email: string;
  } | null;
}

export interface CreateQuoteData {
  participant_id?: string;
  recipient_name: string;
  recipient_address?: string;
  recipient_zip_city?: string;
  recipient_email?: string;
  quote_date?: string;
  valid_until?: string;
  service_date?: string;
  service_period_start?: string;
  service_period_end?: string;
  notes?: string;
  internal_notes?: string;
  vat_rate?: number;
  items: {
    description: string;
    quantity: number;
    unit?: string;
    unit_price: number;
    vat_rate?: number;
    catalog_item_id?: string;
  }[];
}

export function useQuotes(statusFilter?: string) {
  return useQuery({
    queryKey: ["quotes", statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("quotes")
        .select(`
          *,
          quote_items (*),
          participants (first_name, last_name, email)
        `)
        .eq("is_deleted", false)
        .order("created_at", { ascending: false });
      if (statusFilter && statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data as unknown as QuoteWithItems[];
    },
  });
}

export function useCreateQuote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateQuoteData) => {
      const { data: quoteNumber, error: numErr } = await supabase.rpc("generate_quote_number");
      if (numErr) throw numErr;

      const defaultVatRate = data.vat_rate ?? 0;
      let totalNet = 0;
      let totalVat = 0;
      let totalGross = 0;

      const items = data.items.map((item, index) => {
        const netAmount = item.quantity * item.unit_price;
        const vatRate = item.vat_rate ?? defaultVatRate;
        const vatAmount = netAmount * (vatRate / 100);
        const grossAmount = netAmount + vatAmount;
        totalNet += netAmount;
        totalVat += vatAmount;
        totalGross += grossAmount;
        return {
          position: index + 1,
          description: item.description,
          quantity: item.quantity,
          unit: item.unit || "Stück",
          unit_price: item.unit_price,
          net_amount: netAmount,
          vat_rate: vatRate,
          vat_amount: vatAmount,
          gross_amount: grossAmount,
          catalog_item_id: item.catalog_item_id,
        };
      });

      const { data: quote, error: qErr } = await supabase
        .from("quotes")
        .insert({
          quote_number: quoteNumber,
          participant_id: data.participant_id,
          recipient_name: data.recipient_name,
          recipient_address: data.recipient_address,
          recipient_zip_city: data.recipient_zip_city,
          recipient_email: data.recipient_email,
          net_amount: totalNet,
          vat_rate: defaultVatRate,
          vat_amount: totalVat,
          gross_amount: totalGross,
          quote_date: data.quote_date || new Date().toISOString().split("T")[0],
          valid_until: data.valid_until,
          service_date: data.service_date,
          service_period_start: data.service_period_start,
          service_period_end: data.service_period_end,
          notes: data.notes,
          internal_notes: data.internal_notes,
          status: "draft",
        })
        .select()
        .single();

      if (qErr) throw qErr;

      const { error: itemsErr } = await supabase
        .from("quote_items")
        .insert(items.map((i) => ({ ...i, quote_id: quote.id })));
      if (itemsErr) throw itemsErr;

      return quote;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["quotes"] }),
  });
}

export function useUpdateQuoteStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("quotes").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["quotes"] }),
  });
}

export function useSoftDeleteQuote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("quotes")
        .update({ is_deleted: true, deleted_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["quotes"] }),
  });
}

export function useConvertQuoteToInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (quote: QuoteWithItems) => {
      const { data: invoiceNumber, error: numErr } = await supabase.rpc("generate_invoice_number");
      if (numErr) throw numErr;

      const { data: invoice, error: invErr } = await supabase
        .from("invoices")
        .insert({
          invoice_number: invoiceNumber,
          participant_id: quote.participant_id,
          recipient_name: quote.recipient_name,
          recipient_address: quote.recipient_address,
          recipient_zip_city: quote.recipient_zip_city,
          recipient_email: quote.recipient_email,
          net_amount: quote.net_amount,
          vat_rate: quote.vat_rate,
          vat_amount: quote.vat_amount,
          gross_amount: quote.gross_amount,
          service_date: quote.service_date,
          service_period_start: quote.service_period_start,
          service_period_end: quote.service_period_end,
          notes: quote.notes,
          internal_notes: `Erstellt aus Kostenvoranschlag ${quote.quote_number}`,
          status: "draft",
        })
        .select()
        .single();
      if (invErr) throw invErr;

      const items = quote.quote_items.map((it) => ({
        invoice_id: invoice.id,
        position: it.position,
        description: it.description,
        quantity: it.quantity,
        unit: it.unit,
        unit_price: it.unit_price,
        net_amount: it.net_amount,
        vat_rate: it.vat_rate,
        vat_amount: it.vat_amount,
        gross_amount: it.gross_amount,
        course_id: it.course_id,
      }));
      const { error: itemsErr } = await supabase.from("invoice_items").insert(items);
      if (itemsErr) throw itemsErr;

      const { error: updErr } = await supabase
        .from("quotes")
        .update({
          status: "converted",
          converted_to_invoice_id: invoice.id,
          converted_at: new Date().toISOString(),
        })
        .eq("id", quote.id);
      if (updErr) throw updErr;

      return invoice;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["quotes"] });
      qc.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
}
