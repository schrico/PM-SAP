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
 * Rate limit error response
 */
interface RateLimitError {
  error: "rate_limited";
  waitMinutes: number;
}

/**
 * Hook to fetch SAP projects from the API
 *
 * Features:
 * - Handles rate limiting (5-minute cooldown per user)
 * - Shows toast notifications for success/errors
 * - Caches data for 5 minutes to match rate limit
 */
export function useSapProjects() {
  return useQuery({
    queryKey: queryKeys.sapProjects(),
    queryFn: async (): Promise<SapProjectsResponse> => {
      const response = await fetch("/api/sap/projects");
      const data = await response.json();

      // Handle rate limit response
      if (data.error === "rate_limited") {
        const rateLimitData = data as RateLimitError;
        toast.info(
          `SAP data was fetched less than 5 minutes ago.\nPlease wait ${rateLimitData.waitMinutes} minute(s) before fetching again.`
        );
        throw new Error("Rate limited");
      }

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch SAP projects");
      }

      toast.success("SAP projects loaded successfully");
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes (matches rate limit)
    retry: false, // Don't retry rate-limited requests
    enabled: false, // Manual fetch - user triggers via refetch
  });
}
