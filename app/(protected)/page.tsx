"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { OldProjectsButton } from "@/components/dashboard/OldProjectsButton";
import { FilterButton } from "@/components/dashboard/FilterButton";
/* import { LegendTooltip } from "@/components/dashboard/LegendTooltip";
 */ import { ProjectAtribuitionButton } from "@/components/dashboard/ProjectAtribuitionButton";
import { ProjectTable } from "@/components/ProjectTable";
import { useUserProfile } from "@/hooks/useUserProfile";
import type { Project } from "@/types/project";

export default function DashboardPage() {
  const [showPast, setShowPast] = useState(false);

  const {
    data: user,
    isLoading: userLoading,
    error: userError,
  } = useUserProfile();

  const loading = userLoading;

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin w-6 h-6 text-muted-foreground" />
      </div>
    );

  if (userError)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center text-muted-foreground">
          <p>Error loading data. Please try again.</p>
        </div>
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
            <ProjectAtribuitionButton user={user || null} />
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
        <ProjectTable showPast={showPast} />
      </div>
    </main>
  );
}
