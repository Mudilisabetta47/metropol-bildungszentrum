import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Course {
  id: string;
  title: string;
  slug: string;
  category: string;
  description: string | null;
  duration_info: string | null;
  price_info: string | null;
  requirements: string | null;
  benefits: string[] | null;
  image_url: string | null;
  is_active: boolean;
}

export function useCourses() {
  return useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as Course[];
    },
  });
}

export function useCourse(slug: string) {
  return useQuery({
    queryKey: ["course", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("slug", slug)
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw error;
      return data as Course | null;
    },
    enabled: !!slug,
  });
}

// Fetch courses that have at least one course_date at a specific location
export function useCoursesByLocation(locationId: string | undefined) {
  return useQuery({
    queryKey: ["courses-by-location", locationId],
    queryFn: async () => {
      // Get distinct course IDs that have active course_dates at this location
      const { data: courseDates, error: datesError } = await supabase
        .from("course_dates")
        .select("course_id")
        .eq("location_id", locationId!)
        .eq("is_active", true);

      if (datesError) throw datesError;

      const courseIds = [...new Set((courseDates || []).map(cd => cd.course_id))];
      if (courseIds.length === 0) return [] as Course[];

      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("is_active", true)
        .in("id", courseIds)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as Course[];
    },
    enabled: !!locationId,
  });
}
