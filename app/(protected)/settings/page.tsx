"use client";

import { Heading1, Loader2 } from "lucide-react";
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
    <div className="container px-5 py-10 space-y-8 text-center">
      <h1 className="text-4xl font-bold">
        Settings
      </h1>
      <Card className="p-6 ">
        <ColorSettings userRole={user.role} />
      </Card>
    </div>
  );
}
