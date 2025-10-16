// components/assignment/ProjectTable.tsx
"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { useColorSettings } from "@/hooks/useColorSettings";
import { Loader2 } from "lucide-react";

interface ProjectTableProps {
  selectedProjects: number[];
  onToggleProject: (projectId: number) => void;
  onProjectsLoaded?: (projects: any[]) => void;
  selectedUser?: any;
}

export function ProjectTable({
  selectedProjects,
  onToggleProject,
  onProjectsLoaded,
  selectedUser,
}: ProjectTableProps) {
  const [projects, setProjects] = useState<any[]>([]);
  const supabase = createClientComponentClient();
  const { getSystemColor, getLanguageColor, getStatusColor, loading: colorsLoading } =
    useColorSettings();

  useEffect(() => {
    if (!selectedUser) return;

    const fetchProjects = async () => {
      const now = new Date().toISOString();

      const { data: assignedData, error: assignedError } = await supabase
        .from("projects_assignment")
        .select("project_id")
        .eq("user_id", selectedUser.id);

      if (assignedError)
        console.error("Erro ao buscar atribuições:", assignedError);

      const assignedIds = assignedData?.map((a) => a.project_id) || [];

      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .gt("final_deadline", now)
        .not("id", "in", `(${assignedIds.join(",") || 0})`)
        .order("final_deadline", { ascending: true });

      if (error) console.error("Erro ao buscar projetos:", error);

      setProjects(data || []);
      onProjectsLoaded?.(data || []);
    };

    setTimeout(() => {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth",
      });
    }, 500);

    fetchProjects();
  }, [supabase, onProjectsLoaded, selectedUser]);

  const handleProjectClick = (projectId: number) => {
    onToggleProject(projectId);

    setTimeout(() => {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth",
      });
    }, 50);
  };

  if (colorsLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="animate-spin w-6 h-6 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-medium mb-3">Selecionar Projetos</h2>

      <div className="overflow-x-auto border rounded-lg">
        <div className="max-h-[320px] overflow-y-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100 sticky top-0 z-10">
              <tr>
                <th className="w-12 px-4 py-2"></th>
                <th className="px-4 py-2 text-left">Nome</th>
                <th className="px-4 py-2 text-left">Sistema</th>
                <th className="px-4 py-2 text-left">Words</th>
                <th className="px-4 py-2 text-left">Lines</th>
                <th className="px-4 py-2 text-left">Deadline</th>
              </tr>
            </thead>

            <tbody>
              {projects.map((p) => {
                const checked = selectedProjects.includes(p.id);

                // Get dynamic colors
                const bgColor =
                  p.status === "complete"
                    ? getStatusColor("complete")
                    : p.short === true
                      ? "#ffffff"
                      : getSystemColor(p.system || "");

                const textColor = getLanguageColor(
                  p.language_in || "",
                  p.language_out || ""
                );

                return (
                  <tr
                    key={p.id}
                    onClick={() => handleProjectClick(p.id)}
                    className={`cursor-pointer transition-all ${
                      checked ? "ring-2 ring-primary/50" : "hover:opacity-80"
                    }`}
                    style={{ backgroundColor: bgColor }}
                  >
                    <td className="px-4 py-2">
                      <Checkbox
                        checked={checked}
                        onClick={(e) => e.stopPropagation()}
                        onCheckedChange={() => handleProjectClick(p.id)}
                      />
                    </td>

                    <td className="px-4 py-2 font-medium" style={{ color: textColor }}>
                      {p.name}
                    </td>
                    <td className="px-4 py-2">{p.system}</td>
                    <td className="px-4 py-2">{p.words ?? "—"}</td>
                    <td className="px-4 py-2">{p.lines ?? "—"}</td>
                    <td className="px-4 py-2">
                      {format(new Date(p.final_deadline), "dd MMM yyyy HH:mm")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}