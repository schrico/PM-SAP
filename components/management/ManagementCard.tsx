"use client";

import { useRouter } from "next/navigation";
import { Check, XCircle } from "lucide-react";
import { formatNumber } from "@/utils/formatters";
import { useColorSettings } from "@/hooks/useColorSettings";
import { getSystemColorStyle, getLanguageColorStyle, getStatusIcon } from "@/utils/projectTableHelpers";
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

interface ManagementCardProps {
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
  onStartWordsLinesEdit: (projectId: number, words: number | null, lines: number | null) => void;
  onSaveWordsLines: (projectId: number) => void;
  onCancelWordsLinesEdit: () => void;
  isUpdatingWordsLines: boolean;
}

export function ManagementCard({
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
}: ManagementCardProps) {
  const router = useRouter();
  const { getSystemColorPreview, getLanguageColorPreview } = useColorSettings();

  // Use shared utility functions for color styles
  const getSystemColorStyleLocal = (system: string) =>
    getSystemColorStyle(system, getSystemColorPreview);
  const getLanguageColorStyleLocal = (langIn: string, langOut: string) =>
    getLanguageColorStyle(langIn, langOut, getLanguageColorPreview);

  const handleCardClick = (id: number, e: React.MouseEvent) => {
    // Don't navigate if clicking on a button or menu
    if ((e.target as HTMLElement).closest("button")) {
      return;
    }
    router.push(`/project/${id}`);
  };

  // Use shared utility function for status icon
  const getStatusIconLocal = getStatusIcon;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {projects.map((project) => {
        return (
          <div
            key={project.id}
            className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 cursor-pointer hover:shadow-lg dark:hover:shadow-blue-500/20 dark:hover:border-blue-500/50 transition-all"
            onClick={(e) => handleCardClick(project.id, e)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex flex-col items-center mr-2">
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
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs md:text-sm">
                  {project.system}
                </span>
              </div>
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

            <h3 className="text-gray-900 dark:text-white text-sm font-bold mt-2">
              {project.name}
            </h3>
            <div className="text-gray-500 dark:text-gray-400 text-xs mt-1" onClick={(e) => e.stopPropagation()}>
              {editingProjectId === project.id ? (
                <div className="flex items-center gap-2 flex-wrap">
                  <span>Words:</span>
                  <input
                    type="number"
                    value={editWords}
                    onChange={(e) => onEditWordsChange(e.target.value)}
                    className="w-16 px-1.5 py-0.5 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    min="0"
                  />
                  <span>Lines:</span>
                  <input
                    type="number"
                    value={editLines}
                    onChange={(e) => onEditLinesChange(e.target.value)}
                    className="w-16 px-1.5 py-0.5 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    min="0"
                  />
                  <button
                    onClick={() => onSaveWordsLines(project.id)}
                    disabled={isUpdatingWordsLines}
                    className="p-0.5 text-green-600 hover:text-green-700 hover:scale-125 transition-transform disabled:opacity-50"
                    type="button"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={onCancelWordsLinesEdit}
                    className="p-0.5 text-red-600 hover:text-red-700 hover:scale-125 transition-transform"
                    type="button"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => onStartWordsLinesEdit(project.id, project.words, project.lines)}
                  className="hover:text-blue-500 dark:hover:text-blue-400 cursor-pointer"
                  type="button"
                >
                  Words: {project.words ? formatNumber(project.words) : "-"}, Lines:{" "}
                  {project.lines ? formatNumber(project.lines) : "-"}
                </button>
              )}
            </div>

            <div className="mt-2">
              {project.translators.length > 0 ?
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
                              <StatusIcon className={`w-3.5 h-3.5 ${statusInfo.color} shrink-0`} />
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
                          <span>{translator.short_name || translator.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </TooltipProvider>
              : <span className="text-gray-400 dark:text-gray-500 text-xs italic">
                  Not assigned
                </span>
              }
            </div>

            <div className="text-gray-700 dark:text-gray-300 text-xs md:text-sm mt-2 flex items-center gap-1">
              <span>Due Date:</span>
              <DeadlineDisplay
                initialDeadline={project.initial_deadline}
                interimDeadline={project.interim_deadline}
                finalDeadline={project.final_deadline}
              />
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm max-w-xs truncate mt-1">
              Instructions: {project.instructions || "No instructions"}
            </p>
          </div>
        );
      })}
    </div>
  );
}
