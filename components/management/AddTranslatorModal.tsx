"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useUsers } from "@/hooks/useUsers";
import type { User } from "@/types/user";

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

  const getUserInitials = (name: string): string => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
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
        {usersLoading ?
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
              return (
                <div
                  key={user.id}
                  className={`p-4 bg-white dark:bg-gray-800 rounded-xl border transition-all duration-200 ${
                    isSelected ?
                      "border-blue-500 shadow-lg"
                    : "border-gray-200 dark:border-gray-700 hover:shadow-md"
                  }`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleTranslatorToggle(user.id)}
                      className="outline-style w-5 h-5 mt-1 rounded"
                    />
                    <div className="flex flex-col items-center text-center flex-1">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white mb-2">
                        {getUserInitials(user.name)}
                      </div>
                      <h3 className="text-gray-900 dark:text-white text-sm">
                        {user.name}
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 text-xs">
                        {user.role}
                      </p>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                      <label className="block text-gray-700 dark:text-gray-300 text-xs mb-1">
                        Instructions (optional)
                      </label>
                      <textarea
                        value={translatorMessages[user.id] || ""}
                        onChange={(e) =>
                          handleMessageChange(user.id, e.target.value)
                        }
                        placeholder="Add special instructions..."
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


