"use client";

import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";

export function FilterButton() {
  return (
    <div className="flex justify-center mt-2">
      <Button variant="secondary" disabled>
        <Filter className="w-4 h-4 mr-2" />
        Filtros (em breve)
      </Button>
    </div>
  );
}
