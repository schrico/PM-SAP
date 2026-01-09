"use client";

import { useState, useMemo } from "react";
import { X } from "lucide-react";
import { SearchBar } from "@/components/general/SearchBar";
import { FilterDropdown } from "@/components/general/FilterDropdown";
import { ViewToggle } from "@/components/general/ViewToggle";
import { ScrollToTopButton } from "@/components/general/ScrollToTopButton";
import { ProjectAssignTable } from "@/components/assign/ProjectAssignTable";
import { ProjectAssignCard } from "@/components/assign/ProjectAssignCard";
import {
  TranslatorSelectionView,
  type ProjectAssignmentData,
} from "@/components/assign/TranslatorSelectionView";
import { RoleGuard } from "@/components/auth/RoleGuard";
import { RouteId } from "@/lib/roleAccess";
import { useProjectsWithTranslators } from "@/hooks/useProjectsWithTranslators";
import {
  matchesDueDateFilter,
  matchesLengthFilter,
} from "@/utils/filterHelpers";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getUserFriendlyError } from "@/utils/toastHelpers";
import { useLayoutStore } from "@/lib/stores/useLayoutStore";
import type { Project } from "@/types/project";

interface ProjectWithTranslators extends Project {
  translators: Array<{
    id: string;
    name: string;
    role: string;
    assignment_status: string;
  }>;
}

export default function AssignProjectsPage() {
  return (
    <RoleGuard routeId={RouteId.ASSIGN_PROJECTS}>
      <AssignProjectsContent />
    </RoleGuard>
  );
}

