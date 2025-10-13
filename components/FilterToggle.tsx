// /components/FilterToggle.tsx
"use client";

import { Button } from "@/components/ui/button";

interface FilterToggleProps {
  filter: "active" | "complete";
  onChange: (value: "active" | "complete") => void;
}

export function FilterToggle({ filter, onChange }: FilterToggleProps) {
  return (
    <div className="flex justify-center gap-2 mt-4">
      <Button
        variant={filter === "active" ? "default" : "outline"}
        onClick={() => onChange("active")}
      >
        Active
      </Button>
      <Button
        variant={filter === "complete" ? "default" : "outline"}
        onClick={() => onChange("complete")}
      >
        Completed
      </Button>
    </div>
  );
}
