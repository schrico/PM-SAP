"use client";

import { useState, useMemo } from "react";
import { X, Clock, CheckCircle2, AlertTriangle } from "lucide-react";
import { formatNumber } from "@/utils/formatters";
import { useUsers } from "@/hooks/useUsers";
import { useUserWorkload } from "@/hooks/useUserWorkload";
import type { Project } from "@/types/project";
import type { User } from "@/types/user";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import { DeadlineDisplay } from "@/components/general/DeadlineDisplay";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ProjectWithTranslators extends Project {
  translators: Array<{
    id: string;
    name: string;
    role: string;
    assignment_status: string;
  }>;
}

interface TranslatorSelectionViewProps {
  selectedProjects: ProjectWithTranslators[];
  onCancel: () => void;
  onAssign: (
    selectedTranslatorIds: Set<string>,
    messages: Record<string, string>
  ) => void;
}

export function TranslatorSelectionView({
  selectedProjects,
  onCancel,
  onAssign,
}: TranslatorSelectionViewProps) {
  const { data: users = [], isLoading } = useUsers();
  const { workloads, isLoading: workloadsLoading } = useUserWorkload();
  const [selectedTranslators, setSelectedTranslators] = useState<Set<string>>(
    new Set()
  );
  const [translatorMessages, setTranslatorMessages] = useState<
    Record<string, string>
  >({});

  const handleTranslatorToggle = (userId: string) => {
    const newSelection = new Set(selectedTranslators);
    if (newSelection.has(userId)) {
      newSelection.delete(userId);
      const newMessages = { ...translatorMessages };
      delete newMessages[userId];
      setTranslatorMessages(newMessages);
    } else {
      newSelection.add(userId);
    }
    setSelectedTranslators(newSelection);
  };

  const handleMessageChange = (userId: string, message: string) => {
    setTranslatorMessages((prev) => ({ ...prev, [userId]: message }));
  };

  const handleAssignClick = () => {
    onAssign(selectedTranslators, translatorMessages);
  };

  // Get all user IDs that are already assigned to any of the selected projects
  const assignedUserIds = useMemo(() => {
    const assignedIds = new Set<string>();
    selectedProjects.forEach((project) => {
      if (project.translators && project.translators.length > 0) {
        project.translators.forEach((translator) => {
          assignedIds.add(translator.id);
        });
      }
    });
    return assignedIds;
  }, [selectedProjects]);

  // Filter out users who are already assigned to any of the selected projects
  // Allow all users to be selected, except those already assigned
  const availableUsers = useMemo(() => {
    return users.filter((user) => !assignedUserIds.has(user.id));
  }, [users, assignedUserIds]);

  if (isLoading || workloadsLoading) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex justify-center items-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            Loading translators...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 dark:text-white mb-2">
            Assign to Translator
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Select one or more translators for {selectedProjects.length}{" "}
            selected project{selectedProjects.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={onCancel}
          className="px-5 py-2.5 cursor-pointer text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors flex items-center gap-2 border border-gray-200 dark:border-gray-700"
          type="button"
        >
          <X className="w-5 h-5" />
          Cancel
        </button>
      </div>

      {/* Selected Projects Summary */}
      <div className="mb-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-200 dark:border-blue-800">
        <h3 className="text-blue-900 dark:text-blue-200 mb-3">
          Selected Projects ({selectedProjects.length})
        </h3>
        <div className="space-y-2">
          {selectedProjects.map((project) => {
            return (
              <div
                key={project.id}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-blue-800 dark:text-blue-300">
                  {project.system} - {project.name}
                </span>
                <div className="flex items-center gap-4 text-blue-700 dark:text-blue-400">
                  <span>
                    {project.words ? formatNumber(project.words) : "0"} words
                  </span>
                  <span className="flex items-center gap-1">
                    Due:
                    <DeadlineDisplay
                      initialDeadline={project.initial_deadline}
                      interimDeadline={project.interim_deadline}
                      finalDeadline={project.final_deadline}
                    />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Translator Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {availableUsers.map((user: User) => {
          const isSelected = selectedTranslators.has(user.id);
          const userWorkload = workloads.get(user.id);

          return (
            <div
              key={user.id}
              className={`p-6 bg-white dark:bg-gray-800 rounded-2xl border transition-all duration-200 cursor-pointer ${
                isSelected ?
                  "border-blue-500 shadow-lg"
                : "border-gray-200 dark:border-gray-700 hover:shadow-lg"
              }`}
              onClick={(e) => {
                // Don't handle clicks on buttons, textarea, or label
                if (
                  (e.target as HTMLElement).closest("button") ||
                  (e.target as HTMLElement).closest("textarea") ||
                  (e.target as HTMLElement).closest("label")
                ) {
                  return;
                }
                // If clicking directly on the checkbox, let the checkbox's onChange handle it
                const target = e.target as HTMLElement;
                if (
                  target.tagName === "INPUT" &&
                  target.getAttribute("type") === "checkbox"
                ) {
                  return;
                }
                handleTranslatorToggle(user.id);
              }}
            >
              <div className="flex items-start gap-3 mb-4">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleTranslatorToggle(user.id)}
                  className="outline-style w-5 h-5 mt-1 rounded cursor-pointer"
                />
                <div className="flex flex-col items-center text-center flex-1">
                  <div className="mb-3">
                    <ProfileAvatar
                      name={user.name}
                      avatar={user.avatar}
                      size="md"
                      showEditButton={false}
                    />
                  </div>
                  <h3 className="text-gray-900 dark:text-white mb-1">
                    {user.name}
                    {user.short_name && (
                      <span className="text-gray-500 dark:text-gray-400 font-normal">
                        {" "}
                        ({user.short_name})
                      </span>
                    )}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    {user.role}
                  </p>
                </div>
              </div>

              {/* Workload Info */}
              {userWorkload && (userWorkload.totalWords > 0 || userWorkload.totalLines > 0) && (
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700/50 space-y-2">
                  {/* Next Week Workload */}
                  <span className="text-xs text-gray-500 dark:text-gray-400">Predicted workload:</span>
                  <div>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="font-medium">Next week: {userWorkload.nextWeekEstimatedHours}h</span>
                      </div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            {userWorkload.nextWeekIsFeasible ? (
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                            ) : (
                              <AlertTriangle className="w-4 h-4 text-amber-500" />
                            )}
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              {userWorkload.nextWeekIsFeasible
                                ? "Can handle next week workload"
                                : "May struggle with next week workload"}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="mt-0.5 text-xs text-gray-500 dark:text-gray-500 pl-5">
                      {userWorkload.nextWeekWords.toLocaleString()} words • {userWorkload.nextWeekLines.toLocaleString()} lines
                    </div>
                  </div>

                  {/* Total Workload */}
                  <div>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Total: {userWorkload.estimatedHours}h</span>
                      </div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            {userWorkload.isFeasible ? (
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                            ) : (
                              <AlertTriangle className="w-4 h-4 text-amber-500" />
                            )}
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              {userWorkload.isFeasible
                                ? "Has capacity for more work"
                                : "May be overloaded"}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="mt-0.5 text-xs text-gray-500 dark:text-gray-500 pl-5">
                      {userWorkload.totalWords.toLocaleString()} words • {userWorkload.totalLines.toLocaleString()} lines
                    </div>
                  </div>
                </div>
              )}

              {/* No workload - show available indicator */}
              {userWorkload && userWorkload.totalWords === 0 && userWorkload.totalLines === 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700/50">
                  <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Available - no current projects</span>
                  </div>
                </div>
              )}

              {isSelected && (
                <div
                  className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
                  onClick={(e) => e.stopPropagation()}
                >
                  <label className="block text-gray-700 dark:text-gray-300 text-sm mb-2">
                    Instructions (optional)
                  </label>
                  <textarea
                    value={translatorMessages[user.id] || ""}
                    onChange={(e) =>
                      handleMessageChange(user.id, e.target.value)
                    }
                    placeholder="Add special instructions..."
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={3}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Assign Button */}
      <div className="flex justify-center">
        <button
          onClick={handleAssignClick}
          disabled={selectedTranslators.size === 0}
          className="px-8 py-4 cursor-pointer bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg text-lg"
          type="button"
        >
          Assign to {selectedTranslators.size} Translator
          {selectedTranslators.size !== 1 ? "s" : ""}
        </button>
      </div>
    </div>
  );
}
