import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ServiceCategory {
  id: string;
  name: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface ServiceItem {
  id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  unit: string;
  unit_price: number;
  is_active: boolean;
  sort_order: number;
}

export function useServiceCategories(onlyActive = false) {
  return useQuery({
    queryKey: ["service-catalog-categories", onlyActive],
    queryFn: async () => {
      let q = supabase
        .from("service_catalog_categories")
        .select("*")
        .order("sort_order")
        .order("name");
      if (onlyActive) q = q.eq("is_active", true);
      const { data, error } = await q;
      if (error) throw error;
      return data as ServiceCategory[];
    },
  });
}

export function useServiceItems(onlyActive = false) {
  return useQuery({
    queryKey: ["service-catalog-items", onlyActive],
    queryFn: async () => {
      let q = supabase
        .from("service_catalog_items")
        .select("*")
        .order("sort_order")
        .order("name");
      if (onlyActive) q = q.eq("is_active", true);
      const { data, error } = await q;
      if (error) throw error;
      return data as ServiceItem[];
    },
  });
}

export function useSaveCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (cat: Partial<ServiceCategory> & { name: string }) => {
      if (cat.id) {
        const { error } = await supabase
          .from("service_catalog_categories")
          .update(cat)
          .eq("id", cat.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("service_catalog_categories")
          .insert(cat);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["service-catalog-categories"] }),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("service_catalog_categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["service-catalog-categories"] }),
  });
}

export function useSaveServiceItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (item: Partial<ServiceItem> & { name: string }) => {
      if (item.id) {
        const { error } = await supabase
          .from("service_catalog_items")
          .update(item)
          .eq("id", item.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("service_catalog_items")
          .insert(item);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["service-catalog-items"] }),
  });
}

export function useDeleteServiceItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("service_catalog_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["service-catalog-items"] }),
  });
}
