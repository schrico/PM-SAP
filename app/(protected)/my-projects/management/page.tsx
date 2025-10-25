"use client";

import { useState } from "react";
import { useUser } from "@/hooks/useUser";
import { useProjectManagement } from "@/hooks/useProjectManagement";
import {
  ManagementNavigationPills,
  type ManagementFilter,
} from "@/components/my-projects/management/ManagementNavigationPills";
import { ProjectManagementCard } from "@/components/my-projects/management/ProjectManagementCard";
import { AddTranslatorDialog } from "@/components/my-projects/management/AddTranslatorDialog";
import { ConfirmationDialog } from "@/components/my-projects/management/ConfirmationDialog";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, AlertCircle } from "lucide-react";

export default function ProjectManagementPage() {
  const { user, loading: userLoading } = useUser();
  const [activeFilter, setActiveFilter] = useState<ManagementFilter>("all");
  const [addTranslatorDialog, setAddTranslatorDialog] = useState<{
    open: boolean;
    projectId: number;
    projectName: string;
  }>({
    open: false,
    projectId: 0,
    projectName: "",
  });
  const [confirmationDialog, setConfirmationDialog] = useState<{
    open: boolean;
    type: "mark-complete" | "remove-translator";
    projectId: number;
    projectName: string;
    translatorId?: string;
    translatorName?: string;
  }>({
    open: false,
    type: "mark-complete",
    projectId: 0,
    projectName: "",
  });

  const {
    allProjects,
    readyForCompletion,
    inProgress,
    toBeClaimed,
    loading,
    error,
    markComplete,
    addTranslator,
    removeTranslator,
    updateAssignmentStatus,
    isMarkingComplete,
    isAddingTranslator,
    isRemovingTranslator,
  } = useProjectManagement(user?.id || null);

  // Check if user has permission (PM or Admin)
  const hasPermission = user?.role === "pm" || user?.role === "admin";

  const getFilteredProjects = () => {
    switch (activeFilter) {
      case "ready":
        return readyForCompletion;
      case "in-progress":
        return inProgress;
      case "to-be-claimed":
        return toBeClaimed;
      default:
        return allProjects;
    }
  };

  const handleMarkComplete = (projectId: number) => {
    const project = allProjects.find((p) => p.project_id === projectId);
    if (project) {
      setConfirmationDialog({
        open: true,
        type: "mark-complete",
        projectId,
        projectName: project.project_name,
      });
    }
  };

  const handleConfirmMarkComplete = () => {
    markComplete(confirmationDialog.projectId);
  };

  const handleAddTranslator = (projectId: number) => {
    const project = allProjects.find((p) => p.project_id === projectId);
    if (project) {
      setAddTranslatorDialog({
        open: true,
        projectId,
        projectName: project.project_name,
      });
    }
  };

  const handleConfirmAddTranslator = (
    projectId: number,
    userId: string,
    roleAssignment: string
  ) => {
    addTranslator({ projectId, userId, roleAssignment });
  };

  const handleRemoveTranslator = (projectId: number, userId: string) => {
    const project = allProjects.find((p) => p.project_id === projectId);
    const translator = project?.translators.find((t) => t.user_id === userId);
    if (project && translator) {
      setConfirmationDialog({
        open: true,
        type: "remove-translator",
        projectId,
        projectName: project.project_name,
        translatorId: userId,
        translatorName: translator.translator_name,
      });
    }
  };

  const handleConfirmRemoveTranslator = () => {
    if (confirmationDialog.translatorId) {
      removeTranslator({
        projectId: confirmationDialog.projectId,
        userId: confirmationDialog.translatorId,
      });
    }
  };

  const handleUpdateStatus = (
    projectId: number,
    userId: string,
    status: "unclaimed" | "claimed" | "done" | "rejected"
  ) => {
    updateAssignmentStatus({ projectId, userId, status });
  };

  const counts = {
    all: allProjects.length,
    ready: readyForCompletion.length,
    inProgress: inProgress.length,
    toBeClaimed: toBeClaimed.length,
  };

  const filteredProjects = getFilteredProjects();

  if (userLoading || loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Loading projects...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!hasPermission) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
              <p className="text-muted-foreground">
                You don't have permission to access project management.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">
                Error Loading Projects
              </h2>
              <p className="text-muted-foreground">
                {error.message || "An error occurred while loading projects."}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Project Management</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Manage your translation projects and translator assignments
          </p>
        </div>

        <ManagementNavigationPills
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          counts={counts}
        />
      </div>

      <div className="space-y-4">
        {filteredProjects.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center min-h-[200px] p-6">
              <div className="text-center">
                <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground text-sm sm:text-base">
                  No projects found for the selected filter.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredProjects.map((project) => (
              <ProjectManagementCard
                key={project.project_id}
                project={project}
                onMarkComplete={handleMarkComplete}
                onAddTranslator={handleAddTranslator}
                onRemoveTranslator={handleRemoveTranslator}
                onUpdateStatus={handleUpdateStatus}
                isCollapsible={
                  activeFilter === "all" || activeFilter === "ready"
                }
                isMarkingComplete={isMarkingComplete}
                showAssignAgain={activeFilter === "ready"}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add Translator Dialog */}
      <AddTranslatorDialog
        open={addTranslatorDialog.open}
        onOpenChange={(open) =>
          setAddTranslatorDialog((prev) => ({ ...prev, open }))
        }
        projectId={addTranslatorDialog.projectId}
        projectName={addTranslatorDialog.projectName}
        onAddTranslator={handleConfirmAddTranslator}
        isAdding={isAddingTranslator}
      />

      {/* Confirmation Dialogs */}
      <ConfirmationDialog
        open={confirmationDialog.open}
        onOpenChange={(open) =>
          setConfirmationDialog((prev) => ({ ...prev, open }))
        }
        title={
          confirmationDialog.type === "mark-complete"
            ? "Mark Project as Complete"
            : "Remove Translator"
        }
        description={
          confirmationDialog.type === "mark-complete"
            ? `Are you sure you want to mark "${confirmationDialog.projectName}" as complete? This action cannot be undone.`
            : `Are you sure you want to remove ${confirmationDialog.translatorName} from "${confirmationDialog.projectName}"?`
        }
        confirmText={
          confirmationDialog.type === "mark-complete"
            ? "Mark Complete"
            : "Remove"
        }
        onConfirm={
          confirmationDialog.type === "mark-complete"
            ? handleConfirmMarkComplete
            : handleConfirmRemoveTranslator
        }
        onCancel={() =>
          setConfirmationDialog((prev) => ({ ...prev, open: false }))
        }
        isLoading={
          confirmationDialog.type === "mark-complete"
            ? isMarkingComplete
            : isRemovingTranslator
        }
        variant={
          confirmationDialog.type === "remove-translator"
            ? "destructive"
            : "default"
        }
      />
    </div>
  );
}
