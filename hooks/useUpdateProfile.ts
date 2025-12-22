"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { toast } from "sonner";

interface UpdateProfileData {
  name?: string;
  short_name?: string;
  C_user?: string;
  TE_user?: string;
  email?: string;
  avatar?: string | null;
}

export function useUpdateProfile() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables.");
  }

  const supabase = createClientComponentClient({ supabaseUrl, supabaseKey });
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateProfileData) => {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) {
        throw new Error("Not authenticated");
      }

      const updates: UpdateProfileData = {};

      // Update user profile fields
      if (data.name !== undefined) updates.name = data.name;
      if (data.short_name !== undefined) updates.short_name = data.short_name;
      if (data.C_user !== undefined) updates.C_user = data.C_user;
      if (data.TE_user !== undefined) updates.TE_user = data.TE_user;

      // Update users table
      if (Object.keys(updates).length > 0) {
        const { error: profileError } = await supabase
          .from("users")
          .update(updates)
          .eq("id", authUser.id);

        if (profileError) {
          throw new Error(
            `Failed to update profile: ${profileError.message}`
          );
        }
      }

      // Update email if provided and different
      if (data.email && data.email !== authUser.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: data.email,
        });

        if (emailError) {
          throw new Error(`Failed to update email: ${emailError.message}`);
        }

        // Email change requires confirmation
        return { requiresEmailConfirmation: true };
      }

      return { requiresEmailConfirmation: false };
    },
    onSuccess: (result) => {
      // Invalidate queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["available-avatars"] });

      if (result.requiresEmailConfirmation) {
        toast.info(
          "A confirmation email has been sent. Please check your inbox to confirm the email change."
        );
      } else {
        toast.success("Profile updated successfully!");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update profile");
    },
  });
}

