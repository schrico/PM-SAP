"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useToast } from "@/hooks/use-toast";
import type { ProjectAssignment } from "@/types/project-assignment";

export function useMyProjects(userId: string | null) {
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
    queryKey: ['my-projects', userId],
    queryFn: async (): Promise<{ unclaimed: ProjectAssignment[]; claimed: ProjectAssignment[] }> => {
      if (!userId) {
        return { unclaimed: [], claimed: [] };
      }

      const { data, error } = await supabase
        .from("projects_assignment")
        .select(`
          project_id,
          user_id,
          assignment_status,
          projects (
            id,
            name,
            system,
            words,
            lines,
            initial_deadline,
            interim_deadline,
            final_deadline,
            instructions,
            language_in,
            language_out,
            status
          )
        `)
        .eq("user_id", userId)
        .in("assignment_status", ["unclaimed", "claimed"]);

      if (error) throw error;

      const typedData = data as unknown as ProjectAssignment[];

      const unclaimed = typedData?.filter((p) => p.assignment_status === "unclaimed") || [];
      const claimed = typedData?.filter((p) => p.assignment_status === "claimed") || [];

      return { unclaimed, claimed };
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const unclaimedProjects = projectsData?.unclaimed || [];
  const claimedProjects = projectsData?.claimed || [];

  const updateAssignmentMutation = useMutation({
    mutationFn: async ({
      projectId,
      userId,
      status,
      projectName,
    }: {
      projectId: number;
      userId: string;
      status: "claimed" | "rejected" | "done";
      projectName: string;
    }) => {
      const { error } = await supabase
        .from("projects_assignment")
        .update({ assignment_status: status })
        .eq("project_id", projectId)
        .eq("user_id", userId);

      if (error) throw error;

      return { projectId, status, projectName };
    },
    onSuccess: ({ status, projectName }) => {
      const messages = {
        claimed: `Project "${projectName}" claimed successfully`,
        rejected: `Project "${projectName}" has been rejected`,
        done: `Project "${projectName}" marked as done`,
      };

      toast({
        title: status === "rejected" ? "Project Rejected" : "Success",
        description: messages[status],
      });

      // Invalidate and refetch the projects query
      queryClient.invalidateQueries({ queryKey: ['my-projects', userId] });
    },
    onError: (error: any, { status }) => {
      console.error(`Error updating project status to ${status}:`, error?.message || error);
      toast({
        title: "Error",
        description: `Failed to ${status === "claimed"
          ? "claim"
          : status === "rejected"
          ? "reject"
          : "mark as done"} project`,
        variant: "destructive",
      });
    },
  });

  const claimProject = (projectId: number, projectName: string) => {
    if (!userId) return;
    updateAssignmentMutation.mutate({
      projectId,
      userId,
      status: "claimed",
      projectName,
    });
  };

  const rejectProject = (projectId: number, projectName: string) => {
    if (!userId) return;
    updateAssignmentMutation.mutate({
      projectId,
      userId,
      status: "rejected",
      projectName,
    });
  };

  const markAsDone = (projectId: number, projectName: string) => {
    if (!userId) return;
    updateAssignmentMutation.mutate({
      projectId,
      userId,
      status: "done",
      projectName,
    });
  };

  const refreshProjects = () => {
    queryClient.invalidateQueries({ queryKey: ['my-projects', userId] });
  };

  return {
    unclaimedProjects,
    claimedProjects,
    loading,
    claimProject,
    rejectProject,
    markAsDone,
    refreshProjects,
    isUpdating: updateAssignmentMutation.isPending,
  };
}