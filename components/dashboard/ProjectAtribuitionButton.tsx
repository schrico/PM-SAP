"use client";

import { Button } from "@/components/ui/button";
import type { User } from "@/types/user";
import { BookPlus } from "lucide-react";
import Link from "next/link";

interface ProjectAtribuitionButtonProps {
  user: User | null;
}

export function ProjectAtribuitionButton({
  user,
}: ProjectAtribuitionButtonProps) {
  if (!user || (user.role !== "admin" && user.role !== "pm")) return null;

  return (
    <div className="flex justify-center mt-4">
      <Button asChild variant="outline" className="flex items-center gap-2 bg-primary text-white hover:bg-primary/90">
        <Link href="/atribuir-projetos">
          <BookPlus className="w-8 h-8 sm:w-5 sm:h-5" />
          <span className="text-sm sm:text-base md:text-base lg:text-lg">
            Atribuir Projetos
          </span>
        </Link>
      </Button>
    </div>
  );
}
