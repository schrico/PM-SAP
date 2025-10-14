"use client";

import { Button } from "@/components/ui/button";
import type { User } from "@/types/user";

interface OldProjectsButtonProps {
  user: User | null;
  showPast: boolean;
  onToggle: () => void;
}

export function OldProjectsButton({ user, showPast, onToggle }: OldProjectsButtonProps) {
  if (!user || (user.role !== "admin" && user.role !== "pm")) return null;

  return (
    <div className="flex justify-center mt-4">
      <Button variant="outline" onClick={onToggle}>
        {showPast ? "Ver Projetos Futuros" : "Ver Projetos Passados"}
      </Button>
    </div>
  );
}
