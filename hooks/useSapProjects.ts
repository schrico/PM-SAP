"use client";

import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/lib/queryKeys";

/**
 * SAP Project from the SAP API
 */
export interface SapProject {
  projectId: number;
  projectName: string;
  account: string;
  subProjects: SapSubProject[];
}

/**
 * SAP SubProject from the SAP API
 */
export interface SapSubProject {
  subProjectId: string;
  subProjectName: string;
  dmName: string;
  pmName: string;
  projectType: string;
}

/**
 * Response from the SAP projects API
 */
interface SapProjectsResponse {
  projects: SapProject[];
}

/**
 * Hook to fetch SAP projects from the API.
 * This only fetches the project list — no rate limit on fetching.
 * Rate limiting is enforced on the import/sync endpoint instead.
 */
export function useSapProjects() {
  return useQuery({
    queryKey: queryKeys.sapProjects(),
    queryFn: async (): Promise<SapProjectsResponse> => {
      const response = await fetch("/api/sap/projects");
      const data = await response.json();

      if (!response.ok) {
        const errorMessage =
          data.error || data.message || "Failed to fetch SAP projects";
        toast.error(`SAP Error: ${errorMessage}`);
        throw new Error(errorMessage);
      }

      return data;
    },
    retry: false,
    enabled: false, // Manual fetch - user triggers via refetch
  });
}
