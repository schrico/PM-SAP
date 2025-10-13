"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Loader2 } from "lucide-react";
import { ProjectCard } from "@/components/ProjectCard";
import { OldProjectsButton as AdminControls } from "@/components/OldProjectsButton";
import { FilterButton } from "@/components/FilterButton";
import { LegendTooltip } from "@/components/LegendTooltip";
import type { Project } from "@/types/project";
import type { User } from "@/types/user";

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [showPast, setShowPast] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClientComponentClient();

      const { data: userData } = await supabase.auth.getUser();
      const { data: userProfile } = await supabase
        .from("users")
        .select("id, name, email, role")
        .eq("id", userData.user?.id)
        .single();

      setUser(userProfile || null);

      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("deadline", { ascending: true });

      if (error) console.error("Error loading projects:", error);
      else setProjects(data || []);

      setLoading(false);
    };

    fetchData();
  }, []);

  const now = new Date();
  const visibleProjects = projects.filter((p) => {
    const projectDate = new Date(p.deadline);
    return showPast ? projectDate < now : projectDate >= now;
  });

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin w-6 h-6 text-muted-foreground" />
      </div>
    );

  return (
    <main className="flex flex-col min-h-screen bg-background">
      {/* Header fixo dentro da página */}
      <div className="sticky top-20 sm:top-24 md:top-28 lg:top-32 z-10 bg-background border-b shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {showPast ? "Projetos Antigos" : "Projetos Futuros"}
            </h1>
            <p className="text-sm text-muted-foreground">
              Gerir e acompanhar projetos de tradução SAP
            </p>
          </div>

          {/* Botões à direita */}
          <div className="flex items-center gap-3">
            {user && (user.role === "admin" || user.role === "pm") && (
              <AdminControls
                user={user}
                showPast={showPast}
                onToggle={() => setShowPast(!showPast)}
              />
            )}
            <FilterButton />
            <LegendTooltip />
          </div>
        </div>
      </div>

      {/* Área scrollável (somente os cards) */}
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-6xl mx-auto">
          {visibleProjects.length === 0 ? (
            <div className="text-center text-muted-foreground mt-20">
              Nenhum projeto encontrado.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
