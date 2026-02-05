import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Invoice {
  id: string;
  invoice_number: string;
  registration_id: string | null;
  participant_id: string | null;
  recipient_name: string;
  recipient_address: string | null;
  recipient_zip_city: string | null;
  recipient_email: string | null;
  net_amount: number;
  vat_rate: number;
  vat_amount: number;
  gross_amount: number;
  invoice_date: string;
  service_date: string | null;
  service_period_start: string | null;
  service_period_end: string | null;
  due_date: string | null;
  status: string;
  paid_at: string | null;
  paid_amount: number | null;
  payment_method: string | null;
  payment_reference: string | null;
  cancelled_invoice_id: string | null;
  cancellation_reason: string | null;
  cancelled_at: string | null;
  pdf_url: string | null;
  notes: string | null;
  internal_notes: string | null;
  version: number;
  is_locked: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  position: number;
  description: string;
  quantity: number;
  unit: string | null;
  unit_price: number;
  net_amount: number;
  vat_rate: number;
  vat_amount: number;
  gross_amount: number;
  course_id: string | null;
  course_date_id: string | null;
}

export interface InvoiceWithItems extends Invoice {
  invoice_items: InvoiceItem[];
  participants?: {
    first_name: string;
    last_name: string;
    email: string;
  } | null;
  registrations?: {
    first_name: string;
    last_name: string;
    email: string;
    course_dates?: {
      courses?: { title: string } | null;
      locations?: { name: string } | null;
    } | null;
  } | null;
}

export interface InvoiceHistory {
  id: string;
  invoice_id: string;
  action: string;
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  change_reason: string | null;
  performed_by: string | null;
  performed_at: string;
}

export interface CreateInvoiceData {
  registration_id?: string;
  participant_id?: string;
  recipient_name: string;
  recipient_address?: string;
  recipient_zip_city?: string;
  recipient_email?: string;
  invoice_date?: string;
  service_date?: string;
  service_period_start?: string;
  service_period_end?: string;
  due_date?: string;
  notes?: string;
  internal_notes?: string;
  items: {
    description: string;
    quantity: number;
    unit?: string;
    unit_price: number;
    vat_rate: number;
    course_id?: string;
    course_date_id?: string;
  }[];
}

