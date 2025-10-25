"use client";

import { useRouter } from "next/navigation";
import { format, differenceInHours } from "date-fns";
import { pt } from "date-fns/locale";
import { Loader2 } from "lucide-react";
import { useProjectsWithTranslators } from "@/hooks/useProjectsWithTranslators";
import { useColorSettings } from "@/hooks/useColorSettings";

interface ProjectTableProps {
  showPast?: boolean;
}

export function ProjectTable({ showPast = false }: ProjectTableProps) {
  const router = useRouter();
  const { getRowColors, loading: colorLoading } = useColorSettings();
  const {
    data: projects = [],
    isLoading: projectsLoading,
    error,
  } = useProjectsWithTranslators(showPast);

  function formatDeadline(date: string | null) {
    if (!date) return null;
    try {
      return format(new Date(date), "dd/MM HH'h'", { locale: pt });
    } catch {
      return null;
    }
  }

  function getDeadlineBadge(deadline: string | null) {
    if (!deadline) return null;
    const diffHours = differenceInHours(new Date(deadline), new Date());
    if (diffHours < 0) return null;
    if (diffHours <= 24)
      return (
        <span className="ml-2 text-xs font-semibold text-red-600">
          ⚠️ &lt;24h
        </span>
      );
    if (diffHours <= 72)
      return (
        <span className="ml-2 text-xs font-semibold text-orange-500">
          🕒 &lt;3d
        </span>
      );
    return (
      <span className="ml-2 text-xs font-semibold text-green-600">🟢 ok</span>
    );
  }

  if (colorLoading || projectsLoading)
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="animate-spin w-6 h-6 text-muted-foreground" />
      </div>
    );

  if (error)
    return (
      <div className="flex justify-center items-center py-12">
        <p className="text-red-500">
          Error loading projects. Please try again.
        </p>
      </div>
    );

  return (
    <div className="relative border rounded-lg shadow-sm flex-1 overflow-y-auto max-h-[calc(100vh-18rem)]">
      <table className="w-full text-sm text-left border-collapse">
        <thead className="bg-muted text-muted-foreground uppercase text-xs sticky top-0 z-10">
          <tr>
            <th className="px-5 py-3 whitespace-nowrap">Name</th>
            <th className="px-5 py-3 whitespace-nowrap">System</th>
            <th className="px-5 py-3 whitespace-nowrap">Words</th>
            <th className="px-5 py-3 whitespace-nowrap">Lines</th>
            <th className="px-5 py-3 whitespace-nowrap">Deadlines</th>
            <th className="px-5 py-3 whitespace-nowrap">Translators</th>
            <th className="px-5 py-3 whitespace-nowrap">Instructions</th>
          </tr>
        </thead>

        <tbody>
          {projects.map((project) => {
            const nearest =
              project.interim_deadline || project.final_deadline || null;
            const { bgColor, textColor } = getRowColors({
              status: project.status,
              system: project.system,
              langIn: project.language_in,
              langOut: project.language_out,
            });

            return (
              <tr
                key={project.id}
                className="border-t hover:opacity-80 transition-all cursor-pointer"
                style={{ backgroundColor: bgColor }}
              >
                <td
                  className="px-5 py-3 font-medium"
                  style={{ color: textColor }}
                  onClick={() => router.push(`/project/${project.id}`)}
                >
                  {project.name}
                </td>
                <td
                  className="px-5 py-3"
                  onClick={() => router.push(`/project/${project.id}`)}
                >
                  {project.system || "-"}
                </td>
                <td
                  className="px-5 py-3"
                  onClick={() => router.push(`/project/${project.id}`)}
                >
                  {project.words ?? "-"}
                </td>
                <td
                  className="px-5 py-3"
                  onClick={() => router.push(`/project/${project.id}`)}
                >
                  {project.lines ?? "-"}
                </td>
                <td
                  className="px-5 py-3 whitespace-pre-line"
                  onClick={() => router.push(`/project/${project.id}`)}
                >
                  {[
                    project.initial_deadline &&
                      `initial — ${formatDeadline(project.initial_deadline)}`,
                    project.interim_deadline &&
                      `interim — ${formatDeadline(project.interim_deadline)}`,
                    project.final_deadline &&
                      `final — ${formatDeadline(project.final_deadline)}`,
                  ]
                    .filter(Boolean)
                    .join("\n") || "-"}
                  {nearest && getDeadlineBadge(nearest)}
                </td>
                <td
                  className="px-5 py-3"
                  onClick={() => router.push(`/project/${project.id}`)}
                >
                  {project.translators && project.translators.length > 0 ? (
                    <div className="space-y-1">
                      {project.translators.map((translator, index) => (
                        <div key={translator.id} className="text-xs">
                          <span className="font-medium">{translator.name}</span>
                          <span className="text-gray-800 ml-1">
                            ({translator.role})
                          </span>
                          {translator.assignment_status === "claimed" && (
                            <span className="ml-1 text-green-800 font-bold">✓</span>
                          )}
                          {translator.assignment_status === "done" && (
                            <span className="ml-1 text-blue-800 font-bold">✓✓</span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="px-5 py-3 break-words max-w-[600px]">
                  {project.instructions || "-"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
