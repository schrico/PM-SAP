import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export function useColorSettings() {
  const supabase = createClientComponentClient();
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    setLoading(true);
    const { data } = await supabase.from("color_settings").select("*");
    setSettings(data || []);
    setLoading(false);
  }

  function getSystemColor(system: string) {
    return settings.find(s => s.category === "system" && s.system_name === system)?.color_value || "#ffffff";
  }

  function getStatusColor(status: string) {
    return settings.find(s => s.category === "status" && s.status_key === status)?.color_value || "#ffffff";
  }

  function getLanguageColor(langIn: string, langOut: string) {
    return settings.find(s => s.category === "language" && s.language_in === langIn && s.language_out === langOut)?.color_value || "#000000";
  }

  // Determine final row colors
  function getRowColors({
    status,
    system,
    langIn,
    langOut,
  }: {
    status?: string;
    system?: string;
    langIn?: string;
    langOut?: string;
  }) {
    const bgColor = status === "complete" ? getStatusColor("complete") : getSystemColor(system || "");
    let textColor = getLanguageColor(langIn || "", langOut || "");

    // Ensure contrast: if text and bg are too similar, fallback
    if (textColor.toLowerCase() === bgColor.toLowerCase()) {
      textColor = "#000000"; // fallback black text
    }

    return { bgColor, textColor };
  }

  return {
    settings,
    loading,
    getSystemColor,
    getStatusColor,
    getLanguageColor,
    getRowColors,
  };
}
