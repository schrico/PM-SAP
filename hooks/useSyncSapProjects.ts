"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/queryKeys";

/**
 * Request body for syncing SAP projects
 */
export interface SyncSapProjectsRequest {
  projects: Array<{
    projectId: number;
    subProjectId: string;
  }>;
}

/**
 * Response from the sync API
 */
export interface SyncSapProjectsResponse {
  imported: number;
  updated: number;
  failed: number;
  errors?: string[];
}

/**
 * Hook for importing/syncing SAP projects to the local database
 *
 * Features:
 * - Batch import - imports multiple subprojects at once
 * - Invalidates project queries on success
 * - Shows summary toast with import results
 */
export function useSyncSapProjects() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      projects: Array<{ projectId: number; subProjectId: string }>
    ): Promise<SyncSapProjectsResponse> => {
      const response = await fetch("/api/sap/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projects }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || "Failed to import projects from SAP");
      }

      return response.json();
    },
    onSuccess: (data) => {
      // Invalidate all project-related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.projects() });
      queryClient.invalidateQueries({
        queryKey: queryKeys.projectsWithTranslators(),
      });

      // Show summary toast
      if (data.failed === 0) {
        if (data.imported === 0 && data.updated === 0) {
          toast.info("No projects needed to be imported or updated.");
        } else {
          toast.success(
            `Successfully imported ${data.imported} new project(s) and updated ${data.updated} project(s).`
          );
        }
      } else {
        toast.warning(
          `Imported ${data.imported} new, updated ${data.updated}, but ${data.failed} failed.`
        );
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to import projects from SAP");
    },
  });
}
