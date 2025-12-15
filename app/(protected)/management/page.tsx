"use client";

import { useState } from "react";
import { useUser } from "@/hooks/useUser";
import { useProjectsWithTranslators } from "@/hooks/useProjectsWithTranslators";
import { ProjectTable } from "@/components/ProjectTable";
import { AddTranslatorDialog } from "@/components/my-projects/management/AddTranslatorDialog";
import { ConfirmationDialog } from "@/components/my-projects/management/ConfirmationDialog";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, AlertCircle } from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";

export default function ProjectManagementPage() {
  const { user, loading: userLoading } = useUser();
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

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables.");
  }

  const supabase = createClientComponentClient({ supabaseUrl, supabaseKey });
  const { toast: toastHook } = useToast();
  const queryClient = useQueryClient();

  const {
    data: allProjects = [],
    isLoading: projectsLoading,
    error: projectsError,
  } = useProjectsWithTranslators(false, true);

  // Filter projects: final_deadline < now() AND status != "complete"
  const now = new Date();
  const projects = allProjects.filter((project) => {
    if (project.status === "complete") return false;
    if (!project.final_deadline) return false;
    const finalDeadline = new Date(project.final_deadline);
    return finalDeadline.getTime() < now.getTime();
  });

  // Check if user has permission (PM or Admin)
  const hasPermission = user?.role === "pm" || user?.role === "admin";

  // Mark project as complete mutation
  const markCompleteMutation = useMutation({
    mutationFn: async (projectId: number) => {
      const { error } = await supabase
        .from("projects")
        .update({ status: "complete" })
        .eq("id", projectId);

      if (error) {
        throw new Error(`Failed to mark project as complete: ${error.message}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["projects-with-translators"],
      });
      toast.success("Project marked as complete");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Add translator mutation
  const addTranslatorMutation = useMutation({
    mutationFn: async ({
      projectId,
      userId,
    }: {
      projectId: number;
      userId: string;
    }) => {
      const { error } = await supabase.from("projects_assignment").insert({
        project_id: projectId,
        user_id: userId,
        assignment_status: "unclaimed",
      });

      if (error) {
        throw new Error(`Failed to add translator: ${error.message}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["projects-with-translators"],
      });
      toast.success("Translator added successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Remove translator mutation
  const removeTranslatorMutation = useMutation({
    mutationFn: async ({
      projectId,
      userId,
    }: {
      projectId: number;
      userId: string;
    }) => {
      const { error } = await supabase
        .from("projects_assignment")
        .delete()
        .eq("project_id", projectId)
        .eq("user_id", userId);

      if (error) {
        throw new Error(`Failed to remove translator: ${error.message}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["projects-with-translators"],
      });
      toast.success("Translator removed successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleMarkComplete = (projectId: number) => {
    const project = projects.find((p) => p.id === projectId);
    if (project) {
      setConfirmationDialog({
        open: true,
        type: "mark-complete",
        projectId,
        projectName: project.name,
      });
    }
  };

  const handleConfirmMarkComplete = () => {
    markCompleteMutation.mutate(confirmationDialog.projectId);
    setConfirmationDialog((prev) => ({ ...prev, open: false }));
  };

  const handleAddTranslator = (projectId: number) => {
    const project = projects.find((p) => p.id === projectId);
    if (project) {
      setAddTranslatorDialog({
        open: true,
        projectId,
        projectName: project.name,
      });
    }
  };

  const handleConfirmAddTranslator = (projectId: number, userId: string) => {
    addTranslatorMutation.mutate({ projectId, userId });
    setAddTranslatorDialog((prev) => ({ ...prev, open: false }));
  };

  const handleRemoveTranslator = (projectId: number, userId: string) => {
    const project = projects.find((p) => p.id === projectId);
    const translator = project?.translators.find((t) => t.id === userId);
    if (project && translator) {
      setConfirmationDialog({
        open: true,
        type: "remove-translator",
        projectId,
        projectName: project.name,
        translatorId: userId,
        translatorName: translator.name,
      });
    }
  };

  const handleConfirmRemoveTranslator = () => {
    if (confirmationDialog.translatorId) {
      removeTranslatorMutation.mutate({
        projectId: confirmationDialog.projectId,
        userId: confirmationDialog.translatorId,
      });
      setConfirmationDialog((prev) => ({ ...prev, open: false }));
    }
  };

  if (userLoading || projectsLoading) {
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

  if (projectsError) {
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
                {projectsError.message ||
                  "An error occurred while loading projects."}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <main className="flex flex-col flex-1 overflow-hidden bg-background">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-background border-b shadow-sm">
        <div className="max-w-8xl mx-auto flex items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Project Management
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage your translation projects and translator assignments
            </p>
          </div>
        </div>
      </div>

      {/* Project Table */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-10 py-6">
        <ProjectTable showPast={false} />
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
        isAdding={addTranslatorMutation.isPending}
      />

      {/* Confirmation Dialogs */}
      <ConfirmationDialog
        open={confirmationDialog.open}
        onOpenChange={(open) =>
          setConfirmationDialog((prev) => ({ ...prev, open }))
        }
        title={
          confirmationDialog.type === "mark-complete" ?
            "Mark Project as Complete"
          : "Remove Translator"
        }
        description={
          confirmationDialog.type === "mark-complete" ?
            `Are you sure you want to mark "${confirmationDialog.projectName}" as complete? This action cannot be undone.`
          : `Are you sure you want to remove ${confirmationDialog.translatorName} from "${confirmationDialog.projectName}"?`
        }
        confirmText={
          confirmationDialog.type === "mark-complete" ?
            "Mark Complete"
          : "Remove"
        }
        onConfirm={
          confirmationDialog.type === "mark-complete" ?
            handleConfirmMarkComplete
          : handleConfirmRemoveTranslator
        }
        onCancel={() =>
          setConfirmationDialog((prev) => ({ ...prev, open: false }))
        }
        isLoading={
          confirmationDialog.type === "mark-complete" ?
            markCompleteMutation.isPending
          : removeTranslatorMutation.isPending
        }
        variant={
          confirmationDialog.type === "remove-translator" ?
            "destructive"
          : "default"
        }
      />
    </main>
  );
}
