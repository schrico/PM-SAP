"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export type ManagementFilter =
  | "all"
  | "ready"
  | "in-progress"
  | "to-be-claimed";

interface ManagementNavigationPillsProps {
  activeFilter: ManagementFilter;
  onFilterChange: (filter: ManagementFilter) => void;
  counts: {
    all: number;
    ready: number;
    inProgress: number;
    toBeClaimed: number;
  };
}

export function ManagementNavigationPills({
  activeFilter,
  onFilterChange,
  counts,
}: ManagementNavigationPillsProps) {
  const filters = [
    {
      key: "all" as const,
      label: "All Projects",
      count: counts.all,
    },
    {
      key: "ready" as const,
      label: "Ready for Completion",
      count: counts.ready,
    },
    {
      key: "in-progress" as const,
      label: "In Progress",
      count: counts.inProgress,
    },
    {
      key: "to-be-claimed" as const,
      label: "To Be Claimed",
      count: counts.toBeClaimed,
    },
  ];

  return (
    <nav className="w-full bg-gray-100 rounded-lg px-2 sm:px-4 py-3 shadow-inner">
      <div className="flex flex-wrap gap-1 sm:gap-2 justify-center">
        {filters.map((filter) => {
          const isActive = activeFilter === filter.key;

          return (
            <Button
              key={filter.key}
              variant={isActive ? "default" : "ghost"}
              onClick={() => onFilterChange(filter.key)}
              className={`
                flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-full 
                transition-all duration-200 text-sm sm:text-base
                ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md scale-105"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 hover:scale-105"
                }
              `}
            >
              <span className="font-medium whitespace-nowrap">
                {filter.label}
              </span>
              <Badge
                variant={isActive ? "secondary" : "outline"}
                className={`
                  text-xs px-1.5 sm:px-2 py-0.5 min-w-[20px] text-center
                  ${
                    isActive
                      ? "bg-white text-blue-600"
                      : "bg-gray-200 text-gray-600"
                  }
                `}
              >
                {filter.count}
              </Badge>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}
