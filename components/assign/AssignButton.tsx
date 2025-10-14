"use client";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

type AssignButtonProps = {
  onClick?: () => void;
};

export function AssignButton({ onClick }: AssignButtonProps) {
  return (
    <Button onClick={onClick}>
      <CheckCircle2 className="w-4 h-4" />
      Atribuir
    </Button>
  );
}