"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { X, Loader2, AlertCircle } from "lucide-react";
import { useUser } from "@/hooks/useUser";
import { useProjectsWithTranslators } from "@/hooks/useProjectsWithTranslators";
import { FilterDropdown } from "@/components/general/FilterDropdown";
import { ViewToggle } from "@/components/general/ViewToggle";
import { SearchBar } from "@/components/general/SearchBar";
import { ManagementTabs } from "@/components/management/ManagementTabs";
import { ManagementTable } from "@/components/management/ManagementTable";
import { ManagementCard } from "@/components/management/ManagementCard";
import { AddTranslatorModal } from "@/components/management/AddTranslatorModal";
import { RemoveTranslatorModal } from "@/components/management/RemoveTranslatorModal";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { RouteId } from "@/lib/roleAccess";
import { Card, CardContent } from "@/components/ui/card";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getUserFriendlyError } from "@/utils/toastHelpers";
import {
  matchesDueDateFilter,
  matchesLengthFilter,
} from "@/utils/filterHelpers";

type ProjectStatus = "all" | "ready" | "inProgress" | "unclaimed";
type ViewMode = "table" | "card";

export default function ProjectManagementPage() {
  return (
    <RoleGuard routeId={RouteId.MANAGEMENT}>
      <ProjectManagementContent />
    </RoleGuard>
  );
}

