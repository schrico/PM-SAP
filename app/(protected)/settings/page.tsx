"use client";

import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ColorSettings } from "@/components/settings/ColorSettings";
import { useUser } from "@/hooks/useUser";

export default function SettingsPage() {
  const { user, loading } = useUser(); // ✅ Hook chamado no topo

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        Nenhum utilizador encontrado.
      </div>
    );
  }

  return (
    <div className="container max-w-6xl py-10 space-y-8">
      <Card className="p-6">
        <ColorSettings userRole={user.role} />
      </Card>
    </div>
  );
}
