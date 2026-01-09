"use client";

import { useState } from "react";
import { X, Clock, CheckCircle2, AlertTriangle } from "lucide-react";
import { useUsers } from "@/hooks/useUsers";
import { useUserWorkload } from "@/hooks/useUserWorkload";
import type { User } from "@/types/user";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AddTranslatorModalProps {
  open: boolean;
  projectId: number;
  projectName: string;
  assignedTranslatorIds?: string[];
  onClose: () => void;
  onAddTranslators: (
    projectId: number,
    userIds: string[],
    messages: Record<string, string>
  ) => void;
  isAdding: boolean;
}

export function AddTranslatorModal({
  open,
  projectId,
  projectName,
  assignedTranslatorIds = [],
  onClose,
  onAddTranslators,
  isAdding,
}: AddTranslatorModalProps) {
  const { data: users, isLoading: usersLoading } = useUsers();
  const { workloads, isLoading: workloadsLoading } = useUserWorkload();
  const [selectedTranslators, setSelectedTranslators] = useState<Set<string>>(
    new Set()
  );
  const [translatorMessages, setTranslatorMessages] = useState<
    Record<string, string>
  >({});

  if (!open) return null;

  // Filter out already assigned translators
  const availableUsers =
    users?.filter((user) => !assignedTranslatorIds.includes(user.id)) || [];

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

  const handleAssignTranslators = () => {
    onAddTranslators(
      projectId,
      Array.from(selectedTranslators),
      translatorMessages
    );
    setSelectedTranslators(new Set());
    setTranslatorMessages({});
  };

  const handleClose = () => {
    setSelectedTranslators(new Set());
    setTranslatorMessages({});
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 max-w-5xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-gray-900 dark:text-white">Add Translator</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Select translators to add to{" "}
              <span className="font-medium text-gray-900 dark:text-white">
                {projectName}
              </span>
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-1 cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors"
            type="button"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Translator Cards */}
        {usersLoading || workloadsLoading ?
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Loading users...
          </div>
        : availableUsers.length === 0 ?
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            All available translators are already assigned to this project.
          </div>
        : <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {availableUsers.map((user: User) => {
              const isSelected = selectedTranslators.has(user.id);
              const userWorkload = workloads.get(user.id);
              return (
                <div
                  key={user.id}
                  className={`p-4 bg-white dark:bg-gray-800 rounded-xl border transition-all duration-200 cursor-pointer ${
                    isSelected ?
                      "border-blue-500 shadow-lg"
                    : "border-gray-200 dark:border-gray-700 hover:shadow-md"
                  }`}
                  onClick={(e) => {
                    // Don't toggle if clicking on textarea or label
                    if (
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
                  <div className="flex items-start gap-3 mb-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleTranslatorToggle(user.id)}
                      className="outline-style w-5 h-5 mt-1 rounded cursor-pointer"
                    />
                    <div className="flex flex-col items-center text-center flex-1">
                      <div className="mb-2">
                        <ProfileAvatar
                          name={user.name}
                          avatar={user.avatar}
                          size="sm"
                          showEditButton={false}
                        />
                      </div>
                      <h3 className="text-gray-900 dark:text-white text-sm">
                        {user.name}
                        {user.short_name && (
                          <span className="text-gray-500 dark:text-gray-400 font-normal">
                            {" "}
                            ({user.short_name})
                          </span>
                        )}
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 text-xs">
                        {user.role}
                      </p>
                    </div>
                  </div>

                  {/* Workload Info */}
                  {userWorkload &&
                    (userWorkload.totalWords > 0 ||
                      userWorkload.totalLines > 0) && (
                      <div className="mb-3 pt-3 border-t border-gray-100 dark:border-gray-700/50 space-y-1.5">
                        {/* Next Week Workload */}
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Predicted workload:
                        </span>
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                            <Clock className="w-3 h-3" />
                            <span className="font-medium">
                              Next week: {userWorkload.nextWeekEstimatedHours}h
                            </span>
                          </div>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                {userWorkload.nextWeekIsFeasible ?
                                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                                : <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                                }
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>
                                  {userWorkload.nextWeekIsFeasible ?
                                    "Should be able to handle workload"
                                  : "Workload may be challenging"}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        {/* Total Workload */}
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                            <Clock className="w-3 h-3" />
                            <span>Total: {userWorkload.estimatedHours}h</span>
                          </div>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                {userWorkload.isFeasible ?
                                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                                : <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                                }
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>
                                  {userWorkload.isFeasible ?
                                    "Appears to have availability"
                                  : "Workload appears high"}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                    )}

                  {/* No workload - show available indicator */}
                  {userWorkload &&
                    userWorkload.totalWords === 0 &&
                    userWorkload.totalLines === 0 && (
                      <div className="mb-3 pt-3 border-t border-gray-100 dark:border-gray-700/50">
                        <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Available - no current projects</span>
                        </div>
                      </div>
                    )}

                  {isSelected && (
                    <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                      <label className="block text-gray-700 dark:text-gray-300 text-xs mb-0.5">
                        Custom Instruction (optional)
                      </label>
                      <span className="block text-gray-400 dark:text-gray-500 text-xs mb-1">
                        Only visible to translator after claiming
                      </span>
                      <textarea
                        value={translatorMessages[user.id] || ""}
                        onChange={(e) =>
                          handleMessageChange(user.id, e.target.value)
                        }
                        placeholder="Add custom instruction..."
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        rows={2}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        }

        <div className="flex justify-between items-center gap-4">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {selectedTranslators.size} translator
            {selectedTranslators.size !== 1 ? "s" : ""} selected
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 cursor-pointer text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 hover:border-red-300 dark:hover:border-red-700 rounded-lg transition-colors border border-gray-200 dark:border-gray-700"
              type="button"
            >
              Cancel
            </button>
            <button
              onClick={handleAssignTranslators}
              disabled={selectedTranslators.size === 0 || isAdding}
              className="px-6 py-2 cursor-pointer bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              type="button"
            >
              {isAdding ?
                "Adding..."
              : `Add ${selectedTranslators.size} Translator${selectedTranslators.size !== 1 ? "s" : ""}`
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
