"use client";

import { useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from '@/hooks/core/useSupabase';
import { toast } from "sonner";
import { queryKeys } from "@/lib/queryKeys";

interface DefaultFilter {
  id: number;
  filter_key: string;
  included_values: string[] | null;
  excluded_values: string[] | null;
  updated_at: string;
}

export function useDefaultFilters(userId: string | null) {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  const queryKey = queryKeys.defaultFilters(userId);

  const { data: filters = [], isLoading } = useQuery({
    queryKey,
    queryFn: async (): Promise<DefaultFilter[]> => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from("default_filters")
        .select("*")
        .eq("user_id", userId);

      if (error) throw new Error(error.message);
      return data || [];
    },
    enabled: !!userId,
  });

  const upsertMutation = useMutation({
    mutationFn: async ({
      filterKey,
      includedValues,
      excludedValues,
    }: {
      filterKey: string;
      includedValues: string[] | null;
      excludedValues: string[] | null;
    }) => {
      if (!userId) throw new Error("User ID required");

      const { error } = await supabase
        .from("default_filters")
        .upsert(
          {
            filter_key: filterKey,
            user_id: userId,
            included_values: includedValues,
            excluded_values: excludedValues,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "filter_key,user_id" }
        );

      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success("Default filter saved");
    },
    onError: () => {
      toast.error("Failed to save default filter");
    },
  });

  const getFilter = useCallback(
    (key: string): DefaultFilter | undefined => {
      return filters.find((f) => f.filter_key === key);
    },
    [filters]
  );

  return {
    filters,
    isLoading,
    getFilter,
    upsertFilter: upsertMutation.mutate,
    isUpdating: upsertMutation.isPending,
  };
}
