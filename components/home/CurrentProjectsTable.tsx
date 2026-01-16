"use client";

import { useRouter } from "next/navigation";
import { formatNumber } from "@/utils/formatters";
import { useColorSettings } from "@/hooks/useColorSettings";
import { getSystemColorStyle, getLanguageColorStyle, getStatusIcon } from "@/utils/projectTableHelpers";
import { ProjectTableBase } from "@/components/shared/ProjectTableBase";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { DeadlineDisplay } from "@/components/general/DeadlineDisplay";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ProjectWithTranslators } from "@/types/project";

interface CurrentProjectsTableProps {
  projects: ProjectWithTranslators[];
}

export function CurrentProjectsTable({ projects }: CurrentProjectsTableProps) {
  const router = useRouter();
  const { getSystemColorPreview, getLanguageColorPreview } = useColorSettings();

  // Use shared utility functions for color styles
  const getSystemColorStyleLocal = (system: string) =>
    getSystemColorStyle(system, getSystemColorPreview);
  const getLanguageColorStyleLocal = (langIn: string, langOut: string) =>
    getLanguageColorStyle(langIn, langOut, getLanguageColorPreview);

  const handleRowClick = (project: ProjectWithTranslators) => {
    router.push(`/project/${project.id}`);
  };

  // Use shared utility function for status icon
  const getStatusIconLocal = getStatusIcon;

  const columns = [
    {
      header: "",
      className: "w-4",
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
        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-gray-900 dark:text-blue-400 text-sm">
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
          <TooltipProvider>
            <div className="flex flex-wrap gap-2">
              {project.translators.map((translator) => {
                const statusInfo = getStatusIconLocal(translator.assignment_status);
                const StatusIcon = statusInfo.icon;
                return (
                  <div
                    key={translator.id}
                    className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300 text-xs"
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <StatusIcon
                          className={`w-3.5 h-3.5 ${statusInfo.color} shrink-0`}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{statusInfo.label}</p>
                      </TooltipContent>
                    </Tooltip>
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
                );
              })}
            </div>
          </TooltipProvider>
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
      className: "text-gray-500 dark:text-gray-400 text-xs md:text-sm max-w-xs truncate",
      render: (project: ProjectWithTranslators) => (
        (project as any).custom_instructions || project.instructions || "No instructions"
      ),
    },
  ];

  return (
    <ProjectTableBase
      items={projects}
      columns={columns}
      emptyStateTitle="No current projects found"
      emptyStateSubtitle="Projects with deadlines after today will appear here"
      onRowClick={handleRowClick}
      enablePagination={true}
      itemsPerPage={10}
      getRowKey={(project) => project.id}
    />
  );
}
