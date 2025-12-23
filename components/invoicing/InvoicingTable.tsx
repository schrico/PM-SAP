"use client";

import { formatDate } from "@/utils/formatters";
import { useColorSettings } from "@/hooks/useColorSettings";
import type { ProjectWithTranslators } from "@/types/project";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";

interface InvoicingTableProps {
  projects: ProjectWithTranslators[];
  selectedProjects: Set<number>;
  onRowClick: (id: number, e: React.MouseEvent) => void;
  onSelection: (projectId: number) => void;
}

export function InvoicingTable({
  projects,
  selectedProjects,
  onRowClick,
  onSelection,
}: InvoicingTableProps) {
  const { getSystemColorPreview } = useColorSettings();

  // Get system color style using preview hex for the color indicator
  const getSystemColorStyle = (system: string) => {
    const color = getSystemColorPreview(system);
    if (color === "transparent" || !color) {
      return { backgroundColor: "transparent" };
    }
    return { backgroundColor: color };
  };

  // Get closest deadline
  const getClosestDeadline = (project: ProjectWithTranslators) => {
    const deadlines = [
      project.final_deadline,
      project.interim_deadline,
      project.initial_deadline,
    ].filter(Boolean) as string[];
    if (deadlines.length === 0) return null;
    return deadlines.sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime()
    )[0];
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <th className="px-6 py-4 w-4"></th>
              <th className="px-6 py-4 text-left text-gray-700 dark:text-gray-300 w-12"></th>
              <th className="px-6 py-4 text-left text-gray-700 dark:text-gray-300">
                System
              </th>
              <th className="px-6 py-4 text-left text-gray-700 dark:text-gray-300">
                Project
              </th>
              <th className="px-6 py-4 text-center text-gray-700 dark:text-gray-300">
                Invoiced
              </th>
              <th className="px-6 py-4 text-center text-gray-700 dark:text-gray-300">
                Paid
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
              const deadline = getClosestDeadline(project);
              return (
                <tr
                  key={project.id}
                  className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors cursor-pointer"
                  onClick={(e) => onRowClick(project.id, e)}
                >
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedProjects.has(project.id)}
                      onChange={() => onSelection(project.id)}
                      className="outline-style w-4 h-4 rounded cursor-pointer"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div
                      className="w-3 h-3 rounded"
                      style={getSystemColorStyle(project.system)}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm">
                      {project.system}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-900 dark:text-white">
                    {project.name}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-lg text-sm ${
                        project.invoiced ?
                          "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {project.invoiced ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-lg text-sm ${
                        project.paid ?
                          "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {project.paid ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {project.translators.length > 0 ?
                      <div className="flex flex-wrap gap-2">
                        {project.translators.map((translator) => (
                          <div
                            key={translator.id}
                            className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300 text-xs"
                          >
                            <ProfileAvatar
                              name={translator.name}
                              avatar={translator.avatar}
                              size="xs"
                              showEditButton={false}
                            />
                            <span>
                              {translator.short_name || translator.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    : <span className="text-gray-400 dark:text-gray-500 text-xs italic">
                        Not assigned
                      </span>
                    }
                  </td>
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                    {deadline ? formatDate(deadline) : "N/A"}
                  </td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-sm max-w-xs truncate">
                    {project.instructions || "No instructions"}
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
