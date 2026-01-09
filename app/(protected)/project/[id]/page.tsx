"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Edit, Loader2, Check, X, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useProject } from "@/hooks/useProject";
import { useColorSettings } from "@/hooks/useColorSettings";
import { useRoleAccess } from "@/hooks/useRoleAccess";
import { ProjectDetailsCard } from "@/components/project/ProjectDetailsCard";
import { ProjectInstructionsCard } from "@/components/project/ProjectInstructionsCard";
import { TranslatorsList } from "@/components/project/TranslatorsList";
import { AddTranslatorModal } from "@/components/management/AddTranslatorModal";
import { ReminderModal } from "@/components/project/ReminderModal";
import { RefusalDialog } from "@/components/my-projects/RefusalDialog";
import { DoneDialog } from "@/components/my-projects/DoneDialog";
import { InitialMessageDialog } from "@/components/my-projects/InitialMessageDialog";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { toast } from "sonner";
import { getUserFriendlyError } from "@/utils/toastHelpers";

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const projectId = params.id ? Number(params.id) : null;

  const { data: project, isLoading, error } = useProject(projectId);
  const { getSystemColorPreview } = useColorSettings();
  const {
    user,
    loading: userLoading,
    isTranslator,
    canManageAssignments,
  } = useRoleAccess();

  const [showAddTranslatorModal, setShowAddTranslatorModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState<{
    open: boolean;
    userId: string;
    userName: string;
  }>({ open: false, userId: "", userName: "" });

  // Translator action dialogs
  const [refusalDialog, setRefusalDialog] = useState<{
    open: boolean;
    projectId: number | null;
    projectName: string;
  }>({ open: false, projectId: null, projectName: "" });
  const [doneDialog, setDoneDialog] = useState<{
    open: boolean;
    projectId: number | null;
    projectName: string;
  }>({ open: false, projectId: null, projectName: "" });
  const [initialMessageDialog, setInitialMessageDialog] = useState<{
    open: boolean;
    projectId: number | null;
    projectName: string;
    message: string;
  }>({ open: false, projectId: null, projectName: "", message: "" });

  const hasRedirected = useRef(false);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables.");
  }

  const supabase = createClientComponentClient({ supabaseUrl, supabaseKey });

  // Check if translator is assigned to this project
  const translatorAssignment =
    isTranslator() && project ?
      project.translators.find((t) => t.id === user?.id)
    : null;

  const isTranslatorAssigned = !!translatorAssignment;

  // Redirect translator if not assigned to this project
  useEffect(() => {
    if (
      !isLoading &&
      !userLoading &&
      project &&
      isTranslator() &&
      !isTranslatorAssigned &&
      !hasRedirected.current
    ) {
      hasRedirected.current = true;
      router.back();
    }
  }, [
    isLoading,
    userLoading,
    project,
    isTranslator,
    isTranslatorAssigned,
    router,
  ]);

  // Add translators mutation (PM/Admin only)
  const addTranslatorsMutation = useMutation({
    mutationFn: async ({
      projectId,
      userIds,
      messages,
    }: {
      projectId: number;
      userIds: string[];
      messages: Record<string, string>;
    }) => {
      const assignments = userIds.map((userId) => ({
        project_id: projectId,
        user_id: userId,
        assignment_status: userId === user?.id ? "claimed" : "unclaimed", // Auto-claim if self-assigning
        initial_message: messages[userId] || null,
      }));

      const { error } = await supabase
        .from("projects_assignment")
        .insert(assignments);

      if (error) throw new Error(`Failed to add translators: ${error.message}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      toast.success("Translators added successfully");
      setShowAddTranslatorModal(false);
    },
    onError: (error: Error) => {
      toast.error(getUserFriendlyError(error, "translator management"));
    },
  });

  // Remove translator mutation (PM/Admin only)
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
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      toast.success("Translator removed successfully");
    },
    onError: (error: Error) => {
      toast.error(getUserFriendlyError(error, "translator management"));
    },
  });

  // Send reminder mutation (PM/Admin only)
  const sendReminderMutation = useMutation({
    mutationFn: async ({
      projectId,
      userId,
      message,
    }: {
      projectId: number;
      userId: string;
      message?: string;
    }) => {
      const { error } = await supabase
        .from("projects_assignment")
        .update({
          initial_message:
            message || "This is a reminder about your project assignment.",
        })
        .eq("project_id", projectId)
        .eq("user_id", userId);

      if (error) {
        throw new Error(`Failed to send reminder: ${error.message}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      toast.success("Reminder sent successfully");
      setShowReminderModal({ open: false, userId: "", userName: "" });
    },
    onError: (error: Error) => {
      toast.error(getUserFriendlyError(error, "translator management"));
    },
  });

  // Translator assignment status mutation (claim/reject/done)
  const updateAssignmentMutation = useMutation({
    mutationFn: async ({
      projectId,
      userId,
      status,
      message,
    }: {
      projectId: number;
      userId: string;
      status: "claimed" | "rejected" | "done";
      message?: string | null;
    }) => {
      const updateData: {
        assignment_status: string;
        refusal_message?: string | null;
        done_message?: string | null;
      } = { assignment_status: status };

      if (status === "rejected" && message) {
        updateData.refusal_message = message;
      }
      if (status === "done" && message) {
        updateData.done_message = message;
      }

      const { error } = await supabase
        .from("projects_assignment")
        .update(updateData)
        .eq("project_id", projectId)
        .eq("user_id", userId);

      if (error) throw error;

      return { projectId, status };
    },
    onSuccess: ({ status }) => {
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      queryClient.invalidateQueries({ queryKey: ["my-projects", user?.id] });

      const messages = {
        claimed: "Project claimed successfully",
        rejected: "Project has been rejected",
        done: "Project marked as done",
      };

      toast.success(messages[status]);
    },
    onError: (error: Error, { status }) => {
      toast.error(
        `Failed to ${
          status === "claimed" ? "claim"
          : status === "rejected" ? "reject"
          : "mark as done"
        } project`
      );
    },
  });

  // Mark complete mutation (PM/Admin only)
  const markCompleteMutation = useMutation({
    mutationFn: async () => {
      if (!projectId) throw new Error("Project ID is required");
      const { error } = await supabase
        .from("projects")
        .update({ status: "complete" })
        .eq("id", projectId);

      if (error)
        throw new Error(`Failed to mark project as complete: ${error.message}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      toast.success("Project marked as complete");
    },
    onError: (error: Error) => {
      toast.error(getUserFriendlyError(error, "project management"));
    },
  });

  // PM/Admin handlers
  const handleEdit = () => {
    router.push(`/project/${projectId}/edit`);
  };

  const handleDuplicate = () => {
    if (!projectId) return;
    router.push(`/new-project?duplicateFrom=${projectId}`);
  };

  const handleAddTranslator = () => {
    setShowAddTranslatorModal(true);
  };

  const handleRemoveTranslator = (userId: string) => {
    if (!projectId) return;
    removeTranslatorMutation.mutate({ projectId, userId });
  };

  const handleSendReminder = (userId: string, userName: string) => {
    setShowReminderModal({ open: true, userId, userName });
  };

  const handleSendReminderMessage = (message: string) => {
    if (!projectId) return;
    sendReminderMutation.mutate({
      projectId,
      userId: showReminderModal.userId,
      message,
    });
  };

  const handleSendDefaultReminder = () => {
    if (!projectId) return;
    sendReminderMutation.mutate({
      projectId,
      userId: showReminderModal.userId,
    });
  };

  const handleAddTranslators = (
    projectId: number,
    userIds: string[],
    messages: Record<string, string>
  ) => {
    addTranslatorsMutation.mutate({ projectId, userIds, messages });
  };

  // Wrapper handlers for TranslatorsList (for PM/Admin when assigned as translators)
  const handleClaimForTranslator = (projectId: number) => {
    if (!user?.id) return;
    const translator = project?.translators.find((t) => t.id === user.id);
    if (translator?.initial_message) {
      setInitialMessageDialog({
        open: true,
        projectId,
        projectName: project?.name || "",
        message: translator.initial_message,
      });
    } else {
      updateAssignmentMutation.mutate({
        projectId,
        userId: user.id,
        status: "claimed",
      });
    }
  };

  const handleRefuseForTranslator = (projectId: number) => {
    if (!project) return;
    setRefusalDialog({
      open: true,
      projectId,
      projectName: project.name,
    });
  };

  const handleDoneForTranslator = (projectId: number) => {
    if (!project) return;
    setDoneDialog({
      open: true,
      projectId,
      projectName: project.name,
    });
  };

  // Translator handlers
  const handleClaimClick = () => {
    if (!project || !user?.id) return;

    // Check if there's an initial_message
    if (translatorAssignment?.initial_message) {
      setInitialMessageDialog({
        open: true,
        projectId: project.id,
        projectName: project.name,
        message: translatorAssignment.initial_message,
      });
    } else {
      handleClaimProject();
    }
  };

  const handleClaimProject = () => {
    if (!projectId || !user?.id) return;
    updateAssignmentMutation.mutate({
      projectId,
      userId: user.id,
      status: "claimed",
    });
    setInitialMessageDialog({
      open: false,
      projectId: null,
      projectName: "",
      message: "",
    });
  };

  const handleRefuseClick = () => {
    if (!project) return;
    setRefusalDialog({
      open: true,
      projectId: project.id,
      projectName: project.name,
    });
  };

  const handleConfirmRefuse = (message: string) => {
    if (!refusalDialog.projectId || !user?.id) return;
    updateAssignmentMutation.mutate({
      projectId: refusalDialog.projectId,
      userId: user.id,
      status: "rejected",
      message,
    });
    setRefusalDialog({ open: false, projectId: null, projectName: "" });
  };

  const handleCancelRefuse = () => {
    setRefusalDialog({ open: false, projectId: null, projectName: "" });
  };

  const handleDoneClick = () => {
    if (!project) return;
    setDoneDialog({
      open: true,
      projectId: project.id,
      projectName: project.name,
    });
  };

  const handleConfirmDone = (message: string | null) => {
    if (!doneDialog.projectId || !user?.id) return;
    updateAssignmentMutation.mutate({
      projectId: doneDialog.projectId,
      userId: user.id,
      status: "done",
      message,
    });
    setDoneDialog({ open: false, projectId: null, projectName: "" });
  };

  const handleCancelDone = () => {
    setDoneDialog({ open: false, projectId: null, projectName: "" });
  };

  const handleCloseInitialMessage = () => {
    setInitialMessageDialog({
      open: false,
      projectId: null,
      projectName: "",
      message: "",
    });
  };

  if (isLoading || userLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin w-6 h-6 text-muted-foreground" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-12 text-center">
          <h2 className="text-gray-900 dark:text-white mb-4">
            Project not found
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {error ?
              "Failed to load project. Please try again."
            : "The project you're looking for doesn't exist or has been removed."
            }
          </p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  // If translator not assigned, show loading while redirecting
  if (isTranslator() && !isTranslatorAssigned) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin w-6 h-6 text-muted-foreground" />
      </div>
    );
  }

  // Get system color preview for the indicator dot
  const systemColorPreview = getSystemColorPreview(project.system);
  const systemColorStyle =
    systemColorPreview !== "transparent" ?
      { backgroundColor: systemColorPreview }
    : undefined;

  // Determine translator's assignment status for action buttons
  const assignmentStatus = translatorAssignment?.assignment_status;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </Button>

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-4 h-4 rounded" style={systemColorStyle} />
            <div>
              <h1 className="text-gray-900 dark:text-white mb-2 text-3xl font-bold">
                {project.name}
              </h1>
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center px-3 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm">
                  {project.system}
                </span>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-lg text-sm capitalize ${
                    project.status === "active" ?
                      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                    : project.status === "complete" ?
                      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                  }`}
                >
                  {project.status}
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons based on role */}
          <div className="flex gap-2">
            {/* PM/Admin: Duplicate and Edit buttons */}
            {canManageAssignments() && (
              <>
                <Button
                  onClick={handleDuplicate}
                  size="sm"
                  variant="outline"
                  className="cursor-pointer"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Duplicate
                </Button>
                <Button
                  onClick={handleEdit}
                  size="lg"
                  className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <Edit className="w-12 h-12 mr-2" />
                  Edit Project
                </Button>
              </>
            )}

            {/* Translator: Claim/Refuse or Done buttons */}
            {isTranslator() && isTranslatorAssigned && (
              <>
                {assignmentStatus === "unclaimed" && (
                  <div className="flex gap-2">
                    <Button
                      onClick={handleClaimClick}
                      size="lg"
                      disabled={updateAssignmentMutation.isPending}
                      className="cursor-pointer bg-green-500 hover:bg-green-600 text-white"
                    >
                      <Check className="w-5 h-5 mr-2" />
                      Claim Project
                    </Button>
                    <Button
                      onClick={handleRefuseClick}
                      size="lg"
                      variant="outline"
                      disabled={updateAssignmentMutation.isPending}
                      className="cursor-pointer border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                    >
                      <X className="w-5 h-5 mr-2" />
                      Refuse
                    </Button>
                  </div>
                )}
                {assignmentStatus === "claimed" && (
                  <Button
                    onClick={handleDoneClick}
                    size="lg"
                    disabled={updateAssignmentMutation.isPending}
                    className="cursor-pointer bg-green-500 hover:bg-green-600 text-white"
                  >
                    <Check className="w-5 h-5 mr-2" />
                    Mark as Done
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div
        className={`grid grid-cols-1 ${canManageAssignments() ? "lg:grid-cols-3" : ""} gap-6`}
      >
        {/* Left Column - Main Info */}
        <div
          className={`${canManageAssignments() ? "lg:col-span-2" : ""} space-y-6`}
        >
          <ProjectDetailsCard project={project} />
          <ProjectInstructionsCard instructions={project.instructions} />
        </div>

        {/* Right Column - Translators (PM/Admin only) */}
        {canManageAssignments() && (
          <div className="space-y-6">
            <TranslatorsList
              project={project}
              onAddTranslator={handleAddTranslator}
              onRemoveTranslator={handleRemoveTranslator}
              onSendReminder={handleSendReminder}
              currentUserId={user?.id}
              onClaim={handleClaimForTranslator}
              onRefuse={handleRefuseForTranslator}
              onDone={handleDoneForTranslator}
              onMarkComplete={() => markCompleteMutation.mutate()}
              canMarkComplete={
                canManageAssignments() &&
                project.translators.length > 0 &&
                project.translators.every(
                  (t) => t.assignment_status === "done"
                ) &&
                project.status !== "complete"
              }
              isUpdating={
                updateAssignmentMutation.isPending ||
                markCompleteMutation.isPending
              }
              projectStatus={project.status}
            />
          </div>
        )}
      </div>

      {/* PM/Admin Modals */}
      {canManageAssignments() && (
        <>
          {showAddTranslatorModal && project && (
            <AddTranslatorModal
              open={showAddTranslatorModal}
              projectId={project.id}
              projectName={project.name}
              assignedTranslatorIds={project.translators.map((t) => t.id)}
              onClose={() => setShowAddTranslatorModal(false)}
              onAddTranslators={handleAddTranslators}
              isAdding={addTranslatorsMutation.isPending}
            />
          )}

          <ReminderModal
            open={showReminderModal.open}
            translatorName={showReminderModal.userName}
            onClose={() =>
              setShowReminderModal({ open: false, userId: "", userName: "" })
            }
            onSend={handleSendReminderMessage}
            onSendDefault={handleSendDefaultReminder}
            isSending={sendReminderMutation.isPending}
          />
        </>
      )}

      {/* Translator Dialogs */}
      {isTranslator() && (
        <>
          <RefusalDialog
            open={refusalDialog.open}
            projectName={refusalDialog.projectName}
            onConfirm={handleConfirmRefuse}
            onCancel={handleCancelRefuse}
          />
          <DoneDialog
            open={doneDialog.open}
            projectName={doneDialog.projectName}
            onConfirm={handleConfirmDone}
            onCancel={handleCancelDone}
          />
          <InitialMessageDialog
            open={initialMessageDialog.open}
            projectName={initialMessageDialog.projectName}
            message={initialMessageDialog.message}
            onClose={handleCloseInitialMessage}
            onClaim={handleClaimProject}
          />
        </>
      )}
    </div>
  );
}
