"use client";

import { useRouter } from "next/navigation";
import { Check, XCircle } from "lucide-react";
import { formatNumber } from "@/utils/formatters";
import { useColorSettings } from "@/hooks/useColorSettings";
import { getSystemColorStyle, getLanguageColorStyle, getStatusIcon } from "@/utils/projectTableHelpers";
import { ProjectTableBase } from "@/components/shared/ProjectTableBase";
import { ProjectActionsMenu } from "./ProjectActionsMenu";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { DeadlineDisplay } from "@/components/general/DeadlineDisplay";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ProjectWithTranslators {
  id: number;
  name: string;
  system: string;
  words: number | null;
  lines: number | null;
  translators: Array<{
    id: string;
    name: string;
    short_name?: string | null;
    role: string;
    assignment_status: string;
    avatar?: string | null;
  }>;
  initial_deadline: string | null;
  interim_deadline: string | null;
  final_deadline: string | null;
  instructions?: string | null;
  status: "complete" | "active" | "cancelled";
  language_in: string;
  language_out: string;
}

interface ManagementTableProps {
  projects: ProjectWithTranslators[];
  openMenu: string | null;
  onMenuToggle: (projectId: string | null) => void;
  onAddTranslator: (projectId: number) => void;
  onRemoveTranslator: (projectId: number) => void;
  onDuplicate: (projectId: number) => void;
  onEditDetails: (projectId: number) => void;
  onCompleteProject: (projectId: number) => void;
  activeTab: "all" | "ready" | "inProgress" | "unclaimed";
  // Words/Lines editing props
  editingProjectId: number | null;
  editWords: string;
  editLines: string;
  onEditWordsChange: (value: string) => void;
  onEditLinesChange: (value: string) => void;
  onStartWordsLinesEdit: (
    projectId: number,
    words: number | null,
    lines: number | null
  ) => void;
  onSaveWordsLines: (projectId: number) => void;
  onCancelWordsLinesEdit: () => void;
  isUpdatingWordsLines: boolean;
}

export function ManagementTable({
  projects,
  openMenu,
  onMenuToggle,
  onAddTranslator,
  onRemoveTranslator,
  onDuplicate,
  onEditDetails,
  onCompleteProject,
  editingProjectId,
  editWords,
  editLines,
  onEditWordsChange,
  onEditLinesChange,
  onStartWordsLinesEdit,
  onSaveWordsLines,
  onCancelWordsLinesEdit,
  isUpdatingWordsLines,
}: ManagementTableProps) {
  const router = useRouter();
  const { getSystemColorPreview, getLanguageColorPreview } = useColorSettings();

  // Use shared utility functions for color styles
  const getSystemColorStyleLocal = (system: string) =>
    getSystemColorStyle(system, getSystemColorPreview);
  const getLanguageColorStyleLocal = (langIn: string, langOut: string) =>
    getLanguageColorStyle(langIn, langOut, getLanguageColorPreview);

  const handleRowClick = (project: ProjectWithTranslators, e: React.MouseEvent) => {
    // Don't navigate if clicking on a button or menu
    if ((e.target as HTMLElement).closest("button")) {
      return;
    }
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
        <div onClick={(e) => e.stopPropagation()}>
          {editingProjectId === project.id ?
            <input
              type="number"
              value={editWords}
              onChange={(e) => onEditWordsChange(e.target.value)}
              className="w-20 px-2 py-1 text-sm text-right border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              min="0"
            />
          : <button
              onClick={() =>
                onStartWordsLinesEdit(
                  project.id,
                  project.words,
                  project.lines
                )
              }
              className="text-sm text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 cursor-pointer"
              type="button"
            >
              {project.words ? formatNumber(project.words) : "-"}
            </button>
          }
        </div>
      ),
    },
    {
      header: "Lines",
      className: "text-right",
      render: (project: ProjectWithTranslators) => (
        <div onClick={(e) => e.stopPropagation()}>
          {editingProjectId === project.id ?
            <div className="flex items-center justify-end gap-2">
              <input
                type="number"
                value={editLines}
                onChange={(e) => onEditLinesChange(e.target.value)}
                className="w-20 px-2 py-1 text-sm text-right border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                min="0"
              />
              <button
                onClick={() => onSaveWordsLines(project.id)}
                disabled={isUpdatingWordsLines}
                className="p-1 text-green-600 hover:text-green-700 hover:scale-125 transition-transform disabled:opacity-50"
                type="button"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={onCancelWordsLinesEdit}
                className="p-1 text-red-600 hover:text-red-700 hover:scale-125 transition-transform"
                type="button"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>
          : <button
              onClick={() =>
                onStartWordsLinesEdit(
                  project.id,
                  project.words,
                  project.lines
                )
              }
              className="text-sm text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 cursor-pointer"
              type="button"
            >
              {project.lines ? formatNumber(project.lines) : "-"}
            </button>
          }
        </div>
      ),
    },
    {
      header: "Translator(s)",
      render: (project: ProjectWithTranslators) =>
        project.translators.length > 0 ?
          <TooltipProvider>
            <div className="flex flex-wrap gap-2">
              {project.translators.map((translator) => {
                const statusInfo = getStatusIconLocal(
                  translator.assignment_status
                );
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
        project.instructions || "No instructions"
      ),
    },
    {
      header: "Actions",
      render: (project: ProjectWithTranslators) => (
        <div onClick={(e) => e.stopPropagation()}>
          <ProjectActionsMenu
            projectId={project.id}
            isOpen={openMenu === String(project.id)}
            translators={project.translators}
            onToggle={() =>
              onMenuToggle(
                openMenu === String(project.id) ? null : String(project.id)
              )
            }
            onAddTranslator={() => onAddTranslator(project.id)}
            onRemoveTranslator={() => onRemoveTranslator(project.id)}
            onDuplicate={() => onDuplicate(project.id)}
            onEditDetails={() => onEditDetails(project.id)}
            onCompleteProject={() => onCompleteProject(project.id)}
          />
        </div>
      ),
    },
  ];

  return (
    <ProjectTableBase
      items={projects}
      columns={columns}
      emptyStateTitle="No projects found in this category"
      emptyStateSubtitle="Try adjusting your filters or check another tab"
      onRowClick={handleRowClick}
      enablePagination={true}
      itemsPerPage={10}
      getRowKey={(project) => project.id}
    />
  );
}