export function useInvoices(statusFilter?: string) {
  return useQuery({
    queryKey: ["invoices", statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("invoices")
        .select(`
          *,
          invoice_items (*),
          participants (first_name, last_name, email),
          registrations (
            first_name, last_name, email,
            course_dates (
              courses (title),
              locations (name)
            )
          )
        `)
        .eq("is_deleted", false)
        .order("created_at", { ascending: false });

      if (statusFilter && statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as InvoiceWithItems[];
    },
  });
}

export function useInvoice(id: string | null) {
  return useQuery({
    queryKey: ["invoice", id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from("invoices")
        .select(`
          *,
          invoice_items (*),
          participants (first_name, last_name, email),
          registrations (
            first_name, last_name, email,
            course_dates (
              courses (title),
              locations (name)
            )
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as InvoiceWithItems;
    },
    enabled: !!id,
  });
}

export function useInvoiceHistory(invoiceId: string | null) {
  return useQuery({
    queryKey: ["invoice-history", invoiceId],
    queryFn: async () => {
      if (!invoiceId) return [];

      const { data, error } = await supabase
        .from("invoice_history")
        .select("*")
        .eq("invoice_id", invoiceId)
        .order("performed_at", { ascending: false });

      if (error) throw error;
      return data as InvoiceHistory[];
    },
    enabled: !!invoiceId,
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateInvoiceData) => {
      // 1. Generate invoice number
      const { data: invoiceNumber, error: numberError } = await supabase
        .rpc("generate_invoice_number");

      if (numberError) throw numberError;

      // 2. Calculate totals
      const defaultVatRate = 19;
      let totalNet = 0;
      let totalVat = 0;
      let totalGross = 0;

      const itemsWithCalculations = data.items.map((item, index) => {
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
          course_id: item.course_id,
          course_date_id: item.course_date_id,
        };
      });

      // 3. Create invoice
      const { data: invoice, error: invoiceError } = await supabase
        .from("invoices")
        .insert({
          invoice_number: invoiceNumber,
          registration_id: data.registration_id,
          participant_id: data.participant_id,
          recipient_name: data.recipient_name,
          recipient_address: data.recipient_address,
          recipient_zip_city: data.recipient_zip_city,
          recipient_email: data.recipient_email,
          net_amount: totalNet,
          vat_rate: defaultVatRate,
          vat_amount: totalVat,
          gross_amount: totalGross,
          invoice_date: data.invoice_date || new Date().toISOString().split("T")[0],
          service_date: data.service_date,
          service_period_start: data.service_period_start,
          service_period_end: data.service_period_end,
          due_date: data.due_date,
          notes: data.notes,
          internal_notes: data.internal_notes,
          status: "draft",
        })
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // 4. Create invoice items
      const { error: itemsError } = await supabase
        .from("invoice_items")
        .insert(
          itemsWithCalculations.map((item) => ({
            ...item,
            invoice_id: invoice.id,
          }))
        );

      if (itemsError) throw itemsError;

      return invoice;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
}

export function useUpdateInvoiceStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      invoiceId,
      status,
      paidAmount,
      paymentMethod,
      paymentReference,
    }: {
      invoiceId: string;
      status: string;
      paidAmount?: number;
      paymentMethod?: string;
      paymentReference?: string;
    }) => {
      const updates: Record<string, unknown> = { status };

      if (status === "paid" || status === "partial") {
        updates.paid_at = new Date().toISOString();
        if (paidAmount !== undefined) updates.paid_amount = paidAmount;
        if (paymentMethod) updates.payment_method = paymentMethod;
        if (paymentReference) updates.payment_reference = paymentReference;
      }

      const { error } = await supabase
        .from("invoices")
        .update(updates)
        .eq("id", invoiceId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["invoice"] });
    },
  });
}

export function useCancelInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      invoiceId,
      cancellationReason,
    }: {
      invoiceId: string;
      cancellationReason: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from("invoices")
        .update({
          status: "cancelled",
          cancelled_at: new Date().toISOString(),
          cancelled_by: user?.id,
          cancellation_reason: cancellationReason,
        })
        .eq("id", invoiceId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["invoice"] });
      queryClient.invalidateQueries({ queryKey: ["invoice-history"] });
      queryClient.invalidateQueries({ queryKey: ["invoice-stats"] });
      queryClient.invalidateQueries({ queryKey: ["participant-invoices"] });
    },
  });
}

export function useSoftDeleteInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (invoiceId: string) => {
      const { error } = await supabase
        .from("invoices")
        .update({
          is_deleted: true,
          deleted_at: new Date().toISOString(),
        })
        .eq("id", invoiceId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
}

export function useInvoiceStats() {
  return useQuery({
    queryKey: ["invoice-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select("status, gross_amount, paid_amount, invoice_date, due_date")
        .eq("is_deleted", false);

      if (error) throw error;

      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      const stats = {
        totalRevenue: 0,
        openAmount: 0,
        overdueAmount: 0,
        thisMonthRevenue: 0,
        invoiceCount: data.length,
        openCount: 0,
        overdueCount: 0,
        paidCount: 0,
      };

      data.forEach((invoice) => {
        const grossAmount = Number(invoice.gross_amount) || 0;
        const paidAmount = Number(invoice.paid_amount) || 0;

        if (invoice.status === "paid") {
          stats.totalRevenue += grossAmount;
          stats.paidCount++;

          const invoiceDate = new Date(invoice.invoice_date);
          if (invoiceDate >= monthStart) {
            stats.thisMonthRevenue += grossAmount;
          }
        } else if (invoice.status === "sent" || invoice.status === "partial" || invoice.status === "overdue") {
          const remaining = grossAmount - paidAmount;
          stats.openAmount += remaining;
          stats.openCount++;

          if (invoice.due_date && new Date(invoice.due_date) < now) {
            stats.overdueAmount += remaining;
            stats.overdueCount++;
          }
        }
      });

      return stats;
    },
  });
}

export function useSendInvoiceEmail() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      invoiceId,
      recipientEmail,
      subject,
      message,
    }: {
      invoiceId: string;
      recipientEmail: string;
      subject?: string;
      message?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke("send-invoice-email", {
        body: { invoiceId, recipientEmail, subject, message },
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || "E-Mail konnte nicht gesendet werden");

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["invoice"] });
      queryClient.invalidateQueries({ queryKey: ["invoice-history"] });
      toast({
        title: "E-Mail gesendet",
        description: `Rechnung wurde an ${variables.recipientEmail} gesendet.`,
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Fehler beim Senden",
        description: error.message,
      });
    },
  });
}
