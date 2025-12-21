/**
 * Converts hex color to Tailwind background class
 * This is a fallback - ideally colors should be stored as Tailwind classes in the database
 */
function hexToTailwindClass(hex: string): string {
  // Common color mappings
  const colorMap: Record<string, string> = {
    "#3b82f6": "bg-blue-500",
    "#8b5cf6": "bg-purple-500",
    "#10b981": "bg-green-500",
    "#f59e0b": "bg-orange-500",
    "#ec4899": "bg-pink-500",
    "#ef4444": "bg-red-500",
    "#06b6d4": "bg-cyan-500",
    "#6366f1": "bg-indigo-500",
  };
  
  return colorMap[hex.toLowerCase()] || "bg-gray-500";
}

/**
 * Gets system color class for display
 * Uses color settings from Supabase if available, otherwise falls back to defaults
 */
export function getSystemColorClass(
  system: string,
  getSystemColor?: (system: string) => string
): string {
  if (getSystemColor) {
    const colorValue = getSystemColor(system);
    if (colorValue && colorValue !== "#ffffff") {
      return hexToTailwindClass(colorValue);
    }
  }
  
  // Fallback to default colors
  const defaultColors: Record<string, string> = {
    'B0X': 'bg-blue-500',
    'XTM': 'bg-purple-500',
    'SSE': 'bg-green-500',
    'STM': 'bg-orange-500',
    'LAT': 'bg-pink-500',
  };
  
  return defaultColors[system] || 'bg-gray-500';
}

