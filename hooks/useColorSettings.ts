"use client";

import { useQuery } from '@tanstack/react-query';
import { useSupabase } from "./useSupabase";
import { getBgClass, getTextClass, getColorPreview } from "@/utils/tailwindColors";
import { queryKeys } from "@/lib/queryKeys";

export function useColorSettings() {
  const supabase = useSupabase();

  const { data: settings = [], isLoading: loading, error } = useQuery({
    queryKey: queryKeys.colorSettings(),
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

  // Get color value (tailwind class like "blue-500") for a system
  function getSystemColor(system: string): string {
    return settings.find(s => s.category === "system" && s.system_name === system)?.color_value || "";
  }

  // Get color value for a status
  function getStatusColor(status: string): string {
    return settings.find(s => s.category === "status" && s.status_key === status)?.color_value || "";
  }

  // Get color value for a language pair
  function getLanguageColor(langIn: string, langOut: string): string {
    return settings.find(s => s.category === "language" && s.language_in === langIn && s.language_out === langOut)?.color_value || "";
  }

  // Get Tailwind background class for a system
  function getSystemBgClass(system: string): string {
    const color = getSystemColor(system);
    return getBgClass(color);
  }

  // Get Tailwind background class for a status
  function getStatusBgClass(status: string): string {
    const color = getStatusColor(status);
    return getBgClass(color);
  }

  // Get Tailwind text class for a language pair
  function getLanguageTextClass(langIn: string, langOut: string): string {
    const color = getLanguageColor(langIn, langOut);
    return getTextClass(color);
  }

  // Get preview hex color for a system (for inline styles when needed)
  function getSystemColorPreview(system: string): string {
    const color = getSystemColor(system);
    if (!color) return "transparent";
    return getColorPreview(color);
  }

  // Get preview hex color for a language pair (for inline styles when needed)
  function getLanguageColorPreview(langIn: string, langOut: string): string {
    const color = getLanguageColor(langIn, langOut);
    if (!color) return "transparent";
    return getColorPreview(color);
  }

  // Determine final row colors - returns Tailwind classes
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
    // Background: use status color if complete, otherwise system color
    const bgColor = status === "complete" 
      ? getStatusColor("complete") 
      : getSystemColor(system || "");
    
    // Text color: use language color
    const textColor = getLanguageColor(langIn || "", langOut || "");

    return { 
      bgColor: bgColor || "",  // Tailwind color value like "blue-500"
      textColor: textColor || "",  // Tailwind color value like "red-600"
      bgClass: getBgClass(bgColor),  // Full Tailwind class like "bg-blue-500"
      textClass: getTextClass(textColor),  // Full Tailwind class like "text-red-600"
      // Preview hex values for inline styles (fallback/preview)
      bgColorPreview: bgColor ? getColorPreview(bgColor) : "transparent",
      textColorPreview: textColor ? getColorPreview(textColor) : "inherit",
    };
  }

  return {
    settings,
    loading,
    error,
    // Raw color values (tailwind format like "blue-500")
    getSystemColor,
    getStatusColor,
    getLanguageColor,
    // Tailwind classes (like "bg-blue-500", "text-red-600")
    getSystemBgClass,
    getStatusBgClass,
    getLanguageTextClass,
    // Preview hex colors (for inline styles when needed)
    getSystemColorPreview,
    getLanguageColorPreview,
    // Combined row colors
    getRowColors,
  };
}
