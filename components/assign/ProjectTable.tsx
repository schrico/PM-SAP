"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Checkbox } from "@/components/ui/checkbox";
import { sistemaColors, languageColors, completedColor } from "@/types/colors";
import { format } from "date-fns";

interface ProjectTableProps {
  selectedProjects: number[];
  onToggleProject: (projectId: number) => void;
  onProjectsLoaded?: (projects: any[]) => void;
  selectedUser?: any; // 👈 adicionamos esta prop
}

export function ProjectTable({
  selectedProjects,
  onToggleProject,
  onProjectsLoaded,
  selectedUser,
}: ProjectTableProps) {
  const [projects, setProjects] = useState<any[]>([]);
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (!selectedUser) return; // ⛔ espera por um utilizador

    const fetchProjects = async () => {
      const now = new Date().toISOString();

      // 1️⃣ Buscar projetos já atribuídos ao user selecionado
      const { data: assignedData, error: assignedError } = await supabase
        .from("projects_assignment")
        .select("project_id")
        .eq("user_id", selectedUser.id);

      if (assignedError)
        console.error("Erro ao buscar atribuições:", assignedError);

      const assignedIds = assignedData?.map((a) => a.project_id) || [];

      // 2️⃣ Buscar todos os projetos, exceto os atribuídos
      const { data, error } = await supabase
        .from("projects")
        .select(
          "id, name, sistema, words, lines, deadline, short, status, language_in, language_out"
        )
        .gt("deadline", now)
        .not("id", "in", `(${assignedIds.join(",") || 0})`) // 👈 exclui já atribuídos
        .order("deadline", { ascending: true });

      if (error) console.error("Erro ao buscar projetos:", error);

      setProjects(data || []);
      onProjectsLoaded?.(data || []);
    };

    setTimeout(() => {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth",
      });
    }, 300);

    fetchProjects();
  }, [supabase, onProjectsLoaded, selectedUser]);

  const handleProjectClick = (projectId: number) => {
    onToggleProject(projectId);

    // Scroll suave para o final (ou até à tabela)
    setTimeout(() => {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth",
      });
    }, 150);
  };

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
                const isCompleted = p.status === "complete";
                const isShort = p.short === true;

                const bgColor = isCompleted
                  ? completedColor
                  : isShort
                    ? "bg-white"
                    : sistemaColors[p.sistema as keyof typeof sistemaColors] ||
                      "bg-white";

                const langKey =
                  `${p.language_in}→${p.language_out}` as keyof typeof languageColors;
                const textColor = languageColors[langKey] || "text-gray-800";

                return (
                  <tr
                    key={p.id}
                    onClick={() => onToggleProject(p.id)}
                    className={`cursor-pointer transition-all ${bgColor} ${
                      checked ? "ring-2 ring-primary/50" : "hover:bg-gray-200"
                    }`}
                  >
                    <td className="px-4 py-2">
                      <Checkbox
                        checked={checked}
                        onClick={(e) => e.stopPropagation()}
                        onCheckedChange={() => handleProjectClick(p.id)}
                      />
                    </td>

                    <td className={`px-4 py-2 font-medium ${textColor}`}>
                      {p.name}
                    </td>
                    <td className="px-4 py-2">{p.sistema}</td>
                    <td className="px-4 py-2">{p.words ?? "—"}</td>
                    <td className="px-4 py-2">{p.lines ?? "—"}</td>
                    <td className="px-4 py-2">
                      {format(new Date(p.deadline), "dd MMM yyyy HH:mm")}
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
