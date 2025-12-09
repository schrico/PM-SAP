"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useToast } from "@/hooks/use-toast";

export interface ProjectManagementView {
  project_id: number;
  project_name: string;
  system: string;
  language_in: string | null;
  language_out: string | null;
  initial_deadline: string | null;
  interim_deadline: string | null;
  final_deadline: string | null;
  project_status: "complete" | "active" | "cancelled";
  pm_id: string | null;
  user_id: string;
  translator_name: string;
  assignment_status: "unclaimed" | "claimed" | "done" | "rejected";
}

export interface GroupedProject {
  project_id: number;
  project_name: string;
  system: string;
  language_in: string | null;
  language_out: string | null;
  initial_deadline: string | null;
  interim_deadline: string | null;
  final_deadline: string | null;
  project_status: "complete" | "active" | "cancelled";
  pm_id: string | null;
  translators: Array<{
    user_id: string;
    translator_name: string;
    assignment_status: "unclaimed" | "claimed" | "done" | "rejected";
  }>;
}

export function useProjectManagement(userId: string | null) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables.");
  }

  const supabase = createClientComponentClient({ supabaseUrl, supabaseKey });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: projectsData,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ['project-management', userId],
    queryFn: async (): Promise<GroupedProject[]> => {
      if (!userId) {
        return [];
      }

      // Get projects where user is PM or Admin
      const { data, error } = await supabase
        .from("project_management_view")
        .select("*")
        .eq("pm_id", userId);

      if (error) {
        throw new Error(`Failed to fetch project management data: ${error.message}`);
      }

      // Group by project_id and filter out complete projects
      const groupedProjects = (data || []).reduce((acc: Record<number, GroupedProject>, row: ProjectManagementView) => {
        const projectId = row.project_id;
        
        // Skip complete projects
        if (row.project_status === 'complete') {
          return acc;
        }
        
        if (!acc[projectId]) {
          acc[projectId] = {
            project_id: row.project_id,
            project_name: row.project_name,
            system: row.system,
            language_in: row.language_in,
            language_out: row.language_out,
            initial_deadline: row.initial_deadline,
            interim_deadline: row.interim_deadline,
            final_deadline: row.final_deadline,
            project_status: row.project_status,
            pm_id: row.pm_id,
            translators: []
          };
        }

        // Add translator if not already added
        const translatorExists = acc[projectId].translators.some(t => t.user_id === row.user_id);
        if (!translatorExists) {
          acc[projectId].translators.push({
            user_id: row.user_id,
            translator_name: row.translator_name,
            assignment_status: row.assignment_status
          });
        }

        return acc;
      }, {});

      return Object.values(groupedProjects);
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Filter projects based on status
  const allProjects = projectsData || [];
  const readyForCompletion = allProjects.filter(project => 
    project.translators.length > 0 && 
    project.translators.every(t => t.assignment_status === 'done')
  );
  const inProgress = allProjects.filter(project => 
    project.translators.length > 0 && 
    project.translators.some(t => t.assignment_status === 'claimed') &&
    project.translators.some(t => t.assignment_status !== 'done')
  );
  const toBeClaimed = allProjects.filter(project => 
    project.translators.some(t => t.assignment_status === 'unclaimed')
  );

  // Mark project as complete mutation
  const markCompleteMutation = useMutation({
    mutationFn: async (projectId: number) => {
      const { error } = await supabase
        .from('projects')
        .update({ status: 'complete' })
        .eq('id', projectId);

      if (error) {
        throw new Error(`Failed to mark project as complete: ${error.message}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-management'] });
      toast({
        title: "Success",
        description: "Project marked as complete",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Add translator mutation
  const addTranslatorMutation = useMutation({
    mutationFn: async ({ projectId, userId, roleAssignment }: { 
      projectId: number; 
      userId: string; 
      roleAssignment: string;
    }) => {
      const { error } = await supabase
        .from('projects_assignment')
        .insert({
          project_id: projectId,
          user_id: userId,
          role_assignment: roleAssignment,
          assignment_status: 'unclaimed'
        });

      if (error) {
        throw new Error(`Failed to add translator: ${error.message}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-management'] });
      toast({
        title: "Success",
        description: "Translator added successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Remove translator mutation
  const removeTranslatorMutation = useMutation({
    mutationFn: async ({ projectId, userId }: { projectId: number; userId: string }) => {
      const { error } = await supabase
        .from('projects_assignment')
        .delete()
        .eq('project_id', projectId)
        .eq('user_id', userId);

      if (error) {
        throw new Error(`Failed to remove translator: ${error.message}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-management'] });
      toast({
        title: "Success",
        description: "Translator removed successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update assignment status mutation
  const updateAssignmentStatusMutation = useMutation({
    mutationFn: async ({ 
      projectId, 
      userId, 
      status 
    }: { 
      projectId: number; 
      userId: string; 
      status: "unclaimed" | "claimed" | "done" | "rejected";
    }) => {
      const { error } = await supabase
        .from('projects_assignment')
        .update({ assignment_status: status })
        .eq('project_id', projectId)
        .eq('user_id', userId);

      if (error) {
        throw new Error(`Failed to update assignment status: ${error.message}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-management'] });
      toast({
        title: "Success",
        description: "Assignment status updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    allProjects,
    readyForCompletion,
    inProgress,
    toBeClaimed,
    loading,
    error,
    markComplete: markCompleteMutation.mutate,
    addTranslator: addTranslatorMutation.mutate,
    removeTranslator: removeTranslatorMutation.mutate,
    updateAssignmentStatus: updateAssignmentStatusMutation.mutate,
    isMarkingComplete: markCompleteMutation.isPending,
    isAddingTranslator: addTranslatorMutation.isPending,
    isRemovingTranslator: removeTranslatorMutation.isPending,
    isUpdatingStatus: updateAssignmentStatusMutation.isPending,
  };
}
