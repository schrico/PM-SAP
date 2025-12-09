"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Loader2, Palette, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useColorSettings } from "@/hooks/useColorSettings";
import { useQueryClient } from "@tanstack/react-query";
import { ColorDialog } from "./color/ColorDialog";
import { ColorList } from "./color/ColorList";

export interface ColorSetting {
  id: number;
  setting_key: string;
  color_value: string;
  category: "system" | "language" | "status";
  system_name?: string | null;
  status_key?: string | null;
  language_in?: string | null;
  language_out?: string | null;
  description?: string | null;
}

interface ColorSettingsProps {
  userRole?: string;
}

export function ColorSettings({ userRole }: ColorSettingsProps) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables.");
  }

  const supabase = createClientComponentClient({ supabaseUrl, supabaseKey });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { settings, loading, error } = useColorSettings();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ColorSetting | null>(null);

  const isAdmin = userRole === "admin";

  // Refresh function for React Query
  const refreshSettings = () => {
    queryClient.invalidateQueries({ queryKey: ["color-settings"] });
  };

  async function handleDelete(id: number) {
    const ok = confirm("Are you sure you want to delete this color?");
    if (!ok) return;
    const { error } = await supabase
      .from("color_settings")
      .delete()
      .eq("id", id);
    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete color.",
        variant: "destructive",
      });
    } else {
      toast({ title: "Deleted", description: "Color deleted successfully." });
      refreshSettings();
    }
  }

  if (loading)
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="animate-spin w-6 h-6 text-muted-foreground" />
      </div>
    );

  if (!isAdmin)
    return (
      <div className="bg-muted/50 border rounded-lg p-8 text-center">
        <Palette className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">Restricted</h3>
        <p className="text-sm text-muted-foreground">
          Only administrators can change color settings.
        </p>
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Palette className="w-6 h-6" /> Color Customization
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Configure color codes for systems, statuses, and languages.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
        >
          <PlusCircle className="w-4 h-4 mr-2" /> New Color
        </Button>
      </div>

      <ColorList
        settings={settings}
        onEdit={(s: any) => {
          setEditing(s);
          setDialogOpen(true);
        }}
        onDelete={handleDelete}
      />

      <ColorDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editing={editing}
        refresh={refreshSettings}
      />
    </div>
  );
}
