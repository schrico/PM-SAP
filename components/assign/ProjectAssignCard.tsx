"use client";

import { UserCircle } from "lucide-react";
import { formatNumber } from "@/utils/formatters";
import { useColorSettings } from "@/hooks/useColorSettings";
import { DeadlineDisplay } from "@/components/general/DeadlineDisplay";
import type { Project } from "@/types/project";

interface ProjectWithTranslators extends Project {
  translators: Array<{
    id: string;
    name: string;
    role: string;
    assignment_status: string;
  }>;
}

interface ProjectAssignCardProps {
  projects: ProjectWithTranslators[];
  selectedProjects: Set<number>;
  onToggleProject: (projectId: number) => void;
}

export function ProjectAssignCard({
  projects,
  selectedProjects,
  onToggleProject,
}: ProjectAssignCardProps) {
  const { getSystemColorPreview, getLanguageColorPreview } = useColorSettings();

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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
      {projects.map((project) => {
        const isSelected = selectedProjects.has(project.id);

        return (
          <div
            key={project.id}
            className={`p-6 bg-white dark:bg-gray-800 rounded-2xl border transition-all duration-200 cursor-pointer ${
              isSelected ?
                "border-blue-500 shadow-lg"
              : "border-gray-200 dark:border-gray-700 hover:shadow-lg"
            }`}
            onClick={(e) => {
              const target = e.target as HTMLElement;
              if (
                target.tagName === "INPUT" &&
                target.getAttribute("type") === "checkbox"
              ) {
                return;
              }
              onToggleProject(project.id);
            }}
          >
            <div className="flex items-start gap-4 mb-4">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onToggleProject(project.id)}
                onClick={(e) => e.stopPropagation()}
                className="outline-style w-4 h-4 mt-1 rounded cursor-pointer"
              />
              <div className="flex flex-col items-center shrink-0 mt-1">
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
              <div className="flex-1 min-w-0">
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm mb-2">
                  {project.system}
                </span>
              </div>
            </div>

            <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">
              {project.name}
            </h3>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400 text-xs">
                  Words
                </span>
                <span className="text-gray-900 dark:text-white text-sm">
                  {project.words ? formatNumber(project.words) : "-"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400 text-xs">
                  Lines
                </span>
                <span className="text-gray-900 dark:text-white text-sm">
                  {project.lines ? formatNumber(project.lines) : "-"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400 text-xs">
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
              <span className="text-gray-500 dark:text-gray-400 text-xs block mb-1">
                Translator(s)
              </span>
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
            </div>

            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
              <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm max-h-12 overflow-hidden text-ellipsis">
                {project.instructions || "-"}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
