"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";

/**
 * SAP Step information from the subproject details
 */
export interface SapStep {
  contentId: string;
  serviceStep: string;
  stepText: string;
  slsLang: string;
  sourceLang: string;
  startDate: string;
  endDate: string;
  hasInstructions: boolean;
  volume: SapVolume[];
}

/**
 * SAP Volume information
 */
export interface SapVolume {
  volumeQuantity: number;
  volumeUnit: string;
  activityText: string;
}

/**
 * SAP Environment information
 */
export interface SapEnvironment {
  environmentId: string;
  environmentName: string;
}

/**
 * Full SAP SubProject details response
 */
export interface SapSubProjectDetails {
  subProjectId: string;
  subProjectName: string;
  terminologyKey: string[];
  environment: SapEnvironment[];
  subProjectSteps: SapStep[];
  // Instructions from the separate instructions endpoint
  instructions?: string | null;
  dmName?: string | null;
}

/**
 * Hook to fetch detailed SAP subproject information
 *
 * This fetches the subproject details including steps, volumes, and instructions
 * from the SAP API. Used for import preview.
 *
 * @param projectId - SAP parent project ID
 * @param subProjectId - SAP subproject ID
 */
export function useSapSubProjectDetails(
  projectId: number | null,
  subProjectId: string | null
) {
  return useQuery({
    queryKey: queryKeys.sapSubProject(projectId, subProjectId),
    queryFn: async (): Promise<SapSubProjectDetails> => {
      if (!projectId || !subProjectId) {
        throw new Error("Project ID and SubProject ID are required");
      }

      const response = await fetch(
        `/api/sap/subprojects/${projectId}/${subProjectId}`
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(
          error.message || "Failed to fetch SAP subproject details"
        );
      }

      return response.json();
    },
    enabled: !!projectId && !!subProjectId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}
