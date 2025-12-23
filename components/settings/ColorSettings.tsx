"use client";

import { useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Loader2, Palette, PlusCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useColorSettings } from "@/hooks/useColorSettings";
import { useQueryClient } from "@tanstack/react-query";
import { ColorDialog } from "./color/ColorDialog";
import { ColorList } from "./color/ColorList";
import { getColorPreview } from "@/utils/tailwindColors";

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
  const queryClient = useQueryClient();
  const { settings, loading } = useColorSettings();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ColorSetting | null>(null);
  const [colorToDelete, setColorToDelete] = useState<ColorSetting | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const isAdmin = userRole === "admin";

  // Refresh function for React Query
  const refreshSettings = () => {
    queryClient.invalidateQueries({ queryKey: ["color-settings"] });
  };

  // Open delete confirmation modal
  function handleDeleteClick(id: number) {
    const colorSetting = settings.find((s) => s.id === id);
    if (colorSetting) {
      setColorToDelete(colorSetting);
    }
  }

  // Cancel delete
  function handleCancelDelete() {
    setColorToDelete(null);
  }

  // Confirm delete
  async function handleConfirmDelete() {
    if (!colorToDelete) return;
    
    setIsDeleting(true);
    const { error } = await supabase
      .from("color_settings")
      .delete()
      .eq("id", colorToDelete.id);
    
    setIsDeleting(false);
    
    if (error) {
      toast.error("Failed to delete color.");
    } else {
      toast.success("Color deleted successfully.");
      refreshSettings();
    }
    
    setColorToDelete(null);
  }

  // Get display name for a color setting
  function getColorDisplayName(color: ColorSetting): string {
    if (color.category === "system" && color.system_name) {
      return `System: ${color.system_name}`;
    }
    if (color.category === "status" && color.status_key) {
      return `Status: ${color.status_key}`;
    }
    if (color.category === "language" && color.language_in && color.language_out) {
      return `Language: ${color.language_in} → ${color.language_out}`;
    }
    return color.setting_key;
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
        onEdit={(s: ColorSetting) => {
          setEditing(s);
          setDialogOpen(true);
        }}
        onDelete={handleDeleteClick}
      />

      <ColorDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editing={editing}
        refresh={refreshSettings}
      />

      {/* Delete Confirmation Modal */}
      {colorToDelete && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={handleCancelDelete}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-gray-900 dark:text-white font-semibold">
                Delete Color
              </h2>
              <button
                onClick={handleCancelDelete}
                className="p-1 cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors"
                type="button"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Color Preview */}
            <div className="mb-4">
              <div
                className="w-full h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: getColorPreview(colorToDelete.color_value) }}
              >
                <span 
                  className="text-xs font-mono px-2 py-1 rounded bg-black/20 text-white"
                >
                  {colorToDelete.color_value}
                </span>
              </div>
            </div>

            <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
              Are you sure you want to delete{" "}
              <span className="font-medium text-gray-900 dark:text-white">
                {getColorDisplayName(colorToDelete)}
              </span>
              ? This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={handleCancelDelete}
                disabled={isDeleting}
                className="px-4 py-2 cursor-pointer text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 rounded-lg transition-colors border border-gray-200 dark:border-gray-700 disabled:opacity-50"
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 cursor-pointer bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                type="button"
              >
                {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
