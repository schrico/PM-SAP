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
    addExclusion(newText.trim());
    setNewText("");
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 text-left">
      {/* Header — matches ThemeSettings style */}
      <div className="mb-5">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Ban className="w-6 h-6" />
          Instruction Exclusions
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          SAP instructions matching these texts will be excluded during import.
        </p>
      </div>

      {/* Add new exclusion */}
      <div className="flex gap-2 mb-5">
        <input
          type="text"
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="Paste instruction text to exclude…"
          className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Button
          size="sm"
          onClick={handleAdd}
          disabled={!newText.trim() || isAdding}
          className="bg-blue-500 hover:bg-blue-600 text-white shrink-0"
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
        <div className="flex justify-center py-6">
          <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
        </div>
      ) : exclusions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-600 px-4 py-5 text-sm text-gray-500 dark:text-gray-400 text-center italic">
          No exclusions configured yet.
        </div>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {exclusions.map((exclusion) => (
            <div
              key={exclusion.id}
              className="flex items-start justify-between gap-3 px-3 py-2.5 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 group"
            >
              <span className="text-sm text-gray-700 dark:text-gray-300 break-words min-w-0">
                {exclusion.instruction_text}
              </span>
              <button
                onClick={() => removeExclusion(exclusion.id)}
                disabled={isRemoving}
                className="p-1 shrink-0 cursor-pointer text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 transition-colors disabled:opacity-50 mt-0.5"
                type="button"
                aria-label="Remove exclusion"
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
