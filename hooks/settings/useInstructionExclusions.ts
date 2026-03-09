"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from '@/hooks/core/useSupabase';
import { toast } from "sonner";
import { queryKeys } from "@/lib/queryKeys";
import {
  normalizeInstructionText,
  normalizeInstructionTextForMatch,
} from "@/lib/sap/instruction-normalization";

interface InstructionExclusion {
  id: number | string;
  instruction_text: string;
  created_at: string;
}

export function useInstructionExclusions(userId: string | null) {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  const queryKey = queryKeys.instructionExclusions(userId);

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

      return (data || []).map((row: InstructionExclusion) => ({
        ...row,
        instruction_text: normalizeInstructionText(row.instruction_text),
      }));
    },
    enabled: !!userId,
  });

  const addMutation = useMutation({
    mutationFn: async (text: string) => {
      if (!userId) throw new Error("User ID required");

      const normalizedText = normalizeInstructionText(text);
      if (!normalizedText) throw new Error("Empty exclusion");

      const normalizedMatch = normalizeInstructionTextForMatch(normalizedText);
      const duplicateExists = exclusions.some(
        (exclusion) =>
          normalizeInstructionTextForMatch(exclusion.instruction_text) ===
          normalizedMatch
      );

      if (duplicateExists) {
        throw new Error("duplicate_exclusion");
      }

      const { error } = await supabase
        .from("instruction_exclusions")
        .insert({ instruction_text: normalizedText, user_id: userId });

      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success("Exclusion added");
    },
    onError: (error: Error) => {
      if (error.message.includes("duplicate") || error.message.includes("duplicate_exclusion")) {
        toast.error("This instruction is already excluded");
      } else if (error.message.includes("Empty exclusion")) {
        toast.error("Please paste a valid instruction text");
      } else {
        toast.error("Failed to add exclusion");
      }
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (id: number | string) => {
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
    removeExclusion: (id: number | string) => removeMutation.mutate(id),
    isAdding: addMutation.isPending,
    isRemoving: removeMutation.isPending,
  };
}
