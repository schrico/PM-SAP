"use client";

import { FileText, ClipboardList } from "lucide-react";

interface ProjectInstructionsCardProps {
  /** Custom instructions editable by users */
  customInstructions: string | null | undefined;
  /** SAP instructions from the SAP API (read-only) */
  sapInstructions?: string | null;
}

/**
 * Project instructions card showing both SAP instructions (read-only)
 * and custom instructions (editable by users)
 */
export function ProjectInstructionsCard({
  customInstructions,
  sapInstructions,
}: ProjectInstructionsCardProps) {
  const hasCustomInstructions = customInstructions && customInstructions.trim() !== "";
  const hasSapInstructions = sapInstructions && sapInstructions.trim() !== "";

  // If neither exist, show a single empty state
  if (!hasCustomInstructions && !hasSapInstructions) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-gray-900 dark:text-white mb-4 text-xl font-semibold">
          Instructions
        </h2>
        <p className="text-gray-500 dark:text-gray-400 italic">
          Sem descrição fornecida
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* SAP Instructions (read-only) */}
      {hasSapInstructions && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h2 className="text-gray-900 dark:text-white text-xl font-semibold">
                SAP Instructions
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                From SAP TPM (read-only)
              </p>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 border border-gray-100 dark:border-gray-700">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
              {sapInstructions}
            </p>
          </div>
        </div>
      )}

      {/* Custom Instructions (user-editable) */}
      {hasCustomInstructions && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <ClipboardList className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-gray-900 dark:text-white text-xl font-semibold">
              Custom Instructions
            </h2>
          </div>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
            {customInstructions}
          </p>
        </div>
      )}
    </div>
  );
}
