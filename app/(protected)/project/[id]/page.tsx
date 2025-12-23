"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Edit, Loader2 } from "lucide-react";
import { useProject } from "@/hooks/useProject";
import { useColorSettings } from "@/hooks/useColorSettings";
import { ProjectDetailsCard } from "@/components/project/ProjectDetailsCard";
import { ProjectInstructionsCard } from "@/components/project/ProjectInstructionsCard";
import { TranslatorsList } from "@/components/project/TranslatorsList";
import { AddTranslatorModal } from "@/components/management/AddTranslatorModal";
import { ReminderModal } from "@/components/project/ReminderModal";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { toast } from "sonner";
import { useState } from "react";

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const projectId = params.id ? Number(params.id) : null;

  const { data: project, isLoading, error } = useProject(projectId);
  const { getSystemColorPreview } = useColorSettings();

  const [showAddTranslatorModal, setShowAddTranslatorModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState<{
    open: boolean;
    userId: string;
    userName: string;
  }>({ open: false, userId: "", userName: "" });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables.");
  }

  const supabase = createClientComponentClient({ supabaseUrl, supabaseKey });

  // Add translators mutation
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
        assignment_status: "unclaimed",
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
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      toast.success("Translator removed successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Send reminder mutation
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
      // Update the initial_message in the assignment
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
      toast.error(error.message);
    },
  });

  const handleEdit = () => {
    router.push(`/project/${projectId}/edit`);
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

  if (isLoading) {
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

  // Get system color preview for the indicator dot
  const systemColorPreview = getSystemColorPreview(project.system);
  const systemColorStyle =
    systemColorPreview !== "transparent" ? { backgroundColor: systemColorPreview } : undefined;

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

          <div className="flex gap-2">
            <Button
              onClick={handleEdit}
              size="lg"
              className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white"
            >
              <Edit className="w-12 h-12 mr-2" />
              Edit Project
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <ProjectDetailsCard project={project} />
          <ProjectInstructionsCard instructions={project.instructions} />
        </div>

        {/* Right Column - Translators */}
        <div className="space-y-6">
          <TranslatorsList
            project={project}
            onAddTranslator={handleAddTranslator}
            onRemoveTranslator={handleRemoveTranslator}
            onSendReminder={handleSendReminder}
          />
        </div>
      </div>

      {/* Add Translator Modal */}
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

      {/* Reminder Modal */}
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
    </div>
  );
}
