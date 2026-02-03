import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SiteSetting {
  id: string;
  key: string;
  value: string | null;
  label: string;
  description: string | null;
  category: string;
  created_at: string;
  updated_at: string;
}

export interface SiteSettingsMap {
  central_phone: string;
  central_email: string;
  contact_person_name: string;
  contact_person_phone: string;
  contact_person_email: string;
  company_name: string;
  company_address: string;
  company_zip_city: string;
  company_ceo: string;
  company_register: string;
  company_vat_id: string;
  [key: string]: string;
}

const defaultSettings: SiteSettingsMap = {
  central_phone: "0511 – 642 50 68",
  central_email: "info@metropol-bz.de",
  contact_person_name: "Regina Martin",
  contact_person_phone: "0511 – 642 50 68",
  contact_person_email: "r.martin@metropol-bz.de",
  company_name: "Metropol Bildungszentrum GmbH",
  company_address: "Podbielskistraße 333",
  company_zip_city: "30659 Hannover",
  company_ceo: "Naeim Ghorbani",
  company_register: "Amtsgericht Hannover, HRB 224 668",
  company_vat_id: "DE358715877",
};

export function useSiteSettings() {
  return useQuery({
    queryKey: ["site-settings"],
    queryFn: async (): Promise<SiteSettingsMap> => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*");

      if (error) {
        console.error("Error fetching site settings:", error);
        return defaultSettings;
      }

      const settingsMap: SiteSettingsMap = { ...defaultSettings };
      
      (data as SiteSetting[]).forEach((setting) => {
        if (setting.value !== null) {
          settingsMap[setting.key] = setting.value;
        }
      });

      return settingsMap;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}

export function useSiteSettingsAdmin() {
  return useQuery({
    queryKey: ["site-settings-admin"],
    queryFn: async (): Promise<SiteSetting[]> => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .order("category")
        .order("key");

      if (error) {
        throw error;
      }

      return data as SiteSetting[];
    },
  });
}

export function useUpdateSiteSetting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const { error } = await supabase
        .from("site_settings")
        .update({ value })
        .eq("key", key);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-settings"] });
      queryClient.invalidateQueries({ queryKey: ["site-settings-admin"] });
    },
  });
}

// Helper to format phone number for tel: links
export function formatPhoneLink(phone: string): string {
  return `tel:+49${phone.replace(/\D/g, "").replace(/^0/, "")}`;
}
