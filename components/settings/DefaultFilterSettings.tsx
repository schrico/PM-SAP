"use client";

import { useState, useEffect } from "react";
import { Filter, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDefaultFilters } from "@/hooks/useDefaultFilters";

interface DefaultFilterSettingsProps {
  userId: string | null;
  availableProjectTypes: string[];
}

export function DefaultFilterSettings({
  userId,
  availableProjectTypes,
}: DefaultFilterSettingsProps) {
  const { getFilter, upsertFilter, isLoading, isUpdating } =
    useDefaultFilters(userId);

  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  // Load current default on mount
  useEffect(() => {
    const existing = getFilter("project_type");
    if (existing?.included_values) {
      setSelectedTypes(existing.included_values);
    }
  }, [getFilter]);

  const handleToggle = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleSave = () => {
    upsertFilter({
      filterKey: "project_type",
      includedValues: selectedTypes.length > 0 ? selectedTypes : null,
      excludedValues: null,
    });
  };

  if (availableProjectTypes.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
          <Filter className="w-4 h-4 text-purple-600 dark:text-purple-400" />
        </div>
        <div>
          <h3 className="text-gray-900 dark:text-white font-semibold">
            Default Project Type Filter
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Pre-select which project types to show by default
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-2 mb-4">
            {availableProjectTypes.map((type) => (
              <button
                key={type}
                onClick={() => handleToggle(type)}
                className={`px-3 py-1.5 rounded-lg border text-sm transition-colors cursor-pointer ${
                  selectedTypes.includes(type)
                    ? "bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300"
                    : "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
                type="button"
              >
                {type}
              </button>
            ))}
          </div>

          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isUpdating}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              {isUpdating ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-1" />
              )}
              Save Default
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
