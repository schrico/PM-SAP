"use client";

import { formatNumber } from "@/utils/formatters";
import { useColorSettings } from "@/hooks/useColorSettings";
import { getSystemColorStyle, getLanguageColorStyle } from "@/utils/projectTableHelpers";
import { ProjectTableBase } from "@/components/shared/ProjectTableBase";
import { DeadlineDisplay } from "@/components/general/DeadlineDisplay";
import { UserCircle } from "lucide-react";
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

  // Use shared utility functions for color styles
  const getSystemColorStyleLocal = (system: string) =>
    getSystemColorStyle(system, getSystemColorPreview);
  const getLanguageColorStyleLocal = (langIn: string, langOut: string) =>
    getLanguageColorStyle(langIn, langOut, getLanguageColorPreview);

  const handleRowClick = (project: ProjectWithTranslators, e: React.MouseEvent) => {
    // Don't handle clicks on buttons or checkboxes
    const target = e.target as HTMLElement;
    if (
      target.closest("button") ||
      (target.tagName === "INPUT" && target.getAttribute("type") === "checkbox")
    ) {
      return;
    }
    if (onRowClick) {
      onRowClick(project.id);
    }
  };

  const columns = [
    {
      header: "",
      className: "w-12",
      render: (project: ProjectWithTranslators) => (
        <div className="flex flex-col items-center">
          <div
            className="w-3 h-3 rounded"
            style={getSystemColorStyleLocal(project.system)}
          />
          <div
            className="w-3 h-0.5 mt-0.5"
            style={getLanguageColorStyleLocal(
              project.language_in || "",
              project.language_out || ""
            )}
          />
        </div>
      ),
    },
    {
      header: "System",
      render: (project: ProjectWithTranslators) => (
        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm">
          {project.system}
        </span>
      ),
    },
    {
      header: "Project",
      render: (project: ProjectWithTranslators) => (
        <span className="text-gray-900 dark:text-white">{project.name}</span>
      ),
    },
    {
      header: "Words",
      className: "text-right",
      render: (project: ProjectWithTranslators) => (
        <span className="text-gray-700 dark:text-gray-300">
          {project.words ? formatNumber(project.words) : "-"}
        </span>
      ),
    },
    {
      header: "Lines",
      className: "text-right",
      render: (project: ProjectWithTranslators) => (
        <span className="text-gray-700 dark:text-gray-300">
          {project.lines ? formatNumber(project.lines) : "-"}
        </span>
      ),
    },
    {
      header: "Translator(s)",
      render: (project: ProjectWithTranslators) =>
        project.translators && project.translators.length > 0 ?
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
          </span>,
    },
    {
      header: "Due Date",
      render: (project: ProjectWithTranslators) => (
        <DeadlineDisplay
          initialDeadline={project.initial_deadline}
          interimDeadline={project.interim_deadline}
          finalDeadline={project.final_deadline}
        />
      ),
    },
    {
      header: "Instructions",
      className: "text-gray-500 dark:text-gray-400 text-xs md:text-sm max-w-xs overflow-hidden text-ellipsis",
      render: (project: ProjectWithTranslators) => (
        project.instructions || "-"
      ),
    },
  ];

  return (
    <ProjectTableBase
      items={projects}
      columns={columns}
      emptyStateTitle="No projects found"
      onRowClick={handleRowClick}
      enablePagination={true}
      itemsPerPage={10}
      className="mb-6"
      getRowKey={(project) => project.id}
      leadingColumn={(project) => (
        <input
          type="checkbox"
          checked={selectedProjects.has(project.id)}
          onChange={() => onToggleProject(project.id)}
          onClick={(e) => e.stopPropagation()}
          className="outline-style w-4 h-4 rounded cursor-pointer"
        />
      )}
    />
  );
}
