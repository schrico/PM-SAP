"use client";

import { useState } from "react";
import { X, UserCircle } from "lucide-react";

interface Translator {
  id: string;
  name: string;
  role: string;
  assignment_status: string;
}

interface RemoveTranslatorModalProps {
  open: boolean;
  projectId: number;
  projectName: string;
  translators: Translator[];
  onClose: () => void;
  onRemoveTranslator: (projectId: number, userId: string) => void;
  isRemoving: boolean;
}

export function RemoveTranslatorModal({
  open,
  projectId,
  projectName,
  translators,
  onClose,
  onRemoveTranslator,
  isRemoving,
}: RemoveTranslatorModalProps) {
  const [selectedTranslator, setSelectedTranslator] =
    useState<Translator | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  if (!open) return null;

  const handleTranslatorClick = (translator: Translator) => {
    setSelectedTranslator(translator);
    setShowConfirmation(true);
  };

  const handleConfirmRemove = () => {
    if (selectedTranslator) {
      onRemoveTranslator(projectId, selectedTranslator.id);
      setSelectedTranslator(null);
      setShowConfirmation(false);
    }
  };

  const handleCancelConfirmation = () => {
    setSelectedTranslator(null);
    setShowConfirmation(false);
  };

  const handleClose = () => {
    setSelectedTranslator(null);
    setShowConfirmation(false);
    onClose();
  };

  // Confirmation view
  if (showConfirmation && selectedTranslator) {
    return (
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        onClick={handleCancelConfirmation}
      >
        <div
          className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 max-w-md w-full mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-gray-900 dark:text-white">Confirm Removal</h2>
            <button
              onClick={handleCancelConfirmation}
              className="p-1 cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors"
              type="button"
            >
              <X className="text-gray-500 dark:text-gray-400 text-xl leading-none" />
            </button>
          </div>

          <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
            Are you sure you want to remove{" "}
            <span className="font-medium text-gray-900 dark:text-white">
              {selectedTranslator.name}
            </span>{" "}
            from{" "}
            <span className="font-medium text-gray-900 dark:text-white">
              {projectName}
            </span>
            ?
          </p>

          <div className="flex justify-end gap-3">
            <button
              onClick={handleCancelConfirmation}
              disabled={isRemoving}
              className="px-4 py-2 cursor-pointer text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 rounded-lg transition-colors border border-gray-200 dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              type="button"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmRemove}
              disabled={isRemoving}
              className="px-4 py-2 cursor-pointer bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              type="button"
            >
              {isRemoving ? "Removing..." : "Remove"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Translator selection view
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={handleClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-gray-900 dark:text-white">Remove Translator</h2>
          <button
            onClick={handleClose}
            className="p-1 cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors"
            type="button"
          >
            <X className="text-gray-500 dark:text-gray-400 text-xl leading-none" />
          </button>
        </div>

        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
          Select a translator to remove from{" "}
          <span className="font-medium text-gray-900 dark:text-white">
            {projectName}
          </span>
          :
        </p>

        {translators.length > 0 ?
          <div className="space-y-2 mb-6">
            {translators.map((translator) => (
              <button
                key={translator.id}
                onClick={() => handleTranslatorClick(translator)}
                disabled={isRemoving}
                className="w-full cursor-pointer flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 hover:bg-red-50 dark:hover:bg-red-900/20 border border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-700 rounded-lg transition-colors text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                type="button"
              >
                <UserCircle className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-red-500" />
                <span className="text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400">
                  {translator.name}
                </span>
              </button>
            ))}
          </div>
        : <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 italic">
            No translators assigned to this project.
          </p>
        }

        <div className="flex justify-end">
          <button
            onClick={handleClose}
            className="px-4 py-2 cursor-pointer text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 hover:border-red-300 dark:hover:border-red-700 rounded-lg transition-colors border border-gray-200 dark:border-gray-700"
            type="button"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}


