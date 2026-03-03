"use client";

import { useState } from "react";
import { Plus, Trash2, Loader2, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useInstructionExclusions } from "@/hooks/settings/useInstructionExclusions";

interface InstructionExclusionSettingsProps {
  userId: string | null;
}

export function InstructionExclusionSettings({
  userId,
}: InstructionExclusionSettingsProps) {
  const [newText, setNewText] = useState("");
  const {
    exclusions,
    isLoading,
    addExclusion,
    removeExclusion,
    isAdding,
    isRemoving,
  } = useInstructionExclusions(userId);

  const handleAdd = () => {
    if (!newText.trim()) return;
    addExclusion(newText);
    setNewText("");
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
          <Ban className="w-4 h-4 text-red-600 dark:text-red-400" />
        </div>
        <div>
          <h3 className="text-gray-900 dark:text-white font-semibold">
            Instruction Exclusions
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            SAP instructions matching these texts will be excluded during import
          </p>
        </div>
      </div>

      {/* Add new exclusion */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="Paste instruction text to exclude..."
          className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Button
          size="sm"
          onClick={handleAdd}
          disabled={!newText.trim() || isAdding}
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          {isAdding ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Exclusion list */}
      {isLoading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
        </div>
      ) : exclusions.length === 0 ? (
        <p className="text-sm text-gray-400 dark:text-gray-500 italic py-2">
          No exclusions configured
        </p>
      ) : (
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {exclusions.map((exclusion) => (
            <div
              key={exclusion.id}
              className="flex items-center justify-between gap-2 p-2 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-700"
            >
              <span className="text-sm text-gray-700 dark:text-gray-300 truncate flex-1">
                {exclusion.instruction_text}
              </span>
              <button
                onClick={() => removeExclusion(exclusion.id)}
                disabled={isRemoving}
                className="p-1 cursor-pointer text-gray-400 hover:text-red-500 transition-colors shrink-0"
                type="button"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
