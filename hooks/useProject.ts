"use client";

import { useQuery } from '@tanstack/react-query';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { ProjectWithTranslatorDetails } from '@/types/project';

export function useProject(projectId: number | string | null) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables.");
  }

  const supabase = createClientComponentClient({ supabaseUrl, supabaseKey });

  return useQuery({
    queryKey: ['project', projectId],
    queryFn: async (): Promise<ProjectWithTranslatorDetails> => {
      if (!projectId) throw new Error("Project ID is required");

      // Fetch project
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (projectError) {
        throw new Error(`Failed to fetch project: ${projectError.message}`);
      }

      if (!project) {
        throw new Error("Project not found");
      }

      // Fetch assignments with user data and messages
      const { data: assignments, error: assignmentsError } = await supabase
        .from('projects_assignment')
        .select(`
          project_id,
          assignment_status,
          initial_message,
          refusal_message,
          done_message,
          users (
            id,
            name,
            short_name,
            role,
            avatar
          )
        `)
        .eq('project_id', projectId) as any;

      if (assignmentsError) {
        throw new Error(`Failed to fetch project assignments: ${assignmentsError.message}`);
      }

      // Map assignments to translators
      const translators = (assignments || []).map((assignment: any) => ({
        id: assignment.users?.id || '',
        name: assignment.users?.name || '',
        short_name: assignment.users?.short_name || null,
        role: assignment.users?.role || '',
        assignment_status: assignment.assignment_status || 'unclaimed',
        initial_message: assignment.initial_message || null,
        refusal_message: assignment.refusal_message || null,
        done_message: assignment.done_message || null,
        avatar: assignment.users?.avatar || null,
      })).filter((t: any) => t.id); // Filter out any invalid entries

      return {
        ...project,
        translators,
      };
    },
    enabled: !!projectId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
