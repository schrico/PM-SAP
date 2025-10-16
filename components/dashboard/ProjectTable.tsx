// components/dashboard/ProjectTable.tsx
"use client";

import { useRouter } from "next/navigation";
import { format, differenceInHours } from "date-fns";
import { pt } from "date-fns/locale";
import type { Project } from "@/types/project";
import { useColorSettings } from "@/hooks/useColorSettings";
import { Loader2 } from "lucide-react";

interface ProjectTableProps {
  projects: Project[];
}

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
  const now = new Date();
  const diffHours = differenceInHours(new Date(deadline), now);

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

export function ProjectTable({ projects }: ProjectTableProps) {
  const router = useRouter();
  const { getSystemColor, getLanguageColor, getStatusColor, loading } =
    useColorSettings();

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="animate-spin w-6 h-6 text-muted-foreground" />
      </div>
    );
  }

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
            <th className="px-5 py-3 whitespace-nowrap">Translator</th>
            <th className="px-5 py-3 whitespace-nowrap">Instructions</th>
          </tr>
        </thead>

        <tbody>
          {projects.map((project) => {
            const nearest =
              project.interim_deadline || project.final_deadline || null;

            // Get dynamic colors
            const bgColor =
              project.status === "complete"
                ? getStatusColor("complete")
                : project.short
                  ? "#ffffff"
                  : getSystemColor(project.system || "");

            const textColor = getLanguageColor(
              project.language_in || "",
              project.language_out || ""
            );

            return (
              <tr
                key={project.id}
                className="border-t hover:opacity-80 transition-all cursor-pointer"
                style={{ backgroundColor: bgColor }}
              >
                {/* nome */}
                <td
                  className="px-5 py-3 font-medium"
                  style={{ color: textColor }}
                  onClick={() => router.push(`/project/${project.id}`)}
                >
                  {project.name}
                </td>

                {/* system */}
                <td
                  className="px-5 py-3"
                  onClick={() => router.push(`/project/${project.id}`)}
                >
                  {project.system || "-"}
                </td>

                {/* words */}
                <td
                  className="px-5 py-3"
                  onClick={() => router.push(`/project/${project.id}`)}
                >
                  {project.words ?? "-"}
                </td>

                {/* lines */}
                <td
                  className="px-5 py-3"
                  onClick={() => router.push(`/project/${project.id}`)}
                >
                  {project.lines ?? "-"}
                </td>

                {/* deadlines + badge */}
                <td
                  className="px-5 py-3 align-top whitespace-pre-line"
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

                {/* translator */}
                <td
                  className="px-5 py-3"
                  onClick={() => router.push(`/project/${project.id}`)}
                >
                  {project.translator || "-"}
                </td>

                {/* instructions */}
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