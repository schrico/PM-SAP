"use client";

import { useEffect, useRef } from "react";
import {
  MoreVertical,
  CheckCircle,
  UserPlus,
  UserMinus,
  Copy,
  Edit,
} from "lucide-react";

interface ProjectActionsMenuProps {
  projectId: number;
  isOpen: boolean;
  translators: Array<{
    id: string;
    name: string;
    role: string;
    assignment_status: string;
  }>;
  onToggle: () => void;
  onAddTranslator: () => void;
  onRemoveTranslator: () => void;
  onDuplicate: () => void;
  onEditDetails: () => void;
  onCompleteProject: () => void;
}

export function ProjectActionsMenu({
  projectId,
  isOpen,
  translators,
  onToggle,
  onAddTranslator,
  onRemoveTranslator,
  onDuplicate,
  onEditDetails,
  onCompleteProject,
}: ProjectActionsMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Check if project is ready to be completed (all translators have assignment_status === "done")
  const isReadyToComplete =
    translators.length > 0 &&
    translators.every((t) => t.assignment_status === "done");

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        buttonRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        if (isOpen) {
          onToggle();
        }
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onToggle]);

  // Smooth scroll to ensure menu is fully visible when opened
  useEffect(() => {
    if (isOpen && menuRef.current && buttonRef.current) {
      // Increased delay to ensure menu is fully rendered and positioned
      const timeoutId = setTimeout(() => {
        const menuElement = menuRef.current;
        const buttonElement = buttonRef.current;
        if (menuElement && buttonElement) {
          const menuRect = menuElement.getBoundingClientRect();
          const viewportHeight = window.innerHeight;
          const viewportWidth = window.innerWidth;

          // Check if menu extends beyond viewport
          const menuBottom = menuRect.bottom;
          const menuTop = menuRect.top;
          const menuRight = menuRect.right;
          const menuLeft = menuRect.left;

          // Calculate scroll amounts with padding
          const padding = 20;
          let scrollTop = 0;
          let scrollLeft = 0;

          // Check bottom boundary
          if (menuBottom > viewportHeight) {
            scrollTop = menuBottom - viewportHeight + padding;
          }
          // Check top boundary
          else if (menuTop < 0) {
            scrollTop = menuTop - padding;
          }

          // Check right boundary (for RTL or wide menus)
          if (menuRight > viewportWidth) {
            scrollLeft = menuRight - viewportWidth + padding;
          }
          // Check left boundary
          else if (menuLeft < 0) {
            scrollLeft = menuLeft - padding;
          }

          // Perform smooth scroll if needed
          if (scrollTop !== 0 || scrollLeft !== 0) {
            window.scrollBy({
              top: scrollTop,
              left: scrollLeft,
              behavior: "smooth",
            });
          }
        }
      }, 100); // Increased delay for smoother operation

      return () => clearTimeout(timeoutId);
    }
  }, [isOpen]);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors cursor-pointer hover:shadow-lg"
        type="button"
        aria-label="Project actions"
      >
        <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors" />
      </button>

      {/* Menu with smooth animation - always fully visible */}
      {isOpen && (
        <div
          ref={menuRef}
          className="absolute right-0 mt-2 w-52 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 transition-all duration-200 ease-out opacity-100 transform translate-y-0"
          onClick={(e) => e.stopPropagation()}
          style={{
            // Ensure menu is always fully visible
            maxHeight: "calc(100vh - 200px)",
            overflowY: "auto",
          }}
        >
          {isReadyToComplete && (
            <button
              className="w-full cursor-pointer px-4 py-2.5 text-left text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors first:rounded-t-lg flex items-center gap-2 border-b border-gray-200 dark:border-gray-700"
              onClick={(e) => {
                e.stopPropagation();
                onCompleteProject();
              }}
              type="button"
            >
              <CheckCircle className="w-4 h-4" />
              Complete Project
            </button>
          )}
          <button
            className={`w-full cursor-pointer px-4 py-2.5 text-left text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-gray-700 hover:border-blue-200 dark:hover:border-transparent transition-all flex items-center gap-2 ${
              !isReadyToComplete ? "first:rounded-t-lg" : ""
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onAddTranslator();
            }}
            type="button"
          >
            <UserPlus className="w-4 h-4" />
            Add translator
          </button>
          <button
            className="w-full cursor-pointer px-4 py-2.5 text-left text-gray-700 dark:text-gray-300 hover:bg-red-100 dark:hover:bg-gray-700 hover:text-red-700 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-transparent transition-all flex items-center gap-2"
            onClick={(e) => {
              e.stopPropagation();
              onRemoveTranslator();
            }}
            type="button"
          >
            <UserMinus className="w-4 h-4" />
            Remove a translator
          </button>
          <button
            className="w-full cursor-pointer px-4 py-2.5 text-left text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-gray-700 hover:border-blue-200 dark:hover:border-transparent transition-all flex items-center gap-2"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate();
            }}
            type="button"
          >
            <Copy className="w-4 h-4" />
            Duplicate Project
          </button>
          <button
            className="w-full cursor-pointer px-4 py-2.5 text-left text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-gray-700 hover:border-blue-200 dark:hover:border-transparent transition-all last:rounded-b-lg flex items-center gap-2"
            onClick={(e) => {
              e.stopPropagation();
              onEditDetails();
            }}
            type="button"
          >
            <Edit className="w-4 h-4" />
            Edit Details
          </button>
        </div>
      )}
    </div>
  );
}



