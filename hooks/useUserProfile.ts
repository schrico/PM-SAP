"use client";

import { useQuery } from '@tanstack/react-query';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { User } from '@/types/user';

export function useUserProfile() {
  const supabase = createClientComponentClient();

  return useQuery({
    queryKey: ['user-profile'],
    queryFn: async (): Promise<User | null> => {
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData.user) {
        return null;
      }

      const { data: userProfile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userData.user.id)
        .single();

      if (error) {
        throw new Error(`Failed to fetch user profile: ${error.message}`);
      }

      return userProfile;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // Don't retry if user is not authenticated
  });
}
