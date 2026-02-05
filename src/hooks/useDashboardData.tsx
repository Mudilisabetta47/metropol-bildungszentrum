import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfMonth, subMonths, format } from "date-fns";
import { de } from "date-fns/locale";

export interface DashboardStats {
  totalRegistrations: number;
  pendingRegistrations: number;
  confirmedRegistrations: number;
  totalCourses: number;
  upcomingCourseDates: number;
  unreadContacts: number;
  registrationsThisMonth: number;
  registrationsLastMonth: number;
  // Financial data
  totalRevenue: number;
  openInvoicesAmount: number;
  openInvoicesCount: number;
  overdueInvoicesCount: number;
  paidThisMonth: number;
  // Participants
  totalParticipants: number;
  activeParticipants: number;
  // Capacity
  averageCapacity: number;
}

export interface RecentRegistration {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  status: string;
  created_at: string;
  course_dates: {
    courses: { title: string } | null;
    locations: { name: string } | null;
  } | null;
}

export interface RecentInvoice {
  id: string;
  invoice_number: string;
  recipient_name: string;
  gross_amount: number;
  status: string;
  created_at: string;
}

export interface UpcomingCourseDate {
  id: string;
  start_date: string;
  current_participants: number;
  max_participants: number;
  courses: { title: string } | null;
  locations: { name: string } | null;
}

export interface MonthlyData {
  month: string;
  registrations: number;
  revenue: number;
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async (): Promise<DashboardStats> => {
      const now = new Date();
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

      const [
        registrationsRes,
        pendingRes,
        confirmedRes,
        coursesRes,
        courseDatesRes,
        contactsRes,
        thisMonthRes,
        lastMonthRes,
        participantsRes,
        activeParticipantsRes,
        invoicesRes,
        openInvoicesRes,
        overdueInvoicesRes,
        paidThisMonthRes,
        capacityRes,
      ] = await Promise.all([
        supabase.from("registrations").select("*", { count: "exact", head: true }).eq("is_deleted", false),
        supabase.from("registrations").select("*", { count: "exact", head: true }).eq("status", "pending").eq("is_deleted", false),
        supabase.from("registrations").select("*", { count: "exact", head: true }).eq("status", "confirmed").eq("is_deleted", false),
        supabase.from("courses").select("*", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("course_dates").select("*", { count: "exact", head: true }).gte("start_date", now.toISOString().split("T")[0]).eq("is_active", true),
        supabase.from("contact_requests").select("*", { count: "exact", head: true }).eq("is_read", false),
        supabase.from("registrations").select("*", { count: "exact", head: true }).gte("created_at", thisMonthStart.toISOString()).eq("is_deleted", false),
        supabase.from("registrations").select("*", { count: "exact", head: true }).gte("created_at", lastMonthStart.toISOString()).lte("created_at", lastMonthEnd.toISOString()).eq("is_deleted", false),
        supabase.from("participants").select("*", { count: "exact", head: true }).eq("is_deleted", false),
        supabase.from("participants").select("*", { count: "exact", head: true }).eq("is_deleted", false).in("status", ["active", "confirmed", "registered"]),
        supabase.from("invoices").select("gross_amount, status").eq("is_deleted", false),
        supabase.from("invoices").select("gross_amount, paid_amount").eq("is_deleted", false).in("status", ["sent", "partial", "overdue"]),
        supabase.from("invoices").select("*", { count: "exact", head: true }).eq("status", "overdue").eq("is_deleted", false),
        supabase.from("invoices").select("gross_amount").eq("status", "paid").eq("is_deleted", false).gte("paid_at", thisMonthStart.toISOString()),
        supabase.from("course_dates").select("current_participants, max_participants").eq("is_active", true).gte("start_date", now.toISOString().split("T")[0]),
      ]);

      // Calculate totals
      const totalRevenue = (invoicesRes.data || [])
        .filter((i) => i.status === "paid")
        .reduce((sum, i) => sum + (i.gross_amount || 0), 0);

      const openInvoicesAmount = (openInvoicesRes.data || [])
        .reduce((sum, i) => sum + ((i.gross_amount || 0) - (i.paid_amount || 0)), 0);

      const paidThisMonth = (paidThisMonthRes.data || [])
        .reduce((sum, i) => sum + (i.gross_amount || 0), 0);

      // Calculate average capacity
      const capacityData = capacityRes.data || [];
      const averageCapacity = capacityData.length > 0
        ? Math.round(capacityData.reduce((sum, c) => sum + (c.current_participants / c.max_participants) * 100, 0) / capacityData.length)
        : 0;

      return {
        totalRegistrations: registrationsRes.count || 0,
        pendingRegistrations: pendingRes.count || 0,
        confirmedRegistrations: confirmedRes.count || 0,
        totalCourses: coursesRes.count || 0,
        upcomingCourseDates: courseDatesRes.count || 0,
        unreadContacts: contactsRes.count || 0,
        registrationsThisMonth: thisMonthRes.count || 0,
        registrationsLastMonth: lastMonthRes.count || 0,
        totalRevenue,
        openInvoicesAmount,
        openInvoicesCount: (openInvoicesRes.data || []).length,
        overdueInvoicesCount: overdueInvoicesRes.count || 0,
        paidThisMonth,
        totalParticipants: participantsRes.count || 0,
        activeParticipants: activeParticipantsRes.count || 0,
        averageCapacity,
      };
    },
    staleTime: 30000,
    refetchOnWindowFocus: true,
  });
}

