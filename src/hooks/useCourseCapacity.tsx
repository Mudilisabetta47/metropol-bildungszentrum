import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface CourseDate {
  id: string;
  course_id: string;
  location_id: string;
  start_date: string;
  end_date: string | null;
  start_time: string | null;
  end_time: string | null;
  max_participants: number;
  current_participants: number;
  is_active: boolean;
  notes: string | null;
  courses: {
    id: string;
    title: string;
    slug: string;
  };
  locations: {
    id: string;
    name: string;
    slug: string;
  };
}

interface CourseCapacity {
  courseDateId: string;
  courseTitle: string;
  locationName: string;
  startDate: string;
  maxParticipants: number;
  currentParticipants: number;
  availableSpots: number;
  isFull: boolean;
  percentageFilled: number;
}

export function useCourseCapacity() {
  const [courseDates, setCourseDates] = useState<CourseCapacity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCourseDates = async () => {
    try {
      const { data, error } = await supabase
        .from("course_dates")
        .select(`
          id,
          course_id,
          location_id,
          start_date,
          end_date,
          start_time,
          end_time,
          max_participants,
          current_participants,
          is_active,
          notes,
          courses (id, title, slug),
          locations (id, name, slug)
        `)
        .eq("is_active", true)
        .gte("start_date", new Date().toISOString().split("T")[0])
        .order("start_date", { ascending: true });

      if (error) throw error;

      const capacityData: CourseCapacity[] = (data as unknown as CourseDate[]).map((cd) => ({
        courseDateId: cd.id,
        courseTitle: cd.courses?.title || "",
        locationName: cd.locations?.name || "",
        startDate: cd.start_date,
        maxParticipants: cd.max_participants,
        currentParticipants: cd.current_participants,
        availableSpots: Math.max(0, cd.max_participants - cd.current_participants),
        isFull: cd.current_participants >= cd.max_participants,
        percentageFilled: cd.max_participants > 0 
          ? Math.round((cd.current_participants / cd.max_participants) * 100) 
          : 0,
      }));

      setCourseDates(capacityData);
    } catch (error) {
      console.error("Error fetching course dates:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseDates();

    // Subscribe to realtime changes
    const channel = supabase
      .channel("course_dates_capacity")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "course_dates",
        },
        () => {
          fetchCourseDates();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { courseDates, isLoading, refetch: fetchCourseDates };
}

export function useCourseDateCapacity(courseDateId: string | undefined) {
  const [capacity, setCapacity] = useState<CourseCapacity | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!courseDateId) {
      setIsLoading(false);
      return;
    }

    const fetchCapacity = async () => {
      try {
        const { data, error } = await supabase
          .from("course_dates")
          .select(`
            id,
            max_participants,
            current_participants,
            start_date,
            courses (title),
            locations (name)
          `)
          .eq("id", courseDateId)
          .single();

        if (error) throw error;

        const cd = data as any;
        setCapacity({
          courseDateId: cd.id,
          courseTitle: cd.courses?.title || "",
          locationName: cd.locations?.name || "",
          startDate: cd.start_date,
          maxParticipants: cd.max_participants,
          currentParticipants: cd.current_participants,
          availableSpots: Math.max(0, cd.max_participants - cd.current_participants),
          isFull: cd.current_participants >= cd.max_participants,
          percentageFilled: cd.max_participants > 0 
            ? Math.round((cd.current_participants / cd.max_participants) * 100) 
            : 0,
        });
      } catch (error) {
        console.error("Error fetching capacity:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCapacity();

    // Subscribe to realtime changes
    const channel = supabase
      .channel(`course_date_${courseDateId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "course_dates",
          filter: `id=eq.${courseDateId}`,
        },
        () => {
          fetchCapacity();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [courseDateId]);

  return { capacity, isLoading };
}
