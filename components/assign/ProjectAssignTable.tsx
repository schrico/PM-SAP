"use client";

import { UserCircle } from "lucide-react";
import { formatNumber, formatDate } from "@/utils/formatters";
import { useColorSettings } from "@/hooks/useColorSettings";
import type { Project } from "@/types/project";

interface ProjectWithTranslators extends Project {
  translators: Array<{
    id: string;
    name: string;
    role: string;
    assignment_status: string;
  }>;
}

interface ProjectAssignTableProps {
  projects: ProjectWithTranslators[];
  selectedProjects: Set<number>;
  onToggleProject: (projectId: number) => void;
  onRowClick?: (projectId: number) => void;
}

export function ProjectAssignTable({
  projects,
  selectedProjects,
  onToggleProject,
  onRowClick,
}: ProjectAssignTableProps) {
  const { getSystemColorPreview, getLanguageColorPreview } = useColorSettings();

  const handleRowClick = (projectId: number, e: React.MouseEvent) => {
    // Don't handle clicks on buttons or checkboxes
    if ((e.target as HTMLElement).closest("button")) {
      return;
    }
    const target = e.target as HTMLElement;
    if (
      target.tagName === "INPUT" &&
      target.getAttribute("type") === "checkbox"
    ) {
      return;
    }
    if (onRowClick) {
      onRowClick(projectId);
    }
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

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <th className="px-6 py-4 w-4" />
              <th className="px-6 py-4 text-left text-gray-700 dark:text-gray-300 w-12" />
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
                Translator(s)
              </th>
              <th className="px-6 py-4 text-left text-gray-700 dark:text-gray-300">
                Due Date
              </th>
              <th className="px-6 py-4 text-left text-gray-700 dark:text-gray-300">
                Instructions
              </th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => {
              const isSelected = selectedProjects.has(project.id);
              const dueDate =
                project.final_deadline ||
                project.interim_deadline ||
                project.initial_deadline;

              return (
                <tr
                  key={project.id}
                  className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors cursor-pointer"
                  onClick={(e) => handleRowClick(project.id, e)}
                >
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleProject(project.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="outline-style w-4 h-4 rounded cursor-pointer"
                    />
                  </td>
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
                  <td className="px-6 py-4">
                    {project.translators && project.translators.length > 0 ?
                      <div className="flex flex-wrap gap-2">
                        {project.translators.map((translator, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-1 text-gray-700 dark:text-gray-300 text-xs md:text-sm"
                          >
                            <UserCircle className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                            <span>{translator.name}</span>
                          </div>
                        ))}
                      </div>
                    : <span className="text-gray-400 dark:text-gray-500 text-xs md:text-sm italic">
                        Not assigned
                      </span>
                    }
                  </td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                    {dueDate ? formatDate(dueDate) : "-"}
                  </td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-xs md:text-sm max-w-xs overflow-hidden text-ellipsis">
                    {project.instructions || "-"}
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
