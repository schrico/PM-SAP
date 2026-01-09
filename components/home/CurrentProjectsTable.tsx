"use client";

import { useRouter } from "next/navigation";
import { LayoutGrid, Circle, Clock, CheckCircle2, XCircle } from "lucide-react";
import { formatNumber } from "@/utils/formatters";
import { useColorSettings } from "@/hooks/useColorSettings";
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

  const handleRowClick = (id: number) => {
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

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <th className="px-6 py-4 w-4" />
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
            {projects.length > 0 ?
              projects.map((project) => {
                return (
                  <tr
                    key={project.id}
                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors cursor-pointer"
                    onClick={() => handleRowClick(project.id)}
                  >
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
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-gray-900 dark:text-blue-400 text-sm">
                        {project.system}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-900 dark:text-white">
                      {project.name}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-700 dark:text-gray-300">
                      {project.words ? formatNumber(project.words) : "-"}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-700 dark:text-gray-300">
                      {project.lines ? formatNumber(project.lines) : "-"}
                    </td>
                    <td className="px-6 py-4">
                      {project.translators && project.translators.length > 0 ?
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
                        </span>
                      }
                    </td>
                    <td className="px-6 py-4">
                      <DeadlineDisplay
                        initialDeadline={project.initial_deadline}
                        interimDeadline={project.interim_deadline}
                        finalDeadline={project.final_deadline}
                      />
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-xs md:text-sm max-w-xs truncate">
                      {project.instructions || "No instructions"}
                    </td>
                  </tr>
                );
              })
            : <tr>
                <td colSpan={8} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <LayoutGrid className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400">
                      No current projects found
                    </p>
                    <p className="text-gray-400 dark:text-gray-500 text-sm">
                      Projects with deadlines after today will appear here
                    </p>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}
