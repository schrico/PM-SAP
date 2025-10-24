"use client";

import { useQuery } from '@tanstack/react-query';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Project } from '@/types/project';

export function useProjects() {
  const supabase = createClientComponentClient();

  return useQuery({
    queryKey: ['projects'],
    queryFn: async (): Promise<Project[]> => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch projects: ${error.message}`);
      }

      return data || [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