function AssignProjectsContent() {
  const { data: allProjects = [], isLoading: projectsLoading } =
    useProjectsWithTranslators(false, true);
  const queryClient = useQueryClient();
  const collapsed = useLayoutStore((state) => state.collapsed);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProjects, setSelectedProjects] = useState<Set<number>>(
    new Set()
  );
  const [showUserSelection, setShowUserSelection] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "card">("table");

  // Filter states
  const [systemFilter, setSystemFilter] = useState<string | null>(null);
  const [dueDateFilter, setDueDateFilter] = useState<string | null>(null);
  const [customDueDate, setCustomDueDate] = useState<string>("");
  const [sourceLangFilter, setSourceLangFilter] = useState<string | null>(null);
  const [targetLangFilter, setTargetLangFilter] = useState<string | null>(null);
  const [lengthFilter, setLengthFilter] = useState<string | null>(null);
  const [assignmentFilter, setAssignmentFilter] = useState<string | null>(
    "Unassigned"
  );

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables.");
  }

  const supabase = createClientComponentClient({ supabaseUrl, supabaseKey });

  const loading = projectsLoading;

  // Get unique values for filters
  const uniqueSystems = useMemo(() => {
    const systems = new Set(allProjects.map((p) => p.system).filter(Boolean));
    return Array.from(systems).sort();
  }, [allProjects]);

  const uniqueSourceLangs = useMemo(() => {
    const langs = new Set(
      allProjects.map((p) => p.language_in).filter(Boolean)
    );
    return Array.from(langs).sort();
  }, [allProjects]);

  const uniqueTargetLangs = useMemo(() => {
    const langs = new Set(
      allProjects.map((p) => p.language_out).filter(Boolean)
    );
    return Array.from(langs).sort();
  }, [allProjects]);

  const clearAllFilters = () => {
    setSystemFilter(null);
    setDueDateFilter(null);
    setCustomDueDate("");
    setAssignmentFilter(null);
    setSourceLangFilter(null);
    setTargetLangFilter(null);
    setLengthFilter(null);
  };

  const hasActiveFilters =
    systemFilter ||
    dueDateFilter ||
    assignmentFilter ||
    sourceLangFilter ||
    targetLangFilter ||
    lengthFilter;

  // Filtering logic
  const filteredProjects = useMemo(() => {
    return allProjects
      .filter((p) => {
        // Search filter
        if (
          searchTerm &&
          !p.name.toLowerCase().includes(searchTerm.toLowerCase())
        ) {
          return false;
        }

        // Assignment status filter
        const hasTranslators = p.translators && p.translators.length > 0;
        if (assignmentFilter === "Unassigned" && hasTranslators) {
          return false;
        }
        if (assignmentFilter === "Assigned" && !hasTranslators) {
          return false;
        }

        // System filter
        if (systemFilter && p.system !== systemFilter) {
          return false;
        }

        // Due date filter
        const dueDate =
          p.final_deadline || p.interim_deadline || p.initial_deadline;
        if (
          dueDateFilter &&
          dueDate &&
          !matchesDueDateFilter(
            dueDate,
            dueDateFilter,
            customDueDate || undefined
          )
        ) {
          return false;
        }
        if (dueDateFilter && !dueDate) {
          return false; // Filter out projects without deadlines when date filter is active
        }

        // Source language filter
        if (sourceLangFilter && p.language_in !== sourceLangFilter) {
          return false;
        }

        // Target language filter
        if (targetLangFilter && p.language_out !== targetLangFilter) {
          return false;
        }

        // Length filter
        if (lengthFilter && !matchesLengthFilter(p.words, lengthFilter)) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        // Sort by final deadline (earliest first) - same as Manage Projects
        const dateA = new Date(a.final_deadline || "").getTime();
        const dateB = new Date(b.final_deadline || "").getTime();
        // Handle projects without final_deadline - put them at the end
        if (!a.final_deadline && !b.final_deadline) return 0;
        if (!a.final_deadline) return 1;
        if (!b.final_deadline) return -1;
        return dateA - dateB;
      });
  }, [
    allProjects,
    searchTerm,
    systemFilter,
    dueDateFilter,
    customDueDate,
    sourceLangFilter,
    targetLangFilter,
    lengthFilter,
    assignmentFilter,
  ]);

  const handleSelection = (projectId: number) => {
    const newSelection = new Set(selectedProjects);
    if (newSelection.has(projectId)) {
      newSelection.delete(projectId);
    } else {
      newSelection.add(projectId);
    }
    setSelectedProjects(newSelection);
  };

  const handleConfirmSelection = () => {
    if (selectedProjects.size > 0) {
      setShowUserSelection(true);
    }
  };

  // Assignment mutation - handles per-project translator assignments
  const assignMutation = useMutation({
    mutationFn: async ({
      assignments,
    }: {
      assignments: Map<number, ProjectAssignmentData>;
    }) => {
      // Create assignments for each project with its specific translators
      const dbAssignments: Array<{
        project_id: number;
        user_id: string;
        assignment_status: string;
        initial_message: string | null;
      }> = [];

      assignments.forEach((data, projectId) => {
        data.translatorIds.forEach((translatorId) => {
          dbAssignments.push({
            project_id: projectId,
            user_id: translatorId,
            assignment_status: "unclaimed",
            initial_message: data.messages[translatorId] || null,
          });
        });
      });

      if (dbAssignments.length === 0) {
        throw new Error("No assignments to create");
      }

      const { error } = await supabase
        .from("projects_assignment")
        .insert(dbAssignments);

      if (error) {
        throw new Error(`Failed to assign projects: ${error.message}`);
      }

      return {
        projectCount: assignments.size,
        assignmentCount: dbAssignments.length,
      };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({
        queryKey: ["projects-with-translators"],
      });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      toast.success(
        `Successfully created ${result.assignmentCount} assignment${result.assignmentCount !== 1 ? "s" : ""} across ${result.projectCount} project${result.projectCount !== 1 ? "s" : ""}.`
      );
      setShowUserSelection(false);
      setSelectedProjects(new Set());
    },
    onError: (error: Error) => {
      toast.error(getUserFriendlyError(error, "project assignment"));
    },
  });

  const handleAssign = (assignments: Map<number, ProjectAssignmentData>) => {
    assignMutation.mutate({ assignments });
  };

  const selectedProjectsList = filteredProjects.filter((p) =>
    selectedProjects.has(p.id)
  );

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex justify-center items-center py-12">
          <p className="text-gray-500 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // --- USER SELECTION VIEW ---
  if (showUserSelection) {
    return (
      <TranslatorSelectionView
        selectedProjects={selectedProjectsList}
        onCancel={() => {
          setShowUserSelection(false);
        }}
        onAssign={handleAssign}
      />
    );
  }

  // --- PROJECT SELECTION VIEW ---
  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-gray-900 dark:text-white mb-2">Assign Projects</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Select one or more projects and assign them to a translator
        </p>
      </div>

      {/* Search and Filters - Sticky Header */}
      <div className="sticky top-0 z-40 bg-gray-50 dark:bg-gray-900 backdrop-blur-sm shadow-md mb-6 pt-4 pb-4 -mx-8 px-8 space-y-4">
        <div className="flex flex-wrap gap-4 items-end">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search by project name"
          />

          <div className="flex flex-col gap-1 items-center">
            <span className="text-gray-500 dark:text-gray-400 text-xs">
              View
            </span>
            <ViewToggle view={viewMode} onViewChange={setViewMode} />
          </div>
        </div>

        {/* Individual Filter Dropdowns */}
        <div className="flex justify-between items-start gap-3">
          <div className="flex flex-wrap gap-3 items-start">
            <FilterDropdown
              label="Assignment Status"
              options={["Unassigned", "Assigned"]}
              selected={assignmentFilter}
              onSelect={setAssignmentFilter}
            />
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
              label="Source Language"
              options={uniqueSourceLangs}
              selected={sourceLangFilter}
              onSelect={setSourceLangFilter}
            />
            <FilterDropdown
              label="Target Language"
              options={uniqueTargetLangs}
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
        <ProjectAssignTable
          projects={filteredProjects}
          selectedProjects={selectedProjects}
          onToggleProject={handleSelection}
          onRowClick={handleSelection}
        />
      : <ProjectAssignCard
          projects={filteredProjects}
          selectedProjects={selectedProjects}
          onToggleProject={handleSelection}
        />
      }

      {/* Confirm Button Bar */}
      {selectedProjects.size > 0 && (
        <div
          className={`fixed bottom-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg z-50 transition-all duration-300 ${
            collapsed ? "left-20" : "left-52"
          }`}
        >
          <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-gray-900 dark:text-white">
                <span className="font-semibold">{selectedProjects.size}</span>{" "}
                project{selectedProjects.size !== 1 ? "s" : ""} selected
              </div>
              <button
                onClick={() => setSelectedProjects(new Set())}
                className="px-4 py-2 cursor-pointer bg-gray-100 dark:bg-gray-700 hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors border border-gray-200 dark:border-gray-600 hover:border-red-300 dark:hover:border-red-800"
                type="button"
              >
                Clear selection
              </button>
            </div>
            <button
              onClick={handleConfirmSelection}
              className="px-6 py-3 cursor-pointer bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors shadow-sm"
              type="button"
            >
              Continue with {selectedProjects.size} project
              {selectedProjects.size !== 1 ? "s" : ""}
            </button>
          </div>
        </div>
      )}

      {/* Scroll to Top Button */}
      <ScrollToTopButton />
    </div>
  );
}
