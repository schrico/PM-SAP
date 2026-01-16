"use client";

import { useColorSettings } from "@/hooks/useColorSettings";
import { getSystemColorStyle } from "@/utils/projectTableHelpers";
import type { ProjectWithTranslators } from "@/types/project";
import { DeadlineDisplay } from "@/components/general/DeadlineDisplay";

interface InvoicingCardProps {
  projects: ProjectWithTranslators[];
  selectedProjects: Set<number>;
  onSelection: (projectId: number) => void;
}

export function InvoicingCard({
  projects,
  selectedProjects,
  onSelection,
}: InvoicingCardProps) {
  const { getSystemColorPreview } = useColorSettings();

  // Use shared utility function for color style
  const getSystemColorStyleLocal = (system: string) =>
    getSystemColorStyle(system, getSystemColorPreview);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
      {projects.map((project) => {
        const isSelected = selectedProjects.has(project.id);
        return (
          <div
            key={project.id}
            className={`p-6 bg-white dark:bg-gray-800 rounded-2xl border transition-all duration-200 cursor-pointer ${
              isSelected ?
                "border-blue-500 shadow-lg dark:shadow-blue-500/20"
              : "border-gray-200 dark:border-gray-700 hover:shadow-lg dark:hover:shadow-blue-500/20 dark:hover:border-blue-500/50"
            }`}
            onClick={(e) => {
              const target = e.target as HTMLElement;
              if (
                target.tagName === "INPUT" &&
                target.getAttribute("type") === "checkbox"
              ) {
                return;
              }
              onSelection(project.id);
            }}
          >
            <div className="flex items-start gap-4 mb-4">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onSelection(project.id)}
                className="outline-style w-4 h-4 mt-1 rounded cursor-pointer"
                onClick={(e) => e.stopPropagation()}
              />
              <div
                className="w-3 h-3 mt-1 rounded shrink-0"
                style={getSystemColorStyleLocal(project.system)}
              />
              <div className="flex-1 min-w-0">
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm mb-2">
                  {project.system}
                </span>
              </div>
            </div>

            <h3 className="text-gray-900 dark:text-white mb-4">
              {project.name}
            </h3>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400 text-sm">
                  Invoiced
                </span>
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-lg text-sm ${
                    project.invoiced ?
                      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                  }`}
                >
                  {project.invoiced ? "Yes" : "No"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400 text-sm">
                  Paid
                </span>
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-lg text-sm ${
                    project.paid ?
                      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                  }`}
                >
                  {project.paid ? "Yes" : "No"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400 text-sm">
                  Due Date
                </span>
                <DeadlineDisplay
                  initialDeadline={project.initial_deadline}
                  interimDeadline={project.interim_deadline}
                  finalDeadline={project.final_deadline}
                />
              </div>
            </div>

            <div className="mb-3">
              <span className="text-gray-500 dark:text-gray-400 text-sm block mb-1">
                Translator(s)
              </span>
              {project.translators.length > 0 ?
                <div className="text-gray-700 dark:text-gray-300 text-sm">
                  {project.translators.map((t) => t.name).join(", ")}
                </div>
              : <span className="text-gray-400 dark:text-gray-500 text-sm italic">
                  Not assigned
                </span>
              }
            </div>

            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
              <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2">
                {(project as any).custom_instructions || project.instructions || "No instructions"}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
