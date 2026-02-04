import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ParticipantInvoiceSummary {
  participantId: string;
  totalInvoices: number;
  openAmount: number;
  paidAmount: number;
  overdueCount: number;
}

export interface ParticipantInvoice {
  id: string;
  invoice_number: string;
  invoice_date: string;
  due_date: string | null;
  gross_amount: number;
  paid_amount: number | null;
  status: string;
  recipient_name: string;
}

// Fetch all invoice summaries for participants (for table display)
export function useParticipantInvoiceSummaries() {
  return useQuery({
    queryKey: ["participant-invoice-summaries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select("participant_id, gross_amount, paid_amount, status, due_date")
        .eq("is_deleted", false)
        .not("participant_id", "is", null);

      if (error) throw error;

      // Group by participant_id
      const summaryMap = new Map<string, ParticipantInvoiceSummary>();

      (data || []).forEach((inv) => {
        if (!inv.participant_id) return;

        const existing = summaryMap.get(inv.participant_id) || {
          participantId: inv.participant_id,
          totalInvoices: 0,
          openAmount: 0,
          paidAmount: 0,
          overdueCount: 0,
        };

        existing.totalInvoices += 1;

        if (inv.status === "paid") {
          existing.paidAmount += inv.gross_amount;
        } else if (inv.status !== "cancelled" && inv.status !== "refunded") {
          const remaining = inv.gross_amount - (inv.paid_amount || 0);
          existing.openAmount += remaining;

          // Check if overdue
          if (inv.due_date && new Date(inv.due_date) < new Date()) {
            existing.overdueCount += 1;
          }
        }

        summaryMap.set(inv.participant_id, existing);
      });

      return summaryMap;
    },
    staleTime: 30 * 1000,
  });
}

// Fetch invoices for a specific participant
export function useParticipantInvoices(participantId: string | null) {
  return useQuery({
    queryKey: ["participant-invoices", participantId],
    queryFn: async () => {
      if (!participantId) return [];

      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .eq("participant_id", participantId)
        .eq("is_deleted", false)
        .order("invoice_date", { ascending: false });

      if (error) throw error;
      return data as ParticipantInvoice[];
    },
    enabled: !!participantId,
  });
}