export function useRecentRegistrations(limit = 5) {
  return useQuery({
    queryKey: ["recent-registrations", limit],
    queryFn: async (): Promise<RecentRegistration[]> => {
      const { data, error } = await supabase
        .from("registrations")
        .select(`
          id,
          first_name,
          last_name,
          email,
          status,
          created_at,
          course_dates (
            courses (title),
            locations (name)
          )
        `)
        .eq("is_deleted", false)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data || []) as unknown as RecentRegistration[];
    },
    staleTime: 30000,
  });
}

export function useRecentInvoices(limit = 5) {
  return useQuery({
    queryKey: ["recent-invoices", limit],
    queryFn: async (): Promise<RecentInvoice[]> => {
      const { data, error } = await supabase
        .from("invoices")
        .select("id, invoice_number, recipient_name, gross_amount, status, created_at")
        .eq("is_deleted", false)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    },
    staleTime: 30000,
  });
}

export function useUpcomingCourseDates(limit = 5) {
  return useQuery({
    queryKey: ["upcoming-course-dates", limit],
    queryFn: async (): Promise<UpcomingCourseDate[]> => {
      const now = new Date().toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("course_dates")
        .select(`
          id,
          start_date,
          current_participants,
          max_participants,
          courses (title),
          locations (name)
        `)
        .eq("is_active", true)
        .gte("start_date", now)
        .order("start_date", { ascending: true })
        .limit(limit);

      if (error) throw error;
      return (data || []) as unknown as UpcomingCourseDate[];
    },
    staleTime: 30000,
  });
}

export function useMonthlyTrend(months = 6) {
  return useQuery({
    queryKey: ["monthly-trend", months],
    queryFn: async (): Promise<MonthlyData[]> => {
      const startDate = startOfMonth(subMonths(new Date(), months - 1));

      const [registrationsRes, invoicesRes] = await Promise.all([
        supabase
          .from("registrations")
          .select("created_at")
          .eq("is_deleted", false)
          .gte("created_at", startDate.toISOString()),
        supabase
          .from("invoices")
          .select("created_at, gross_amount, status")
          .eq("is_deleted", false)
          .eq("status", "paid")
          .gte("created_at", startDate.toISOString()),
      ]);

      const monthlyData: Record<string, { registrations: number; revenue: number }> = {};

      // Initialize all months
      for (let i = 0; i < months; i++) {
        const date = subMonths(new Date(), months - 1 - i);
        const key = format(date, "MMM yy", { locale: de });
        monthlyData[key] = { registrations: 0, revenue: 0 };
      }

      // Count registrations per month
      (registrationsRes.data || []).forEach((r) => {
        const key = format(new Date(r.created_at), "MMM yy", { locale: de });
        if (monthlyData[key]) {
          monthlyData[key].registrations++;
        }
      });

      // Sum revenue per month
      (invoicesRes.data || []).forEach((i) => {
        const key = format(new Date(i.created_at), "MMM yy", { locale: de });
        if (monthlyData[key]) {
          monthlyData[key].revenue += i.gross_amount || 0;
        }
      });

      return Object.entries(monthlyData).map(([month, data]) => ({
        month,
        ...data,
      }));
    },
    staleTime: 60000,
  });
}
