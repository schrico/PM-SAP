"use client";

import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import { formatNumber, formatDate } from "@/utils/formatters";
import { useColorSettings } from "@/hooks/useColorSettings";
import type { ProjectAssignment } from "@/types/project-assignment";

interface MyProjectsCardProps {
  projects: ProjectAssignment[];
  activeTab: "unclaimed" | "inProgress";
  onClaim: (assignment: ProjectAssignment) => void;
  onReject: (projectId: number, projectName: string) => void;
  onDone: (projectId: number, projectName: string) => void;
}

export function MyProjectsCard({
  projects,
  activeTab,
  onClaim,
  onReject,
  onDone,
}: MyProjectsCardProps) {
  const router = useRouter();
  const { getSystemColorPreview, getLanguageColorPreview } = useColorSettings();

  const handleCardClick = (projectId: number, e: React.MouseEvent) => {
    // Don't navigate if clicking on a button
    if ((e.target as HTMLElement).closest("button")) {
      return;
    }
    router.push(`/project/${projectId}`);
  };

  // Get system color style using preview hex for the color indicator
  const getSystemColorStyle = (system: string) => {
    const color = getSystemColorPreview(system);
    if (color === "transparent" || !color) {
      return { backgroundColor: "transparent" };
    }
    return { backgroundColor: color };
  };

  // Get language color for underline using preview hex
  const getLanguageColorStyle = (langIn: string, langOut: string) => {
    const color = getLanguageColorPreview(langIn || "", langOut || "");
    if (color === "transparent" || !color) {
      return { backgroundColor: "transparent" };
    }
    return { backgroundColor: color };
  };

  // Sort projects by due date (earliest first)
  const sortedProjects = [...projects].sort((a, b) => {
    const dateA =
      a.projects.final_deadline ||
      a.projects.interim_deadline ||
      a.projects.initial_deadline ||
      "";
    const dateB =
      b.projects.final_deadline ||
      b.projects.interim_deadline ||
      b.projects.initial_deadline ||
      "";
    if (!dateA && !dateB) return 0;
    if (!dateA) return 1;
    if (!dateB) return -1;
    return new Date(dateA).getTime() - new Date(dateB).getTime();
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sortedProjects.map((assignment) => {
        const project = assignment.projects;
        const dueDate =
          project.final_deadline ||
          project.interim_deadline ||
          project.initial_deadline;

        return (
          <div
            key={`${assignment.project_id}-${assignment.user_id}`}
            className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 cursor-pointer hover:shadow-lg dark:hover:shadow-blue-500/20 dark:hover:border-blue-500/50 transition-all"
            onClick={(e) => handleCardClick(project.id, e)}
          >
            <div className="flex items-center mb-4">
              <div className="flex flex-col items-center shrink-0 mr-2">
                <div
                  className="w-3 h-3 rounded"
                  style={getSystemColorStyle(project.system)}
                />
                <div
                  className="w-3 h-0.5 mt-0.5"
                  style={getLanguageColorStyle(
                    project.language_in || "",
                    project.language_out || ""
                  )}
                />
              </div>
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs md:text-sm">
                {project.system}
              </span>
            </div>
            <h3 className="text-gray-900 dark:text-white text-lg font-bold mb-2">
              {project.name}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">
              Words: {project.words ? formatNumber(project.words) : "-"}
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">
              Lines: {project.lines ? formatNumber(project.lines) : "-"}
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">
              Due Date: {dueDate ? formatDate(dueDate) : "-"}
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs truncate mb-4">
              {project.instructions || "-"}
            </p>
            {activeTab === "unclaimed" ?
              <div className="flex gap-2 group-hover:scale-110 group-hover:opacity-100 opacity-90 transition-all duration-200">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onClaim(assignment);
                  }}
                  className="inline-flex cursor-pointer items-center gap-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-all text-sm hover:bg-blue-500 dark:hover:bg-blue-600 hover:text-white dark:hover:text-white hover:shadow-lg hover:scale-105 border border-gray-200 dark:border-gray-600 shadow-sm group-hover:shadow-md"
                  type="button"
                >
                  <Check className="w-4 h-4" />
                  Claim
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onReject(project.id, project.name);
                  }}
                  className="inline-flex cursor-pointer items-center gap-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-all text-sm hover:bg-red-500 dark:hover:bg-red-600 hover:text-white dark:hover:text-white hover:shadow-lg hover:scale-105 border border-gray-200 dark:border-gray-600 shadow-sm group-hover:shadow-md"
                  type="button"
                >
                  <X className="w-4 h-4" />
                  Refuse
                </button>
              </div>
            : <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDone(project.id, project.name);
                }}
                className="inline-flex cursor-pointer items-center gap-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-all text-sm hover:bg-green-500 dark:hover:bg-green-600 hover:text-white dark:hover:text-white hover:shadow-lg hover:scale-105 border border-gray-200 dark:border-gray-600 shadow-sm group-hover:scale-110 group-hover:opacity-100 opacity-90 group-hover:shadow-md duration-200"
                type="button"
              >
                <Check className="w-4 h-4" />
                Done
              </button>
            }
          </div>
        );
      })}
    </div>
  );
}
