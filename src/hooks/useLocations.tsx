import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Location {
  id: string;
  name: string;
  slug: string;
  address: string;
  zip_city: string;
  phone: string | null;
  email: string | null;
  opening_hours: string | null;
  map_url: string | null;
  is_active: boolean;
}

// Fetch all active locations
export function useLocations() {
  return useQuery({
    queryKey: ["locations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("locations")
        .select("*")
        .eq("is_active", true);

      if (error) throw error;
      
      // Custom sort order: Hannover, Garbsen, Bremen
      const sortOrder: Record<string, number> = { hannover: 0, garbsen: 1, bremen: 2 };
      return ((data || []) as Location[]).sort(
        (a, b) => (sortOrder[a.slug] ?? 99) - (sortOrder[b.slug] ?? 99)
      );
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Fetch a single location by slug
export function useLocation(slug: string) {
  return useQuery({
    queryKey: ["location", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("locations")
        .select("*")
        .eq("slug", slug)
        .eq("is_active", true)
        .single();

      if (error) {
        if (error.code === "PGRST116") return null; // Not found
        throw error;
      }
      return data as Location;
    },
    enabled: !!slug,
  });
}
