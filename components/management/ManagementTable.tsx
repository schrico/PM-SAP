"use client";

import { useRouter } from "next/navigation";
import { UserCircle, LayoutGrid } from "lucide-react";
import { formatNumber, formatDate } from "@/utils/formatters";
import { useColorSettings } from "@/hooks/useColorSettings";
import { useLayoutStore } from "@/lib/stores/useLayoutStore";
import { ProjectActionsMenu } from "./ProjectActionsMenu";

interface ProjectWithTranslators {
  id: number;
  name: string;
  system: string;
  words: number | null;
  lines: number | null;
  translators: Array<{
    id: string;
    name: string;
    role: string;
    assignment_status: string;
  }>;
  final_deadline: string | null;
  instructions?: string | null;
  status: "complete" | "active" | "cancelled";
  language_in: string;
  language_out: string;
}

interface ManagementTableProps {
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

export function ManagementTable({
  projects,
  openMenu,
  onMenuToggle,
  onAddTranslator,
  onRemoveTranslator,
  onDuplicate,
  onEditDetails,
  onCompleteProject,
  activeTab,
}: ManagementTableProps) {
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

  const handleRowClick = (id: number, e: React.MouseEvent) => {
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
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <th className="px-6 py-4 w-4" />
              <th className="px-6 py-4 text-left text-gray-700 dark:text-gray-300">
                System
              </th>
              <th className="px-6 py-4 text-left text-gray-700 dark:text-gray-300">
                Project
              </th>
              <th className="px-6 py-4 text-right text-gray-700 dark:text-gray-300">
                Words
              </th>
              <th className="px-6 py-4 text-right text-gray-700 dark:text-gray-300">
                Lines
              </th>
              <th className="px-6 py-4 text-left text-gray-700 dark:text-gray-300">
                Translator(s)
              </th>
              <th className="px-6 py-4 text-left text-gray-700 dark:text-gray-300">
                Due Date
              </th>
              <th className="px-6 py-4 text-left text-gray-700 dark:text-gray-300">
                Instructions
              </th>
              <th className="px-6 py-4 text-left text-gray-700 dark:text-gray-300">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {projects.length > 0 ?
              projects.map((project) => {
                const dueDate = getClosestDeadline(project);
                return (
                  <tr
                    key={project.id}
                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors cursor-pointer"
                    onClick={(e) => handleRowClick(project.id, e)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-center">
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
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-gray-900 dark:text-blue-400 text-sm">
                        {project.system}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-900 dark:text-white">
                      {project.name}
                    </td>
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300 text-right">
                      {project.words ? formatNumber(project.words) : "-"}
                    </td>
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300 text-right">
                      {project.lines ? formatNumber(project.lines) : "-"}
                    </td>
                    <td className="px-6 py-4">
                      {project.translators.length > 0 ?
                        <div className="flex flex-wrap gap-2">
                          {project.translators.map((translator) => (
                            <div
                              key={translator.id}
                              className="flex items-center gap-1 text-gray-700 dark:text-gray-300 text-xs md:text-sm"
                            >
                              <UserCircle className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                              <span>{translator.name}</span>
                            </div>
                          ))}
                        </div>
                      : <span className="text-gray-400 dark:text-gray-500 text-xs md:text-sm italic">
                          Not assigned
                        </span>
                      }
                    </td>
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                      {dueDate ? formatDate(dueDate) : "-"}
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-xs md:text-sm max-w-xs truncate">
                      {project.instructions || "No instructions"}
                    </td>
                    <td className="px-6 py-4">
                      <ProjectActionsMenu
                        projectId={project.id}
                        isOpen={openMenu === String(project.id)}
                        translators={project.translators}
                        onToggle={() =>
                          onMenuToggle(
                            openMenu === String(project.id) ? null : (
                              String(project.id)
                            )
                          )
                        }
                        onAddTranslator={() => onAddTranslator(project.id)}
                        onRemoveTranslator={() =>
                          onRemoveTranslator(project.id)
                        }
                        onDuplicate={() => onDuplicate(project.id)}
                        onEditDetails={() => onEditDetails(project.id)}
                        onCompleteProject={() => onCompleteProject(project.id)}
                      />
                    </td>
                  </tr>
                );
              })
            : <tr>
                <td colSpan={9} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <LayoutGrid className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400">
                      No projects found in this category
                    </p>
                    <p className="text-gray-400 dark:text-gray-500 text-sm">
                      Try adjusting your filters or check another tab
                    </p>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  );
}


