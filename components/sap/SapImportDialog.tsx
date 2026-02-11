"use client";

import { useMemo, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Download,
  RefreshCw,
  CheckCircle2,
  Package,
  Clock,
} from "lucide-react";
import { useSapProjects } from "@/hooks/useSapProjects";
import { useSyncSapProjects } from "@/hooks/useSyncSapProjects";

interface SapImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingSubProjectIds: Set<string>;
}

/**
 * Dialog for importing SAP projects.
 * Shows new/updated project counts and a single "Import All" action.
 */
export function SapImportDialog({
  open,
  onOpenChange,
  existingSubProjectIds,
}: SapImportDialogProps) {
  // Fetch SAP projects
  const {
    data: sapData,
    isLoading: isLoadingProjects,
    error: projectsError,
    refetch: fetchProjects,
    isFetching,
  } = useSapProjects();

  // Sync mutation
  const syncMutation = useSyncSapProjects();

  // Fetch projects when dialog opens
  useEffect(() => {
    if (open) {
      fetchProjects();
    }
  }, [open, fetchProjects]);

  // Calculate new and updated project counts
  const { newCount, updatedCount, allSubProjects } = useMemo(() => {
    if (!sapData?.projects) {
      return { newCount: 0, updatedCount: 0, allSubProjects: [] };
    }

    let newCount = 0;
    let updatedCount = 0;
    const allSubProjects: Array<{
      projectId: number;
      subProjectId: string;
      isNew: boolean;
    }> = [];

    sapData.projects.forEach((project) => {
      project.subProjects.forEach((subProject) => {
        const isNew = !existingSubProjectIds.has(subProject.subProjectId);
        allSubProjects.push({
          projectId: project.projectId,
          subProjectId: subProject.subProjectId,
          isNew,
        });
        if (isNew) {
          newCount++;
        } else {
          updatedCount++;
        }
      });
    });

    return { newCount, updatedCount, allSubProjects };
  }, [sapData, existingSubProjectIds]);

  // Handle import all new and updated
  const handleImportAll = () => {
    if (allSubProjects.length === 0) return;

    syncMutation.mutate(
      allSubProjects.map(({ projectId, subProjectId }) => ({
        projectId,
        subProjectId,
      })),
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  };

  const isLoading = isLoadingProjects || isFetching;
  const isSyncing = syncMutation.isPending;
  const isSyncRateLimited =
    syncMutation.error?.message === "Rate limited";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Import from SAP
          </DialogTitle>
          <DialogDescription>
            Import projects from SAP TPM to your local project management
            system.
          </DialogDescription>
        </DialogHeader>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-3" />
            <p className="text-gray-500 dark:text-gray-400">
              Fetching projects from SAP...
            </p>
          </div>
        )}

        {/* Error State */}
        {projectsError && !isLoading && (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-red-500 font-medium mb-2">
              Failed to fetch SAP projects
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {projectsError.message || "An unexpected error occurred."}
            </p>
            <Button onClick={() => fetchProjects()} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        )}

        {/* Content */}
        {!isLoading && !projectsError && sapData && (
          <div className="space-y-6 py-4">
            {/* Stats */}
            <div className="flex gap-4">
              <div className="flex-1 bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                      {newCount}
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-500">
                      New projects
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex-1 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-3">
                  <RefreshCw className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  <div>
                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                      {updatedCount}
                    </p>
                    <p className="text-sm text-blue-600 dark:text-blue-500">
                      Existing (will update)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sync rate limit warning */}
            {isSyncRateLimited && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                <Clock className="w-5 h-5 text-amber-500 shrink-0" />
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  Import is on cooldown. Check the toast notification for when
                  it will be available again.
                </p>
              </div>
            )}

            {/* Import Action */}
            <Button
              onClick={handleImportAll}
              disabled={isSyncing || isSyncRateLimited || allSubProjects.length === 0}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white"
            >
              {isSyncing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Package className="w-4 h-4 mr-2" />
                  Import All ({allSubProjects.length})
                </>
              )}
            </Button>

            {/* Info */}
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              Importing will create new projects and update existing ones with
              the latest SAP data.
              <br />
              Local-only fields (words, lines, status, assignments) will not be
              overwritten.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
