import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface ParticipantProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  address: string | null;
  zip_city: string | null;
  date_of_birth: string | null;
}

export interface ParticipantCourse {
  id: string;
  status: string;
  created_at: string;
  course_dates: {
    id: string;
    start_date: string;
    end_date: string | null;
    start_time: string | null;
    end_time: string | null;
    courses: {
      id: string;
      title: string;
      category: string;
    } | null;
    locations: {
      id: string;
      name: string;
      address: string;
    } | null;
  } | null;
}

export interface Certificate {
  id: string;
  certificate_number: string;
  title: string;
  issued_at: string;
  valid_until: string | null;
  pdf_url: string | null;
  status: string;
  courses: {
    title: string;
    category: string;
  } | null;
}

export interface ParticipantInvoice {
  id: string;
  invoice_number: string;
  invoice_date: string;
  due_date: string | null;
  gross_amount: number;
  status: string;
  pdf_url: string | null;
}

export function useParticipantProfile() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["participant-profile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from("participants")
        .select("id, first_name, last_name, email, phone, address, zip_city, date_of_birth")
        .eq("user_id", user.id)
        .eq("is_deleted", false)
        .maybeSingle();

      if (error) throw error;
      return data as ParticipantProfile | null;
    },
    enabled: !!user?.id,
  });
}

export function useUpdateParticipantProfile() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: Partial<ParticipantProfile>) => {
      if (!user?.id) throw new Error("Nicht eingeloggt");

      const { error } = await supabase
        .from("participants")
        .update({
          first_name: data.first_name,
          last_name: data.last_name,
          phone: data.phone,
          address: data.address,
          zip_city: data.zip_city,
          date_of_birth: data.date_of_birth,
        })
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["participant-profile"] });
    },
  });
}

export function useParticipantCourses() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["participant-courses", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // First get participant
      const { data: participant } = await supabase
        .from("participants")
        .select("email")
        .eq("user_id", user.id)
        .eq("is_deleted", false)
        .maybeSingle();

      if (!participant) return [];

      // Then get registrations by email
      const { data, error } = await supabase
        .from("registrations")
        .select(`
          id,
          status,
          created_at,
          course_dates (
            id,
            start_date,
            end_date,
            start_time,
            end_time,
            courses (id, title, category),
            locations (id, name, address)
          )
        `)
        .eq("email", participant.email)
        .eq("is_deleted", false)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as ParticipantCourse[];
    },
    enabled: !!user?.id,
  });
}

export function useParticipantCertificates() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["participant-certificates", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // First get participant
      const { data: participant } = await supabase
        .from("participants")
        .select("id")
        .eq("user_id", user.id)
        .eq("is_deleted", false)
        .maybeSingle();

      if (!participant) return [];

      const { data, error } = await supabase
        .from("certificates")
        .select(`
          id,
          certificate_number,
          title,
          issued_at,
          valid_until,
          pdf_url,
          status,
          courses (title, category)
        `)
        .eq("participant_id", participant.id)
        .eq("status", "issued")
        .order("issued_at", { ascending: false });

      if (error) throw error;
      return data as Certificate[];
    },
    enabled: !!user?.id,
  });
}

export function useParticipantInvoices() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["participant-invoices", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // First get participant
      const { data: participant } = await supabase
        .from("participants")
        .select("id")
        .eq("user_id", user.id)
        .eq("is_deleted", false)
        .maybeSingle();

      if (!participant) return [];

      const { data, error } = await supabase
        .from("invoices")
        .select(`
          id,
          invoice_number,
          invoice_date,
          due_date,
          gross_amount,
          status,
          pdf_url
        `)
        .eq("participant_id", participant.id)
        .eq("is_deleted", false)
        .neq("status", "draft")
        .order("invoice_date", { ascending: false });

      if (error) throw error;
      return data as ParticipantInvoice[];
    },
    enabled: !!user?.id,
  });
}

// Hook for accepting portal invitation
export function useAcceptPortalInvitation() {
  return useMutation({
    mutationFn: async ({ token, password }: { token: string; password: string }) => {
      // 1. Get invitation
      const { data: invitation, error: invError } = await supabase
        .from("participant_portal_invitations")
        .select("*, participants(email, first_name, last_name)")
        .eq("token", token)
        .is("accepted_at", null)
        .gt("expires_at", new Date().toISOString())
        .maybeSingle();

      if (invError) throw invError;
      if (!invitation) throw new Error("Einladung nicht gefunden oder abgelaufen");

      const participant = invitation.participants as { email: string; first_name: string; last_name: string } | null;
      if (!participant) throw new Error("Teilnehmer nicht gefunden");

      // 2. Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: participant.email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/portal`,
          data: {
            first_name: participant.first_name,
            last_name: participant.last_name,
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Benutzer konnte nicht erstellt werden");

      // 3. Link participant to user (will be done via edge function for security)
      const { error: linkError } = await supabase.functions.invoke("accept-portal-invitation", {
        body: { token, userId: authData.user.id },
      });

      if (linkError) throw linkError;

      return { user: authData.user };
    },
  });
}
