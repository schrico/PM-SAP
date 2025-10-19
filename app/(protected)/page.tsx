"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Loader2 } from "lucide-react";
import { OldProjectsButton } from "@/components/dashboard/OldProjectsButton";
import { FilterButton } from "@/components/dashboard/FilterButton";
/* import { LegendTooltip } from "@/components/dashboard/LegendTooltip";
 */import type { Project } from "@/types/project";
import type { User } from "@/types/user";
import { ProjectAtribuitionButton } from "@/components/dashboard/ProjectAtribuitionButton";
import { ProjectTable } from "@/components/ProjectTable";

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
        .select("*")
        .eq("id", userData.user?.id)
        .single();

      setUser(userProfile || null);

      const { data, error } = await supabase.from("projects").select("*");

      if (error) console.error("Error loading projects:", error);
      else setProjects(data || []);

      setLoading(false);
    };

    fetchData();
  }, []);

  const now = new Date();

  const getClosestDeadline = (p: Project) => {
    const validDates = [p.interim_deadline, p.final_deadline]
      .filter(Boolean)
      .map((d) => new Date(d!));
    if (validDates.length === 0) return null;
    return new Date(Math.min(...validDates.map((d) => d.getTime())));
  };

  const filteredProjects = projects.filter((p) => {
    const closest = getClosestDeadline(p);
    if (!closest) return false;
    return showPast ? closest < now : closest >= now;
  });

  const visibleProjects = filteredProjects.sort((a, b) => {
    const da = getClosestDeadline(a);
    const db = getClosestDeadline(b);
    if (!da || !db) return 0;
    return da.getTime() - db.getTime();
  });

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin w-6 h-6 text-muted-foreground" />
      </div>
    );

  return (
    <main className="flex flex-col flex-1 overflow-hidden bg-background">
      {/* Cabeçalho interno (Projetos Futuros / Passados) - agora sticky top-0 */}
      <div className="sticky top-0 z-30 bg-background border-b shadow-sm">
        <div className="max-w-8xl mx-auto flex items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {showPast ? "Past Projects" : "Future Projects"}
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage and track SAP translation projects
            </p>
          </div>

          <div className="flex items-center gap-3">
            <ProjectAtribuitionButton user={user} />
            {user && (user.role === "admin" || user.role === "pm") && (
              <OldProjectsButton
                user={user}
                showPast={showPast}
                onToggle={() => setShowPast(!showPast)}
              />
            )}
            <FilterButton />
            {/* <LegendTooltip /> */}
          </div>
        </div>
      </div>

      {/* Área scrollável */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-10 py-6">
        {visibleProjects.length === 0 ? (
          <div className="text-center text-muted-foreground mt-20">
            No project found.
          </div>
        ) : (
          <ProjectTable projects={visibleProjects} />
        )}
      </div>
    </main>
  );
}