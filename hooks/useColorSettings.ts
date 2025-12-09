import { useQuery } from '@tanstack/react-query';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export function useColorSettings() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables.");
  }

  const supabase = createClientComponentClient({ supabaseUrl, supabaseKey });

  const { data: settings = [], isLoading: loading, error } = useQuery({
    queryKey: ['color-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("color_settings")
        .select("*")
        .order('created_at', { ascending: true });

      if (error) {
        throw new Error(`Failed to fetch color settings: ${error.message}`);
      }

      return data || [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - color settings don't change often
  });

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
    error,
    getSystemColor,
    getStatusColor,
    getLanguageColor,
    getRowColors,
  };
}
