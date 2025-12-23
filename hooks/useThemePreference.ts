"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { toast } from "sonner";

export type ThemePreference = "system" | "light" | "dark";

interface UpdateThemeParams {
  userId: string;
  preference: ThemePreference;
}

export function useThemePreference() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables.");
  }

  const supabase = createClientComponentClient({ supabaseUrl, supabaseKey });
  const queryClient = useQueryClient();

  const updateThemeMutation = useMutation({
    mutationFn: async ({ userId, preference }: UpdateThemeParams) => {
      const { error } = await supabase
        .from("users")
        .update({ theme_preference: preference })
        .eq("id", userId);

      if (error) {
        throw new Error(`Failed to update theme preference: ${error.message}`);
      }

      return preference;
    },
    onSuccess: (preference) => {
      // Invalidate user query to refresh theme preference
      queryClient.invalidateQueries({ queryKey: ["user"] });
      
      const label = preference === "system" ? "System" : preference === "light" ? "Light" : "Dark";
      toast.success(`Theme set to ${label}`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return {
    updateTheme: updateThemeMutation.mutate,
    isUpdating: updateThemeMutation.isPending,
  };
}

/**
 * Resolves the actual dark mode state based on preference and system setting
 */
export function resolveTheme(
  preference: ThemePreference,
  systemPrefersDark: boolean
): boolean {
  if (preference === "system") {
    return systemPrefersDark;
  }
  return preference === "dark";
}

