"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Loader2 } from "lucide-react";
import { format, differenceInHours } from "date-fns";
import { pt } from "date-fns/locale";
import { Checkbox } from "@/components/ui/checkbox";
import { useColorSettings } from "@/hooks/useColorSettings";
import type { Project } from "@/types/project";

interface ProjectTableProps {
  selectedProjects: number[];
  onToggleProject: (projectId: number) => void;
  projects: Project[];
  selectedUser?: any;
}

export function ProjectTable({
  selectedProjects,
  onToggleProject,
  projects,
  selectedUser,
}: ProjectTableProps) {
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables.");
  }

  const supabase = createClientComponentClient({ supabaseUrl, supabaseKey });
  const { getRowColors, loading } = useColorSettings();

  useEffect(() => {
    if (!selectedUser || !projects.length) {
      setFilteredProjects([]);
      return;
    }

    const filterProjects = async () => {
      const now = new Date().toISOString();

      // buscar projetos ainda não atribuídos ao user
      const { data: assignedData } = await supabase
        .from("projects_assignment")
        .select("project_id")
        .eq("user_id", selectedUser.id);

      const assignedIds = assignedData?.map((a) => a.project_id) || [];

      // Filter projects that are not assigned to the user and have future deadlines
      const filtered = projects
        .filter((project) => {
          const hasFutureDeadline =
            project.final_deadline &&
            new Date(project.final_deadline) > new Date(now);
          const isNotAssigned = !assignedIds.includes(project.id);
          return hasFutureDeadline && isNotAssigned;
        })
        .sort((a, b) => {
          const deadlineA = a.final_deadline
            ? new Date(a.final_deadline).getTime()
            : 0;
          const deadlineB = b.final_deadline
            ? new Date(b.final_deadline).getTime()
            : 0;
          return deadlineA - deadlineB;
        });

      setFilteredProjects(filtered);
    };

    filterProjects();
  }, [selectedUser, projects, supabase]);

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

  return (
    <div className="relative border rounded-lg shadow-sm flex-1 overflow-y-auto max-h-[calc(100vh-18rem)]">
      <table className="w-full text-sm text-left border-collapse">
        <thead className="bg-muted text-muted-foreground uppercase text-xs sticky top-0 z-10">
          <tr>
            <th className="w-12 px-4 py-3"></th>
            <th className="px-5 py-3 whitespace-nowrap">Name</th>
            <th className="px-5 py-3 whitespace-nowrap">System</th>
            <th className="px-5 py-3 whitespace-nowrap">Words</th>
            <th className="px-5 py-3 whitespace-nowrap">Lines</th>
            <th className="px-5 py-3 whitespace-nowrap">Deadlines</th>
          </tr>
        </thead>

        <tbody>
          {filteredProjects.map((project) => {
            const checked = selectedProjects.includes(project.id);
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
                onClick={() => onToggleProject(project.id)}
                className={`cursor-pointer transition-all ${
                  checked ? "ring-2 ring-primary/50" : "hover:opacity-80"
                }`}
                style={{ backgroundColor: bgColor }}
              >
                <td className="px-4 py-3">
                  <Checkbox
                    checked={checked}
                    onClick={(e) => e.stopPropagation()}
                    onCheckedChange={() => onToggleProject(project.id)}
                  />
                </td>

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
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
