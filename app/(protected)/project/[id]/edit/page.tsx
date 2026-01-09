"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, Users, UserPlus, X } from "lucide-react";
import { useProject } from "@/hooks/useProject";
import { AddTranslatorModal } from "@/components/management/AddTranslatorModal";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { toast } from "sonner";
import { getUserFriendlyError } from "@/utils/toastHelpers";

const projectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  system: z.string().min(1, "System is required"),
  status: z.enum(["active", "complete", "cancelled"]),
  words: z.number().nullable().optional(),
  lines: z.number().nullable().optional(),
  language_in: z.string().nullable().optional(),
  language_out: z.string().nullable().optional(),
  initial_deadline: z.string().nullable().optional(),
  interim_deadline: z.string().nullable().optional(),
  final_deadline: z.string().nullable().optional(),
  instructions: z.string().nullable().optional(),
  paid: z.boolean().nullable().optional(),
  invoiced: z.boolean().nullable().optional(),
  short: z.boolean().nullable().optional(),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

// Common systems - can be extended
const BASE_SYSTEMS = ["B0X", "XTM", "SSE", "STM", "LAT"];

export default function EditProjectPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const projectId = params.id ? Number(params.id) : null;

  const { data: project, isLoading, error } = useProject(projectId);

  // State for translator management
  const [showAddTranslatorModal, setShowAddTranslatorModal] = useState(false);
  const [translatorToRemove, setTranslatorToRemove] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Include project's current system in the list if it's not already there
  const SYSTEMS = React.useMemo(() => {
    if (project?.system && !BASE_SYSTEMS.includes(project.system)) {
      return [project.system, ...BASE_SYSTEMS];
    }
    return BASE_SYSTEMS;
  }, [project?.system]);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables.");
  }

  const supabase = createClientComponentClient({ supabaseUrl, supabaseKey });

  const formatDateForInput = (date: string | null | undefined) => {
    if (!date) return "";
    try {
      return format(new Date(date), "yyyy-MM-dd");
    } catch {
      return "";
    }
  };

  // Build form values from project data
  const formValues: ProjectFormValues | undefined = React.useMemo(() => {
    if (!project) return undefined;
    return {
      name: project.name || "",
      system: project.system || "",
      status:
        (project.status as "active" | "complete" | "cancelled") || "active",
      words: project.words ?? null,
      lines: project.lines ?? null,
      language_in: project.language_in || null,
      language_out: project.language_out || null,
      initial_deadline: formatDateForInput(project.initial_deadline),
      interim_deadline: formatDateForInput(project.interim_deadline),
      final_deadline: formatDateForInput(project.final_deadline),
      instructions: project.instructions || null,
      paid: project.paid ?? false,
      invoiced: project.invoiced ?? false,
      short: project.short ?? false,
    };
  }, [project]);

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      system: "",
      status: "active",
      words: null,
      lines: null,
      language_in: null,
      language_out: null,
      initial_deadline: null,
      interim_deadline: null,
      final_deadline: null,
      instructions: null,
      paid: false,
      invoiced: false,
      short: false,
    },
  });

  React.useEffect(() => {
    if (formValues && project) {
      // Reset with loaded data so fields show current values and form is clean
      form.reset(formValues);
    }
  }, [form, formValues, project?.id]);

  const updateProjectMutation = useMutation({
    mutationFn: async (values: ProjectFormValues) => {
      if (!projectId) throw new Error("Project ID is required");

      const formatDateForDB = (dateStr: string | null | undefined) => {
        if (!dateStr || dateStr === "") return null;
        try {
          const date = new Date(dateStr);
          return isNaN(date.getTime()) ? null : date.toISOString();
        } catch {
          return null;
        }
      };

      const updateData: any = {
        name: values.name,
        system: values.system,
        status: values.status,
        words: values.words ?? null,
        lines: values.lines ?? null,
        language_in: values.language_in || null,
        language_out: values.language_out || null,
        initial_deadline: formatDateForDB(values.initial_deadline),
        interim_deadline: formatDateForDB(values.interim_deadline),
        final_deadline: formatDateForDB(values.final_deadline),
        instructions: values.instructions || null,
        paid: values.paid ?? false,
        invoiced: values.invoiced ?? false,
        short: values.short ?? false,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("projects")
        .update(updateData)
        .eq("id", projectId);

      if (error) {
        throw new Error(`Failed to update project: ${error.message}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", projectId] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project updated successfully");
      router.push(`/project/${projectId}`);
    },
    onError: (error: Error) => {
      toast.error(getUserFriendlyError(error, "project update"));
    },
  });

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
      toast.error(getUserFriendlyError(error, "project update"));
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
      setTranslatorToRemove(null);
    },
    onError: (error: Error) => {
      toast.error(getUserFriendlyError(error, "project update"));
    },
  });

  const handleAddTranslators = (
    projectId: number,
    userIds: string[],
    messages: Record<string, string>
  ) => {
    addTranslatorsMutation.mutate({ projectId, userIds, messages });
  };

  const handleRemoveTranslator = () => {
    if (!projectId || !translatorToRemove) return;
    removeTranslatorMutation.mutate({
      projectId,
      userId: translatorToRemove.id,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "claimed":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "done":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "rejected":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "claimed":
        return "In Progress";
      case "done":
        return "Done";
      case "rejected":
        return "Rejected";
      default:
        return "Unclaimed";
    }
  };

  const onSubmit = (values: ProjectFormValues) => {
    updateProjectMutation.mutate(values);
  };

  // Check if form is dirty (has changes)
  const isDirty = form.formState.isDirty;

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
            : "The project you're trying to edit doesn't exist or has been removed."
            }
          </p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </Button>

        <h1 className="text-gray-900 dark:text-white mb-2 text-3xl font-bold">
          Edit Project
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Update project details and settings
        </p>
      </div>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Project Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter project name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* System and Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="system"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>System</FormLabel>
                      <Select
                        onValueChange={(val) => {
                          // Guard: Only update if val is not empty (prevents Radix clearing the value)
                          if (val) {
                            field.onChange(val);
                          }
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a system" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {SYSTEMS.map((system) => (
                            <SelectItem key={system} value={system}>
                              {system}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="complete">Complete</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Words and Lines */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="words"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Word Count</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === "" ?
                                null
                              : parseInt(e.target.value) || null
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lines"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Line Count</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === "" ?
                                null
                              : parseInt(e.target.value) || null
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Languages */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="language_in"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Source Language</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. English"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="language_out"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Language</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Spanish"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Deadlines */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="initial_deadline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Initial Deadline</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="interim_deadline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Interim Deadline</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="final_deadline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Final Deadline</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Financial Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="paid"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Paid</FormLabel>
                        <FormDescription>
                          Mark if the project has been paid
                        </FormDescription>
                      </div>
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value ?? false}
                          onChange={field.onChange}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="invoiced"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Invoiced</FormLabel>
                        <FormDescription>
                          Mark if the project has been invoiced
                        </FormDescription>
                      </div>
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value ?? false}
                          onChange={field.onChange}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {/* Short Project */}
              <FormField
                control={form.control}
                name="short"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Short Project</FormLabel>
                      <FormDescription>
                        Mark if this is a short project
                      </FormDescription>
                    </div>
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value ?? false}
                        onChange={field.onChange}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Instructions */}
              <FormField
                control={form.control}
                name="instructions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instructions</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter project instructions..."
                        className="min-h-32"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Translators Management Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CardTitle>Assigned Translators</CardTitle>
                </div>
                <Button
                  type="button"
                  onClick={() => setShowAddTranslatorModal(true)}
                  size="sm"
                  className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {project.translators.length > 0 ? (
                <div className="space-y-3">
                  {project.translators.map((translator) => (
                    <div
                      key={translator.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <ProfileAvatar
                          name={translator.name}
                          avatar={translator.avatar}
                          size="sm"
                          showEditButton={false}
                        />
                        <div>
                          <p className="text-gray-900 dark:text-white font-medium text-sm">
                            {translator.name}
                            {translator.short_name && (
                              <span className="text-gray-500 dark:text-gray-400 font-normal">
                                {" "}
                                ({translator.short_name})
                              </span>
                            )}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-gray-500 dark:text-gray-400 text-xs">
                              {translator.role}
                            </span>
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${getStatusColor(
                                translator.assignment_status
                              )}`}
                            >
                              {getStatusLabel(translator.assignment_status)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setTranslatorToRemove({
                            id: translator.id,
                            name: translator.name,
                          })
                        }
                        className="p-2 cursor-pointer text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Remove translator"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400">
                    No translators assigned yet
                  </p>
                  <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                    Click "Add" to assign translators to this project
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateProjectMutation.isPending || !isDirty}
              className={
                !isDirty && !updateProjectMutation.isPending ?
                  "opacity-50 cursor-not-allowed"
                : ""
              }
            >
              {updateProjectMutation.isPending ?
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              : <>
                  <Save className="w-5 h-5 mr-2" />
                  Save Changes
                </>
              }
            </Button>
          </div>
        </form>
      </Form>

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

      {/* Remove Translator Confirmation Modal */}
      {translatorToRemove && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setTranslatorToRemove(null)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-gray-900 dark:text-white font-semibold">
                Confirm Removal
              </h2>
              <button
                onClick={() => setTranslatorToRemove(null)}
                className="p-1 cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors"
                type="button"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
              Are you sure you want to remove{" "}
              <span className="font-medium text-gray-900 dark:text-white">
                {translatorToRemove.name}
              </span>{" "}
              from{" "}
              <span className="font-medium text-gray-900 dark:text-white">
                {project?.name}
              </span>
              ?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setTranslatorToRemove(null)}
                disabled={removeTranslatorMutation.isPending}
                className="px-4 py-2 cursor-pointer text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 rounded-lg transition-colors border border-gray-200 dark:border-gray-700 disabled:opacity-50"
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={handleRemoveTranslator}
                disabled={removeTranslatorMutation.isPending}
                className="px-4 py-2 cursor-pointer bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                type="button"
              >
                {removeTranslatorMutation.isPending && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
