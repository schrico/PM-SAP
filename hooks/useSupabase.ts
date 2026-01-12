"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

/**
 * Shared hook for creating Supabase client component client.
 * Centralizes Supabase client creation logic used across all hooks.
 * 
 * @returns Supabase client instance
 * @throws Error if required environment variables are missing
 */
export function useSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables.");
  }

  return createClientComponentClient({ supabaseUrl, supabaseKey });
}
