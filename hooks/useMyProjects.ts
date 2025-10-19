"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useToast } from "@/hooks/use-toast";
import type { ProjectAssignment } from "@/types/project-assignment";

export function useMyProjects(userId: string | null) {
  const supabase = createClientComponentClient();
  const { toast } = useToast();

  const [unclaimedProjects, setUnclaimedProjects] = useState<ProjectAssignment[]>([]);
  const [claimedProjects, setClaimedProjects] = useState<ProjectAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchProjects();
    }
  }, [userId]);

  async function fetchProjects() {
    if (!userId) return;

    setLoading(true);
    try {
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

      setUnclaimedProjects(unclaimed);
      setClaimedProjects(claimed);
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast({
        title: "Error",
        description: "Failed to load projects",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function updateAssignmentStatus(
  projectId: number,
  userId: string,
  status: "claimed" | "rejected" | "done",
  projectName: string
) {
  try {
    const { error } = await supabase
      .from("projects_assignment")
      .update({ assignment_status: status })
      .eq("project_id", projectId)
      .eq("user_id", userId);

    if (error) throw error;

    const messages = {
      claimed: `Project "${projectName}" claimed successfully`,
      rejected: `Project "${projectName}" has been rejected`,
      done: `Project "${projectName}" marked as done`,
    };

    toast({
      title: status === "rejected" ? "Project Rejected" : "Success",
      description: messages[status],
    });

    fetchProjects();
  } catch (error: any) {
    console.error(`Error updating project status to ${status}:`, error?.message || error);
    toast({
      title: "Error",
      description: `Failed to ${status === "claimed"
        ? "claim"
        : status === "rejected"
        ? "reject"
        : "mark as done"} project`,
    });
  }
}


  async function claimProject(projectId: number, projectName: string) {
  if (!userId) return;
  await updateAssignmentStatus(projectId, userId, "claimed", projectName);
}

  async function rejectProject(projectId: number, projectName: string) {
    if (!userId) return;
    await updateAssignmentStatus(projectId, userId, "rejected", projectName);
  }

  async function markAsDone(projectId: number, projectName: string) {
    if (!userId) return;
    await updateAssignmentStatus(projectId, userId, "done", projectName);
  }

  return {
    unclaimedProjects,
    claimedProjects,
    loading,
    claimProject,
    rejectProject,
    markAsDone,
    refreshProjects: fetchProjects,
  };
}