"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";

export interface SapImportStatusResponse {
  status: "idle" | "running" | "failed";
  startedAt: string | null;
  finishedAt: string | null;
  startedBy: string | null;
}

interface UseSapImportStatusOptions {
  enabled?: boolean;
  refetchInterval?: number | false;
}

export function useSapImportStatus(options: UseSapImportStatusOptions = {}) {
  const { enabled = true, refetchInterval = false } = options;

  return useQuery({
    queryKey: queryKeys.sapImportStatus(),
    queryFn: async (): Promise<SapImportStatusResponse> => {
      const response = await fetch("/api/sap/import-status");
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const message =
          data?.error || data?.message || "Failed to fetch SAP import status";
        throw new Error(message);
      }

      return data;
    },
    enabled,
    refetchInterval,
  });
}
