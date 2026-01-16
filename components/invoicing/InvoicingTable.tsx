"use client";

import { useColorSettings } from "@/hooks/useColorSettings";
import { getSystemColorStyle } from "@/utils/projectTableHelpers";
import { ProjectTableBase } from "@/components/shared/ProjectTableBase";
import type { ProjectWithTranslators } from "@/types/project";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { DeadlineDisplay } from "@/components/general/DeadlineDisplay";

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

  // Use shared utility function for color style
  const getSystemColorStyleLocal = (system: string) =>
    getSystemColorStyle(system, getSystemColorPreview);

  const handleRowClick = (project: ProjectWithTranslators, e: React.MouseEvent) => {
    onRowClick(project.id, e);
  };

  const columns = [
    {
      header: "",
      className: "w-12",
      render: (project: ProjectWithTranslators) => (
        <div
          className="w-3 h-3 rounded"
          style={getSystemColorStyleLocal(project.system)}
        />
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
      header: "Invoiced",
      className: "text-center",
      render: (project: ProjectWithTranslators) => (
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-lg text-sm ${
            project.invoiced ?
              "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
            : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
          }`}
        >
          {project.invoiced ? "Yes" : "No"}
        </span>
      ),
    },
    {
      header: "Paid",
      className: "text-center",
      render: (project: ProjectWithTranslators) => (
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-lg text-sm ${
            project.paid ?
              "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
            : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
          }`}
        >
          {project.paid ? "Yes" : "No"}
        </span>
      ),
    },
    {
      header: "Translator(s)",
      render: (project: ProjectWithTranslators) =>
        project.translators.length > 0 ?
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
      className: "text-gray-500 dark:text-gray-400 text-sm max-w-xs truncate",
      render: (project: ProjectWithTranslators) => (
        (project as any).custom_instructions || project.instructions || "No instructions"
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
      stickyHeader={true}
      className="mb-6"
      getRowKey={(project) => project.id}
      leadingColumn={(project) => (
        <input
          type="checkbox"
          checked={selectedProjects.has(project.id)}
          onChange={() => onSelection(project.id)}
          className="outline-style w-4 h-4 rounded cursor-pointer"
          onClick={(e) => e.stopPropagation()}
        />
      )}
    />
  );
}
