"use client";

import { useQuery } from '@tanstack/react-query';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export function useUser() {
  const supabase = createClientComponentClient();

  const { data: user, isLoading: loading, error } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) {
        return null;
      }

      const { data: profile, error } = await supabase
        .from("users")
        .select("id, name, email, role")
        .eq("id", authUser.id)
        .single();

      if (error) {
        throw new Error(`Failed to fetch user profile: ${error.message}`);
      }

      return profile;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // Don't retry if user is not authenticated
  });

  return { user, loading };
}
