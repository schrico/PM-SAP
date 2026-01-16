"use client";

import { useState, useMemo, useEffect } from "react";
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
  List,
  Package,
} from "lucide-react";
import { useSapProjects } from "@/hooks/useSapProjects";
import { useSyncSapProjects } from "@/hooks/useSyncSapProjects";
import {
  SapProjectList,
  type SapSubProjectSelection,
} from "./SapProjectList";
import { SapImportPreview } from "./SapImportPreview";

interface SapImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  existingSubProjectIds: Set<string>;
}

type ViewMode = "summary" | "custom";

/**
 * Main dialog for importing SAP projects
 *
 * Provides two modes:
 * - Summary mode: Quick import of all new/updated projects
 * - Custom mode: Select specific subprojects to import
 */
export function SapImportDialog({
  open,
  onOpenChange,
  existingSubProjectIds,
}: SapImportDialogProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("summary");
  const [selectedSubProjects, setSelectedSubProjects] = useState<
    SapSubProjectSelection[]
  >([]);
  const [previewSelection, setPreviewSelection] =
    useState<SapSubProjectSelection | null>(null);

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

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setViewMode("summary");
      setSelectedSubProjects([]);
      setPreviewSelection(null);
    }
  }, [open]);

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

  // Handle import from single project
  const handleImportProject = (projectId: number) => {
    const project = sapData?.projects.find((p) => p.projectId === projectId);
    if (!project) return;

    syncMutation.mutate(
      project.subProjects.map((sub) => ({
        projectId,
        subProjectId: sub.subProjectId,
      })),
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  };

  // Handle import selected
  const handleImportSelected = () => {
    if (selectedSubProjects.length === 0) return;

    syncMutation.mutate(
      selectedSubProjects.map(({ projectId, subProjectId }) => ({
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

  // Update preview when selection changes
  const handleSelectionChange = (selections: SapSubProjectSelection[]) => {
    setSelectedSubProjects(selections);
    // Set the last selected item as preview
    if (selections.length > 0) {
      setPreviewSelection(selections[selections.length - 1]);
    } else {
      setPreviewSelection(null);
    }
  };

  const isLoading = isLoadingProjects || isFetching;
  const isSyncing = syncMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
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
            <p className="text-red-500 mb-4">Failed to fetch SAP projects</p>
            <Button onClick={() => fetchProjects()} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        )}

        {/* Content */}
        {!isLoading && !projectsError && sapData && (
          <>
            {/* Summary Mode */}
            {viewMode === "summary" && (
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

                {/* Actions */}
                <div className="flex gap-3">
                  <Button
                    onClick={handleImportAll}
                    disabled={isSyncing || allSubProjects.length === 0}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    {isSyncing ?
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Importing...
                      </>
                    : <>
                        <Package className="w-4 h-4 mr-2" />
                        Import All ({allSubProjects.length})
                      </>
                    }
                  </Button>
                  <Button
                    onClick={() => setViewMode("custom")}
                    variant="outline"
                    disabled={isSyncing}
                  >
                    <List className="w-4 h-4 mr-2" />
                    Custom Selection
                  </Button>
                </div>

                {/* Info */}
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  Importing will create new projects and update existing ones
                  with the latest SAP data.
                  <br />
                  Local-only fields (words, lines, status, assignments) will not
                  be overwritten.
                </p>
              </div>
            )}

            {/* Custom Selection Mode */}
            {viewMode === "custom" && (
              <div className="flex-1 flex gap-4 min-h-0 overflow-hidden">
                {/* Project List */}
                <div className="flex-1 overflow-y-auto">
                  <div className="flex items-center justify-between mb-3">
                    <Button
                      onClick={() => setViewMode("summary")}
                      variant="ghost"
                      size="sm"
                    >
                      Back to Summary
                    </Button>
                    {selectedSubProjects.length > 0 && (
                      <Button
                        onClick={handleImportSelected}
                        disabled={isSyncing}
                        size="sm"
                        className="bg-blue-500 hover:bg-blue-600 text-white"
                      >
                        {isSyncing ?
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Importing...
                          </>
                        : <>Import Selected ({selectedSubProjects.length})</>}
                      </Button>
                    )}
                  </div>
                  <SapProjectList
                    projects={sapData.projects}
                    existingSubProjectIds={existingSubProjectIds}
                    selectedSubProjects={selectedSubProjects}
                    onSelectionChange={handleSelectionChange}
                    onImportProject={handleImportProject}
                  />
                </div>

                {/* Preview Panel */}
                <div className="w-80 border-l border-gray-200 dark:border-gray-700 pl-4 overflow-y-auto">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Preview
                  </h3>
                  <SapImportPreview selection={previewSelection} />
                </div>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
