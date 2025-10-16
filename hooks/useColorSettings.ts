// hooks/useColorSettings.ts
import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface ColorSettings {
  system: Record<string, string>;
  language: Record<string, string>;
  status: Record<string, string>;
}

export function useColorSettings() {
  const [colors, setColors] = useState<ColorSettings>({
    system: {},
    language: {},
    status: {},
  });
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchColors();

    // Subscribe to realtime updates
    const channel = supabase
      .channel("color_settings_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "color_settings",
        },
        () => {
          fetchColors();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchColors = async () => {
    try {
      const { data, error } = await supabase
        .from("color_settings")
        .select("setting_key, color_value, category");

      if (error) throw error;

      const grouped: ColorSettings = {
        system: {},
        language: {},
        status: {},
      };

      data?.forEach((item) => {
        if (item.category in grouped) {
          grouped[item.category as keyof ColorSettings][item.setting_key] =
            item.color_value;
        }
      });

      setColors(grouped);
    } catch (error) {
      console.error("Error fetching colors:", error);
    } finally {
      setLoading(false);
    }
  };

  // Helper functions to get colors by key
  const getSystemColor = (system: string): string => {
    const key = `system_${system.toLowerCase()}`;
    return colors.system[key] || "#ffffff";
  };

  const getLanguageColor = (langIn: string, langOut: string): string => {
    const key = `language_${langIn}_${langOut}`.toLowerCase();
    return colors.language[key] || "#000000";
  };

  const getStatusColor = (status: string): string => {
    const key = `status_${status}`;
    return colors.status[key] || "transparent";
  };

  return {
    colors,
    loading,
    getSystemColor,
    getLanguageColor,
    getStatusColor,
  };
}