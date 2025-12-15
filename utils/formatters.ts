export function formatNumber(value: number): string {
  return value.toLocaleString("en-US"); // 1,234 style
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  // Input like "2025-11-25T00:00:00Z" or "2025-11-25"
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  }); // e.g. "25 Nov"
}

