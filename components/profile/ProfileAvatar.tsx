"use client";

import { Camera } from "lucide-react";
import { useMemo } from "react";

interface ProfileAvatarProps {
  name: string;
  onAvatarClick?: () => void;
}

export function ProfileAvatar({ name, onAvatarClick }: ProfileAvatarProps) {
  const initials = useMemo(() => {
    if (!name.trim()) return "??";
    const parts = name.trim().split(" ");
    const first = parts[0]?.[0] ?? "";
    const last = parts[parts.length - 1]?.[0] ?? "";
    return (first + last).toUpperCase();
  }, [name]);

  return (
    <div className="relative">
      <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-semibold">
        {initials}
      </div>
      {onAvatarClick && (
        <button
          onClick={onAvatarClick}
          className="absolute bottom-0 right-0 w-8 h-8 cursor-pointer bg-gray-900 dark:bg-gray-100 rounded-full flex items-center justify-center hover:scale-110 transition-transform"
          type="button"
          aria-label="Change avatar"
        >
          <Camera className="w-4 h-4 text-white dark:text-gray-900" />
        </button>
      )}
    </div>
  );
}

