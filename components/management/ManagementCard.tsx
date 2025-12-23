"use client";

import { useRouter } from "next/navigation";
import { Circle, Clock, CheckCircle2, XCircle } from "lucide-react";
import { formatNumber, formatDate } from "@/utils/formatters";
import { useColorSettings } from "@/hooks/useColorSettings";
import { ProjectActionsMenu } from "./ProjectActionsMenu";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
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
}: ManagementCardProps) {
  const router = useRouter();
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

  const handleCardClick = (id: number, e: React.MouseEvent) => {
    // Don't navigate if clicking on a button or menu
    if ((e.target as HTMLElement).closest("button")) {
      return;
    }
    router.push(`/project/${id}`);
  };

  // Get status icon and label for translator assignment
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "claimed":
        return {
          icon: Clock,
          color: "text-blue-500",
          label: "In Progress",
        };
      case "done":
        return {
          icon: CheckCircle2,
          color: "text-green-500",
          label: "Done",
        };
      case "rejected":
        return {
          icon: XCircle,
          color: "text-red-500",
          label: "Rejected",
        };
      default: // unclaimed
        return {
          icon: Circle,
          color: "text-gray-400",
          label: "Unclaimed",
        };
    }
  };

  const getClosestDeadline = (
    project: ProjectWithTranslators
  ): string | null => {
    const validDates = [project.final_deadline]
      .filter(Boolean)
      .map((d) => {
        const date = new Date(d!);
        return isNaN(date.getTime()) ? null : d;
      })
      .filter(Boolean);

    if (validDates.length === 0) return null;
    return validDates[0] as string;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {projects.map((project) => {
        const dueDate = getClosestDeadline(project);
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
            <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
              Words: {project.words ? formatNumber(project.words) : "-"}, Lines:{" "}
              {project.lines ? formatNumber(project.lines) : "-"}
            </p>

            <div className="mt-2">
              {project.translators.length > 0 ?
                <TooltipProvider>
                  <div className="flex flex-wrap gap-2">
                    {project.translators.map((translator) => {
                      const statusInfo = getStatusIcon(translator.assignment_status);
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

            <p className="text-gray-700 dark:text-gray-300 text-xs md:text-sm mt-2">
              Due Date: {dueDate ? formatDate(dueDate) : "-"}
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm max-w-xs truncate mt-1">
              Instructions: {project.instructions || "No instructions"}
            </p>
          </div>
        );
      })}
    </div>
  );
}
