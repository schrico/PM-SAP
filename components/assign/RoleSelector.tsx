"use client";
import { Button } from "@/components/ui/button";

export function RoleSelector({ onSelectRole, selectedRole }: any) {
  const roles = ["translator", "reviewer"];

  return (
    <div>
      <h2 className="text-lg font-medium mb-3">Selecionar Função</h2>
      <div className="flex gap-4">
        {roles.map((role) => (
          <Button
            key={role}
            variant={selectedRole === role ? "default" : "outline"}
            onClick={() => onSelectRole(role)}
          >
            {role === "translator" ? "Tradutor" : "Revisor"}
          </Button>
        ))}
      </div>
    </div>
  );
}
