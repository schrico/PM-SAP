"use client";

import { useQuery } from "@tanstack/react-query";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface Avatar {
  filename: string;
  display_name: string;
}

/**
 * Check if an avatar value is a custom upload (URL) vs predefined (filename)
 */
function isCustomAvatar(avatar: string | null | undefined): boolean {
  if (!avatar) return false;
  return avatar.startsWith("http://") || avatar.startsWith("https://");
}

export function useAvailableAvatars() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables.");
  }

  const supabase = createClientComponentClient({ supabaseUrl, supabaseKey });

  return useQuery({
    queryKey: ["available-avatars"],
    queryFn: async (): Promise<Avatar[]> => {
      // Get all avatars
      const { data: allAvatars, error: avatarsError } = await supabase
        .from("avatars")
        .select("filename, display_name")
        .order("display_name");

      if (avatarsError) {
        throw new Error(`Failed to fetch avatars: ${avatarsError.message}`);
      }

      // Get avatars already in use (excluding current user)
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      const { data: usedAvatars, error: usedError } = await supabase
        .from("users")
        .select("avatar")
        .not("avatar", "is", null)
        .neq("id", authUser?.id ?? ""); // Exclude current user's avatar

      if (usedError) {
        throw new Error(`Failed to fetch used avatars: ${usedError.message}`);
      }

      // Filter out avatars that are already taken
      // Only consider predefined avatars (not custom uploads) as "in use"
      const usedFilenames = new Set(
        (usedAvatars ?? [])
          .map((u) => u.avatar)
          .filter((avatar) => !isCustomAvatar(avatar))
      );

      return (allAvatars ?? []).filter(
        (avatar) => !usedFilenames.has(avatar.filename)
      );
    },
    staleTime: 1 * 60 * 1000, // 1 minute (shorter since availability changes)
  });
}