"use client";

import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import { formatNumber, formatDate } from "@/utils/formatters";
import { useColorSettings } from "@/hooks/useColorSettings";
import { useLayoutStore } from "@/lib/stores/useLayoutStore";
import type { ProjectAssignment } from "@/types/project-assignment";

interface MyProjectsTableProps {
  projects: ProjectAssignment[];
  activeTab: "unclaimed" | "inProgress";
  onClaim: (assignment: ProjectAssignment) => void;
  onReject: (projectId: number, projectName: string) => void;
  onDone: (projectId: number, projectName: string) => void;
}

export function MyProjectsTable({
  projects,
  activeTab,
  onClaim,
  onReject,
  onDone,
}: MyProjectsTableProps) {
  const router = useRouter();
  const { getSystemColor, getLanguageColor } = useColorSettings();
  const darkMode = useLayoutStore((state) => state.darkMode);

  const handleRowClick = (projectId: number, e: React.MouseEvent) => {
    // Don't navigate if clicking on a button
    if ((e.target as HTMLElement).closest("button")) {
      return;
    }
    router.push(`/project/${projectId}`);
  };

  // Get system color with proper dark mode handling and transparency
  const getSystemColorStyle = (system: string) => {
    const color = getSystemColor(system);
    // If default white color, make it transparent
    if (color === "#ffffff" || !color || color === "") {
      return { backgroundColor: "transparent" };
    }
    if (color.startsWith("#")) {
      const rgb = hexToRgb(color);
      if (rgb && darkMode) {
        const lightened = blendColors(rgb, { r: 255, g: 255, b: 255 }, 0.3);
        return {
          backgroundColor: `rgb(${lightened.r}, ${lightened.g}, ${lightened.b})`,
        };
      }
      return { backgroundColor: color };
    }
    return {};
  };

  // Get language color for underline
  const getLanguageColorStyle = (langIn: string, langOut: string) => {
    const color = getLanguageColor(langIn || "", langOut || "");
    // If default black color, make it transparent
    if (color === "#000000" || !color || color === "") {
      return { backgroundColor: "transparent" };
    }
    return { backgroundColor: color };
  };

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ?
        {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  };

  const blendColors = (
    color1: { r: number; g: number; b: number },
    color2: { r: number; g: number; b: number },
    ratio: number
  ) => {
    return {
      r: Math.round(color1.r * (1 - ratio) + color2.r * ratio),
      g: Math.round(color1.g * (1 - ratio) + color2.g * ratio),
      b: Math.round(color1.b * (1 - ratio) + color2.b * ratio),
    };
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
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <th className="px-6 py-4 w-4" />
              <th className="px-6 py-4 text-left text-gray-700 dark:text-gray-300">
                System
              </th>
              <th className="px-6 py-4 text-left text-gray-700 dark:text-gray-300">
                Project
              </th>
              <th className="px-6 py-4 text-right text-gray-700 dark:text-gray-300">
                Words
              </th>
              <th className="px-6 py-4 text-right text-gray-700 dark:text-gray-300">
                Lines
              </th>
              <th className="px-6 py-4 text-left text-gray-700 dark:text-gray-300">
                Due Date
              </th>
              <th className="px-6 py-4 text-left text-gray-700 dark:text-gray-300">
                Instructions
              </th>
              <th className="px-6 py-4 text-left text-gray-700 dark:text-gray-300">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedProjects.map((assignment) => {
              const project = assignment.projects;
              const dueDate =
                project.final_deadline ||
                project.interim_deadline ||
                project.initial_deadline;

              return (
                <tr
                  key={`${assignment.project_id}-${assignment.user_id}`}
                  className="group border-b border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors cursor-pointer"
                  onClick={(e) => handleRowClick(project.id, e)}
                >
                  <td className="px-6 py-4">
                    <div className="flex flex-col items-center">
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
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm">
                      {project.system}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-900 dark:text-white">
                    {project.name}
                  </td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300 text-right">
                    {project.words ? formatNumber(project.words) : "-"}
                  </td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300 text-right">
                    {project.lines ? formatNumber(project.lines) : "-"}
                  </td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                    {dueDate ? formatDate(dueDate) : "-"}
                  </td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-xs md:text-sm max-w-xs truncate">
                    {project.instructions || "-"}
                  </td>
                  <td className="px-6 py-4">
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
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
