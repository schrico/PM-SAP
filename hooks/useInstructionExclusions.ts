"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./useSupabase";
import { toast } from "sonner";

interface InstructionExclusion {
  id: number;
  instruction_text: string;
  created_at: string;
}

export function useInstructionExclusions(userId: string | null) {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  const queryKey = ["instruction-exclusions", userId];

  const { data: exclusions = [], isLoading } = useQuery({
    queryKey,
    queryFn: async (): Promise<InstructionExclusion[]> => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from("instruction_exclusions")
        .select("id, instruction_text, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw new Error(error.message);
      return data || [];
    },
    enabled: !!userId,
  });

  const addMutation = useMutation({
    mutationFn: async (text: string) => {
      if (!userId) throw new Error("User ID required");

      const { error } = await supabase
        .from("instruction_exclusions")
        .insert({ instruction_text: text.trim(), user_id: userId });

      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success("Exclusion added");
    },
    onError: (error: Error) => {
      if (error.message.includes("duplicate")) {
        toast.error("This instruction is already excluded");
      } else {
        toast.error("Failed to add exclusion");
      }
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from("instruction_exclusions")
        .delete()
        .eq("id", id);

      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success("Exclusion removed");
    },
    onError: () => {
      toast.error("Failed to remove exclusion");
    },
  });

  return {
    exclusions,
    isLoading,
    addExclusion: (text: string) => addMutation.mutate(text),
    removeExclusion: (id: number) => removeMutation.mutate(id),
    isAdding: addMutation.isPending,
    isRemoving: removeMutation.isPending,
  };
}
