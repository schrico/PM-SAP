"use client";

interface ProfileStatusProps {
  hasChanges: boolean;
  lastSavedAt: Date | null;
}

export function ProfileStatus({ hasChanges, lastSavedAt }: ProfileStatusProps) {
  return (
    <div className="flex flex-col items-start md:items-end gap-1 text-xs text-gray-500 dark:text-gray-400">
      {hasChanges ? (
        <span className="text-amber-600 dark:text-amber-400">
          • Unsaved changes
        </span>
      ) : (
        <span>All changes saved</span>
      )}
      {lastSavedAt && (
        <span>
          Last updated:{" "}
          {lastSavedAt.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      )}
    </div>
  );
}

