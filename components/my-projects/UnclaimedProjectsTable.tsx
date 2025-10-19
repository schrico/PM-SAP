"use client";

import { format, differenceInHours } from "date-fns";
import { pt } from "date-fns/locale";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useColorSettings } from "@/hooks/useColorSettings";
import type { ProjectAssignment } from "@/types/project-assignment";

interface UnclaimedProjectsTableProps {
  projects: ProjectAssignment[];
  loading?: boolean;
  onClaim: (projectId: number, projectName: string) => void;
  onReject: (projectId: number, projectName: string) => void;
}

export function UnclaimedProjectsTable({
  projects,
  loading,
  onClaim,
  onReject,
}: UnclaimedProjectsTableProps) {
  const { getRowColors } = useColorSettings();

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

  if (loading)
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="animate-spin w-6 h-6 text-muted-foreground" />
      </div>
    );

  if (projects.length === 0) {
    return (
      <div className="border rounded-lg p-8 text-center text-muted-foreground">
        No unclaimed projects at the moment
      </div>
    );
  }

  return (
    <div className="relative border rounded-lg shadow-sm overflow-y-auto max-h-[calc(100vh-18rem)]">
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
            <th className="px-5 py-3 whitespace-nowrap text-center">Actions</th>
          </tr>
        </thead>

        <tbody>
          {projects.map((assignment) => {
            const project = assignment.projects;
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
                key={`${assignment.project_id}-${assignment.user_id}`}
                className="border-t hover:opacity-80 transition-all"
                style={{ backgroundColor: bgColor }}
              >
                <td
                  className="px-5 py-3 font-medium"
                  style={{ color: textColor }}
                >
                  {project.name}
                </td>
                <td className="px-5 py-3">{project.system || "-"}</td>
                <td className="px-5 py-3">{project.words ?? "-"}</td>
                <td className="px-5 py-3">{project.lines ?? "-"}</td>
                <td className="px-5 py-3 whitespace-pre-line">
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
                <td className="px-5 py-3">{project.translator || "-"}</td>
                <td className="px-5 py-3 break-words max-w-[400px]">
                  {project.instructions || "-"}
                </td>
                <td className="px-5 py-3">
                  <div className="flex gap-2 justify-center">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => onClaim(project.id, project.name)}
                      className="whitespace-nowrap"
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Claim
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onReject(project.id, project.name)}
                      className="whitespace-nowrap"
                    >
                      <XCircle className="w-3 h-3 mr-1" />
                      Refuse
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}