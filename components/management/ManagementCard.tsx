"use client";

import { useRouter } from "next/navigation";
import { formatNumber, formatDate } from "@/utils/formatters";
import { useColorSettings } from "@/hooks/useColorSettings";
import { useLayoutStore } from "@/lib/stores/useLayoutStore";
import { ProjectActionsMenu } from "./ProjectActionsMenu";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";

interface ProjectWithTranslators {
  id: number;
  name: string;
  system: string;
  words: number | null;
  lines: number | null;
  translators: Array<{
    id: string;
    name: string;
    short_name?: string | null;
    role: string;
    assignment_status: string;
    avatar?: string | null;
  }>;
  final_deadline: string | null;
  instructions?: string | null;
  status: "complete" | "active" | "cancelled";
  language_in: string;
  language_out: string;
}

interface ManagementCardProps {
  projects: ProjectWithTranslators[];
  openMenu: string | null;
  onMenuToggle: (projectId: string | null) => void;
  onAddTranslator: (projectId: number) => void;
  onRemoveTranslator: (projectId: number) => void;
  onDuplicate: (projectId: number) => void;
  onEditDetails: (projectId: number) => void;
  onCompleteProject: (projectId: number) => void;
  activeTab: "all" | "ready" | "inProgress" | "unclaimed";
}

export function ManagementCard({
  projects,
  openMenu,
  onMenuToggle,
  onAddTranslator,
  onRemoveTranslator,
  onDuplicate,
  onEditDetails,
  onCompleteProject,
  activeTab,
}: ManagementCardProps) {
  const router = useRouter();
  const { getSystemColor, getLanguageColor } = useColorSettings();
  const darkMode = useLayoutStore((state) => state.darkMode);

  // Get system color with proper dark mode handling and transparency
  const getSystemColorStyle = (system: string) => {
    const color = getSystemColor(system);
    // If default white color, make it transparent
    if (color === "#ffffff" || !color || color === "") {
      return { backgroundColor: "transparent" };
    }
    // Always use inline style for hex colors
    if (color.startsWith("#")) {
      // Ensure color is visible in dark mode by lightening if needed
      const rgb = hexToRgb(color);
      if (rgb && darkMode) {
        // Lighten the color for dark mode visibility (blend with white)
        const lightened = blendColors(rgb, { r: 255, g: 255, b: 255 }, 0.3);
        return {
          backgroundColor: `rgb(${lightened.r}, ${lightened.g}, ${lightened.b})`,
        };
      }
      return { backgroundColor: color };
    }
    return {};
  };

  // Get language color for underline
  const getLanguageColorStyle = (langIn: string, langOut: string) => {
    const color = getLanguageColor(langIn || "", langOut || "");
    // If default black color, make it transparent
    if (color === "#000000" || !color || color === "") {
      return { backgroundColor: "transparent" };
    }
    return { backgroundColor: color };
  };

  // Helper function to convert hex to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ?
        {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  };

  // Helper function to blend two colors
  const blendColors = (
    color1: { r: number; g: number; b: number },
    color2: { r: number; g: number; b: number },
    ratio: number
  ) => {
    return {
      r: Math.round(color1.r * (1 - ratio) + color2.r * ratio),
      g: Math.round(color1.g * (1 - ratio) + color2.g * ratio),
      b: Math.round(color1.b * (1 - ratio) + color2.b * ratio),
    };
  };

  const handleCardClick = (id: number, e: React.MouseEvent) => {
    // Don't navigate if clicking on a button or menu
    if ((e.target as HTMLElement).closest("button")) {
      return;
    }
    router.push(`/project/${id}`);
  };

  const getClosestDeadline = (
    project: ProjectWithTranslators
  ): string | null => {
    const validDates = [project.final_deadline]
      .filter(Boolean)
      .map((d) => {
        const date = new Date(d!);
        return isNaN(date.getTime()) ? null : d;
      })
      .filter(Boolean);

    if (validDates.length === 0) return null;
    return validDates[0] as string;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {projects.map((project) => {
        const dueDate = getClosestDeadline(project);
        return (
          <div
            key={project.id}
            className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 cursor-pointer hover:shadow-lg dark:hover:shadow-blue-500/20 dark:hover:border-blue-500/50 transition-all"
            onClick={(e) => handleCardClick(project.id, e)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex flex-col items-center mr-2">
                  <div
                    className="w-3 h-3 rounded"
                    style={getSystemColorStyle(project.system)}
                  />
                  <div
                    className="w-3 h-0.5 mt-0.5"
                    style={getLanguageColorStyle(
                      project.language_in || "",
                      project.language_out || ""
                    )}
                  />
                </div>
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs md:text-sm">
                  {project.system}
                </span>
              </div>
              <ProjectActionsMenu
                projectId={project.id}
                isOpen={openMenu === String(project.id)}
                translators={project.translators}
                onToggle={() =>
                  onMenuToggle(
                    openMenu === String(project.id) ? null : String(project.id)
                  )
                }
                onAddTranslator={() => onAddTranslator(project.id)}
                onRemoveTranslator={() => onRemoveTranslator(project.id)}
                onDuplicate={() => onDuplicate(project.id)}
                onEditDetails={() => onEditDetails(project.id)}
                onCompleteProject={() => onCompleteProject(project.id)}
              />
            </div>

            <h3 className="text-gray-900 dark:text-white text-sm font-bold mt-2">
              {project.name}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
              Words: {project.words ? formatNumber(project.words) : "-"}, Lines:{" "}
              {project.lines ? formatNumber(project.lines) : "-"}
            </p>

            <div className="mt-2">
              {project.translators.length > 0 ?
                <div className="flex flex-wrap gap-2">
                  {project.translators.map((translator) => (
                    <div
                      key={translator.id}
                      className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300 text-xs"
                    >
                      <ProfileAvatar
                        name={translator.name}
                        avatar={translator.avatar}
                        size="xs"
                        showEditButton={false}
                      />
                      <span>{translator.short_name || translator.name}</span>
                    </div>
                  ))}
                </div>
              : <span className="text-gray-400 dark:text-gray-500 text-xs italic">
                  Not assigned
                </span>
              }
            </div>

            <p className="text-gray-700 dark:text-gray-300 text-xs md:text-sm mt-2">
              Due Date: {dueDate ? formatDate(dueDate) : "-"}
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm max-w-xs truncate mt-1">
              Instructions: {project.instructions || "No instructions"}
            </p>
          </div>
        );
      })}
    </div>
  );
}