function ProjectManagementContent() {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  const queryClient = useQueryClient();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables.");
  }

  const supabase = createClientComponentClient({ supabaseUrl, supabaseKey });

  // State
  const [activeTab, setActiveTab] = useState<ProjectStatus>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [addTranslatorModal, setAddTranslatorModal] = useState<{
    open: boolean;
    projectId: number;
    projectName: string;
    assignedTranslatorIds: string[];
  }>({ open: false, projectId: 0, projectName: "", assignedTranslatorIds: [] });
  const [removeTranslatorModal, setRemoveTranslatorModal] = useState<{
    open: boolean;
    projectId: number;
    projectName: string;
    translators: Array<{
      id: string;
      name: string;
      role: string;
      assignment_status: string;
    }>;
  }>({ open: false, projectId: 0, projectName: "", translators: [] });

  // State for editing project words/lines
  const [editingProjectId, setEditingProjectId] = useState<number | null>(null);
  const [editWords, setEditWords] = useState<string>("");
  const [editLines, setEditLines] = useState<string>("");

  // Filter states
  const [systemFilter, setSystemFilter] = useState<string | null>(null);
  const [dueDateFilter, setDueDateFilter] = useState<string | null>(null);
  const [customDueDate, setCustomDueDate] = useState<string>("");
  const [assignmentStatusFilter, setAssignmentStatusFilter] = useState<
    string | null
  >(null);
  const [sourceLangFilter, setSourceLangFilter] = useState<string | null>(null);
  const [targetLangFilter, setTargetLangFilter] = useState<string | null>(null);
  const [lengthFilter, setLengthFilter] = useState<string | null>(null);

  // Fetch all projects (showAll = true to show all projects for all users)
  const {
    data: allProjectsRaw = [],
    isLoading: projectsLoading,
    error: projectsError,
  } = useProjectsWithTranslators(false, true);

  // Filter out complete projects immediately
  const allProjects = useMemo(
    () => allProjectsRaw.filter((p) => p.status !== "complete"),
    [allProjectsRaw]
  );

  // Determine project status based on translators
  const getProjectStatus = (
    project: (typeof allProjects)[0]
  ): ProjectStatus => {
    if (project.translators.length === 0) return "unclaimed";
    const allDone = project.translators.every(
      (t) => t.assignment_status === "done"
    );
    if (allDone) return "ready";
    const hasClaimed = project.translators.some(
      (t) => t.assignment_status === "claimed"
    );
    if (hasClaimed) return "inProgress";
    return "unclaimed";
  };

  // Get unique systems and languages for filters
  const uniqueSystems = useMemo(() => {
    const systems = new Set(allProjects.map((p) => p.system));
    return Array.from(systems).sort();
  }, [allProjects]);

  const uniqueLanguages = useMemo(() => {
    const langs = new Set<string>();
    allProjects.forEach((p) => {
      if (p.language_in) langs.add(p.language_in);
      if (p.language_out) langs.add(p.language_out);
    });
    return Array.from(langs).sort();
  }, [allProjects]);

  // Categorize projects
  const categorizedProjects = useMemo(() => {
    const ready: typeof allProjects = [];
    const inProgress: typeof allProjects = [];
    const unclaimed: typeof allProjects = [];

    allProjects.forEach((project) => {
      const status = getProjectStatus(project);
      if (status === "ready") ready.push(project);
      else if (status === "inProgress") inProgress.push(project);
      else if (status === "unclaimed") unclaimed.push(project);
    });

    return { ready, inProgress, unclaimed };
  }, [allProjects]);

  // Create tabs
  const tabs = useMemo(
    () => [
      {
        id: "all" as const,
        label: "All Projects",
        count: allProjects.length,
      },
      {
        id: "ready" as const,
        label: "Ready to Go",
        count: categorizedProjects.ready.length,
      },
      {
        id: "inProgress" as const,
        label: "In Progress",
        count: categorizedProjects.inProgress.length,
      },
      {
        id: "unclaimed" as const,
        label: "Awaiting Assignment",
        count: categorizedProjects.unclaimed.length,
      },
    ],
    [allProjects, categorizedProjects]
  );

  // Filter projects
  const filteredProjects = useMemo(() => {
    let projects = [...allProjects];

    // Tab filter
    if (activeTab !== "all") {
      const status =
        activeTab === "ready" ? categorizedProjects.ready
        : activeTab === "inProgress" ? categorizedProjects.inProgress
        : categorizedProjects.unclaimed;
      projects = projects.filter((p) => status.includes(p));
    }

    // Search filter
    if (searchTerm) {
      projects = projects.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // System filter
    if (systemFilter) {
      projects = projects.filter((p) => p.system === systemFilter);
    }

    // Due date filter
    if (dueDateFilter && dueDateFilter !== "Custom date") {
      projects = projects.filter((p) => {
        const deadline =
          p.final_deadline || p.interim_deadline || p.initial_deadline;
        return (
          deadline &&
          matchesDueDateFilter(
            deadline,
            dueDateFilter,
            customDueDate || undefined
          )
        );
      });
    } else if (dueDateFilter === "Custom date" && customDueDate) {
      projects = projects.filter((p) => {
        const deadline =
          p.final_deadline || p.interim_deadline || p.initial_deadline;
        return (
          deadline &&
          matchesDueDateFilter(deadline, "Custom date", customDueDate)
        );
      });
    }

    // Assignment status filter
    if (assignmentStatusFilter === "Unassigned") {
      projects = projects.filter((p) => p.translators.length === 0);
    } else if (assignmentStatusFilter === "Assigned") {
      projects = projects.filter((p) => p.translators.length > 0);
    }

    // Source language filter
    if (sourceLangFilter) {
      projects = projects.filter((p) => p.language_in === sourceLangFilter);
    }

    // Target language filter
    if (targetLangFilter) {
      projects = projects.filter((p) => p.language_out === targetLangFilter);
    }

    // Length filter
    if (lengthFilter) {
      projects = projects.filter((p) =>
        matchesLengthFilter(p.words, lengthFilter)
      );
    }

    // Sort by due date (earliest first)
    return projects.sort((a, b) => {
      const dateA = new Date(
        a.final_deadline || a.interim_deadline || a.initial_deadline || ""
      ).getTime();
      const dateB = new Date(
        b.final_deadline || b.interim_deadline || b.initial_deadline || ""
      ).getTime();
      return dateA - dateB;
    });
  }, [
    allProjects,
    activeTab,
    searchTerm,
    systemFilter,
    dueDateFilter,
    customDueDate,
    assignmentStatusFilter,
    sourceLangFilter,
    targetLangFilter,
    lengthFilter,
    categorizedProjects,
  ]);

  // Mutations
  const markCompleteMutation = useMutation({
    mutationFn: async (projectId: number) => {
      const { error } = await supabase
        .from("projects")
        .update({ status: "complete" })
        .eq("id", projectId);

      if (error)
        throw new Error(`Failed to mark project as complete: ${error.message}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["projects-with-translators"],
      });
      toast.success("Project marked as complete");
      setOpenMenu(null);
    },
    onError: (error: Error) => toast.error(getUserFriendlyError(error, "project management")),
  });

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
        assignment_status: "unclaimed" as const,
        initial_message: messages[userId] || null,
      }));

      const { error } = await supabase
        .from("projects_assignment")
        .insert(assignments);
      if (error) throw new Error(`Failed to add translators: ${error.message}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["projects-with-translators"],
      });
      toast.success("Translators added successfully");
      setAddTranslatorModal({
        open: false,
        projectId: 0,
        projectName: "",
        assignedTranslatorIds: [],
      });
    },
    onError: (error: Error) => toast.error(getUserFriendlyError(error, "project management")),
  });

  const removeTranslatorMutation = useMutation({
    mutationFn: async ({
      projectId,
      userId,
    }: {
      projectId: number; // bigint in database
      userId: string; // uuid in database
    }) => {
      // Ensure we have valid IDs
      if (!projectId || !userId) {
        throw new Error("Project ID and User ID are required");
      }

      // Check if current user is admin or PM (they should be able to delete any assignment)
      const isAdminOrPM = user && (user.role === "admin" || user.role === "pm");
      const isDeletingSelf = user && user.id === userId;

      // First, verify the assignment exists before deleting
      const { data: existingAssignment, error: checkError } = await supabase
        .from("projects_assignment")
        .select("project_id, user_id")
        .eq("project_id", projectId)
        .eq("user_id", userId)
        .single();

      if (checkError || !existingAssignment) {
        throw new Error(
          `Translator assignment not found. No row exists with project_id=${projectId} and user_id=${userId}`
        );
      }

      // Delete the specific row using the composite primary key (project_id, user_id)
      // According to schema: constraint projects_assignment_pkey primary key (project_id, user_id)
      // Note: If RLS is blocking self-deletion, admins/PMs should still be able to delete
      const { error } = await supabase
        .from("projects_assignment")
        .delete()
        .eq("project_id", projectId) // bigint - matches projects.id
        .eq("user_id", userId); // uuid - matches users.id

      if (error) {
        // Check if this is the database trigger error (column pm_id doesn't exist)
        // Error code 42703 = undefined_column in PostgreSQL
        if (error.code === "42703" && error.message?.includes("pm_id")) {
          console.error("Database trigger error - pm_id column missing:", {
            error,
            projectId,
            userId,
            isDeletingSelf,
            isAdminOrPM,
            currentUserId: user?.id,
          });

          throw new Error(
            `Database configuration error: The trigger function is trying to update a 'pm_id' column that doesn't exist in the projects table. Please contact your database administrator to fix the 'clear_pm_if_no_assignments()' function or add the missing 'pm_id' column to the projects table.`
          );
        }

        // Enhanced error message with context for other errors
        const errorContext =
          isDeletingSelf ? " (Attempting to delete own assignment)" : "";
        const roleContext =
          isAdminOrPM ?
            " (User is admin/PM)"
          : ` (User role: ${user?.role || "unknown"})`;

        console.error("Delete error details:", {
          error,
          projectId,
          userId,
          isDeletingSelf,
          isAdminOrPM,
          currentUserId: user?.id,
          errorCode: error.code,
          errorDetails: error.details,
          errorHint: error.hint,
        });

        throw new Error(
          `Failed to remove translator: ${error.message}${errorContext}${roleContext}. Project ID: ${projectId}, User ID: ${userId}`
        );
      }

      // Verify deletion was successful by checking if assignment still exists
      // Wait a small moment for the delete to propagate
      await new Promise((resolve) => setTimeout(resolve, 100));

      const { data: verifyAssignment, error: verifyError } = await supabase
        .from("projects_assignment")
        .select("project_id, user_id")
        .eq("project_id", projectId)
        .eq("user_id", userId)
        .maybeSingle();

      // If assignment still exists and it's not a permission error, throw
      if (verifyAssignment && !verifyError) {
        throw new Error(
          "Delete operation completed but assignment still exists. This may be due to RLS policies preventing the deletion."
        );
      }

      // Return the deleted assignment data for confirmation
      return existingAssignment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["projects-with-translators"],
      });
      toast.success("Translator removed successfully");
      setRemoveTranslatorModal({
        open: false,
        projectId: 0,
        projectName: "",
        translators: [],
      });
      setOpenMenu(null);
    },
    onError: (error: Error) => toast.error(getUserFriendlyError(error, "project management")),
  });

  // Mutation to update project words/lines
  const updateWordsLinesMutation = useMutation({
    mutationFn: async ({
      projectId,
      words,
      lines,
    }: {
      projectId: number;
      words: number | null;
      lines: number | null;
    }) => {
      const { error } = await supabase
        .from("projects")
        .update({ words, lines })
        .eq("id", projectId);

      if (error) {
        throw new Error(`Failed to update words/lines: ${error.message}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["projects-with-translators"],
      });
      toast.success("Words/Lines updated successfully");
      setEditingProjectId(null);
    },
    onError: (error: Error) => toast.error(getUserFriendlyError(error, "project management")),
  });

  // Handlers for words/lines editing
  const handleStartWordsLinesEdit = (
    projectId: number,
    words: number | null,
    lines: number | null
  ) => {
    setEditingProjectId(projectId);
    setEditWords(words?.toString() || "");
    setEditLines(lines?.toString() || "");
  };

  const handleSaveWordsLines = (projectId: number) => {
    const words = editWords ? parseInt(editWords) : null;
    const lines = editLines ? parseInt(editLines) : null;
    updateWordsLinesMutation.mutate({ projectId, words, lines });
  };

  const handleCancelWordsLinesEdit = () => {
    setEditingProjectId(null);
    setEditWords("");
    setEditLines("");
  };

  // Handlers
  const handleAddTranslator = (projectId: number) => {
    const project = allProjects.find((p) => p.id === projectId);
    if (project) {
      setAddTranslatorModal({
        open: true,
        projectId,
        projectName: project.name,
        assignedTranslatorIds: project.translators.map((t) => t.id),
      });
      setOpenMenu(null);
    }
  };

  const handleRemoveTranslator = (projectId: number) => {
    const project = allProjects.find((p) => p.id === projectId);
    if (project) {
      setRemoveTranslatorModal({
        open: true,
        projectId,
        projectName: project.name,
        translators: project.translators,
      });
      setOpenMenu(null);
    }
  };

  const handleDuplicate = (projectId: number) => {
    setOpenMenu(null);
    router.push(`/new-project?duplicateFrom=${projectId}`);
  };

  const handleEditDetails = (projectId: number) => {
    setOpenMenu(null);
    router.push(`/project/${projectId}/edit`);
  };

  const handleCompleteProject = (projectId: number) => {
    markCompleteMutation.mutate(projectId);
  };

  const clearAllFilters = () => {
    setSystemFilter(null);
    setDueDateFilter(null);
    setCustomDueDate("");
    setAssignmentStatusFilter(null);
    setSourceLangFilter(null);
    setTargetLangFilter(null);
    setLengthFilter(null);
  };

  const hasActiveFilters =
    systemFilter ||
    dueDateFilter ||
    assignmentStatusFilter ||
    sourceLangFilter ||
    targetLangFilter ||
    lengthFilter;

  // Loading state
  if (userLoading || projectsLoading) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Loading projects...</span>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (projectsError) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
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
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-gray-900 dark:text-white mb-2">Manage Projects</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Complete oversight of all translation projects and their status
        </p>
      </div>

      {/* Tabs + View Toggle */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-end justify-between">
          <ManagementTabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
          <div className="mb-3 flex flex-col items-center gap-1">
            <span className="text-gray-500 dark:text-gray-400 text-xs">
              View
            </span>
            <ViewToggle view={viewMode} onViewChange={setViewMode} />
          </div>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="mb-6 space-y-4">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search by project name"
        />

        {/* Individual Filter Dropdowns */}
        <div className="flex justify-between items-start gap-3">
          <div className="flex flex-wrap gap-3 items-start">
            <FilterDropdown
              label="System"
              options={uniqueSystems}
              selected={systemFilter}
              onSelect={setSystemFilter}
            />
            <FilterDropdown
              label="Due Date"
              options={[
                "Today",
                "In 1 day",
                "In 3 days",
                "In a week",
                "In a month",
                "Custom date",
              ]}
              selected={dueDateFilter}
              onSelect={setDueDateFilter}
              customDateValue={customDueDate}
              onCustomDateChange={setCustomDueDate}
            />
            <FilterDropdown
              label="Assignment Status"
              options={["Unassigned", "Assigned"]}
              selected={assignmentStatusFilter}
              onSelect={setAssignmentStatusFilter}
            />
            <FilterDropdown
              label="Source Language"
              options={uniqueLanguages}
              selected={sourceLangFilter}
              onSelect={setSourceLangFilter}
            />
            <FilterDropdown
              label="Target Language"
              options={uniqueLanguages}
              selected={targetLangFilter}
              onSelect={setTargetLangFilter}
            />
            <FilterDropdown
              label="Length"
              options={["Short", "Long"]}
              selected={lengthFilter}
              onSelect={setLengthFilter}
            />
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="px-4 py-2 cursor-pointer rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-200 dark:bg-black text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-700 hover:text-red-600 dark:hover:text-red-400 transition-all flex items-center gap-2 text-sm shadow-sm shrink-0"
              type="button"
            >
              <X className="w-4 h-4" />
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Table or Card View */}
      {viewMode === "table" ?
        <ManagementTable
          projects={filteredProjects}
          openMenu={openMenu}
          onMenuToggle={setOpenMenu}
          onAddTranslator={handleAddTranslator}
          onRemoveTranslator={handleRemoveTranslator}
          onDuplicate={handleDuplicate}
          onEditDetails={handleEditDetails}
          onCompleteProject={handleCompleteProject}
          activeTab={activeTab}
          editingProjectId={editingProjectId}
          editWords={editWords}
          editLines={editLines}
          onEditWordsChange={setEditWords}
          onEditLinesChange={setEditLines}
          onStartWordsLinesEdit={handleStartWordsLinesEdit}
          onSaveWordsLines={handleSaveWordsLines}
          onCancelWordsLinesEdit={handleCancelWordsLinesEdit}
          isUpdatingWordsLines={updateWordsLinesMutation.isPending}
        />
      : <ManagementCard
          projects={filteredProjects}
          openMenu={openMenu}
          onMenuToggle={setOpenMenu}
          onAddTranslator={handleAddTranslator}
          onRemoveTranslator={handleRemoveTranslator}
          onDuplicate={handleDuplicate}
          onEditDetails={handleEditDetails}
          onCompleteProject={handleCompleteProject}
          activeTab={activeTab}
          editingProjectId={editingProjectId}
          editWords={editWords}
          editLines={editLines}
          onEditWordsChange={setEditWords}
          onEditLinesChange={setEditLines}
          onStartWordsLinesEdit={handleStartWordsLinesEdit}
          onSaveWordsLines={handleSaveWordsLines}
          onCancelWordsLinesEdit={handleCancelWordsLinesEdit}
          isUpdatingWordsLines={updateWordsLinesMutation.isPending}
        />
      }

      {/* Modals */}
      <AddTranslatorModal
        open={addTranslatorModal.open}
        projectId={addTranslatorModal.projectId}
        projectName={addTranslatorModal.projectName}
        assignedTranslatorIds={addTranslatorModal.assignedTranslatorIds}
        onClose={() =>
          setAddTranslatorModal({
            open: false,
            projectId: 0,
            projectName: "",
            assignedTranslatorIds: [],
          })
        }
        onAddTranslators={(projectId, userIds, messages) =>
          addTranslatorsMutation.mutate({ projectId, userIds, messages })
        }
        isAdding={addTranslatorsMutation.isPending}
      />

      <RemoveTranslatorModal
        open={removeTranslatorModal.open}
        projectId={removeTranslatorModal.projectId}
        projectName={removeTranslatorModal.projectName}
        translators={removeTranslatorModal.translators}
        onClose={() =>
          setRemoveTranslatorModal({
            open: false,
            projectId: 0,
            projectName: "",
            translators: [],
          })
        }
        onRemoveTranslator={(projectId, userId) =>
          removeTranslatorMutation.mutate({ projectId, userId })
        }
        isRemoving={removeTranslatorMutation.isPending}
      />
    </div>
  );
}
