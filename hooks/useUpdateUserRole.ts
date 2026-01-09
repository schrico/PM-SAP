"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { toast } from "sonner";
import { getUserFriendlyError } from "@/utils/toastHelpers";
import type { UserRole } from "@/types/user";

interface UpdateUserRoleData {
  userId: string;
  newRole: UserRole;
}

export function useUpdateUserRole() {
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
    mutationFn: async (data: UpdateUserRoleData) => {
      console.log("Updating user role:", data);
      // Verify current user is admin
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) {
        throw new Error("Not authenticated");
      }

      // Check if current user is admin
      const { data: currentUser, error: currentUserError } = await supabase
        .from("users")
        .select("role")
        .eq("id", authUser.id)
        .single();

      if (currentUserError) {
        console.error("Error fetching current user:", currentUserError);
        throw new Error(`Failed to verify permissions: ${currentUserError.message}`);
      }

      if (!currentUser) {
        throw new Error("Failed to verify permissions: User not found");
      }

      if (currentUser.role !== "admin") {
        throw new Error("Only admins can update user roles");
      }

      // Check if user exists and get current role
      const { data: targetUser, error: targetUserError } = await supabase
        .from("users")
        .select("id, role, name")
        .eq("id", data.userId)
        .single();

      if (targetUserError) {
        console.error("Error fetching target user:", targetUserError);
        throw new Error(`User not found: ${targetUserError.message}`);
      }

      if (!targetUser) {
        throw new Error("User not found");
      }

      // Check if role is actually changing
      if (targetUser.role === data.newRole) {
        throw new Error(`User already has role: ${data.newRole}`);
      }

      // Update user role and verify it actually updated
      const { data: updatedRows, error: updateError } = await supabase
        .from("users")
        .update({ role: data.newRole })
        .eq("id", data.userId)
        .select("id, role");

      if (updateError) {
        console.error("Error updating user role:", updateError);
        throw new Error(
          `Failed to update user role: ${updateError.message}`
        );
      }

      // Verify that the update actually affected a row
      if (!updatedRows || updatedRows.length === 0) {
        console.error("Update returned no rows - RLS policy may be blocking the update");
        throw new Error(
          "Update failed: No rows were updated. This may be due to Row Level Security (RLS) policies. Please ensure admins have permission to update user roles."
        );
      }

      // Verify the role was actually updated
      const updatedUser = updatedRows[0];
      if (updatedUser.role !== data.newRole) {
        console.error("Role mismatch after update:", {
          expected: data.newRole,
          actual: updatedUser.role,
        });
        throw new Error(
          `Update verification failed: Expected role ${data.newRole} but got ${updatedUser.role}`
        );
      }

      console.log("User role updated successfully:", {
        userId: data.userId,
        oldRole: targetUser.role,
        newRole: data.newRole,
      });

      return { userId: data.userId, newRole: data.newRole, userName: targetUser.name };
    },
    onSuccess: (result) => {
      // Invalidate queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      
      // Force refetch to ensure UI updates immediately
      queryClient.refetchQueries({ queryKey: ["users"] });

      toast.success(
        `${result.userName || "User"}'s role updated to ${result.newRole} successfully!`
      );
    },
    onError: (error: Error) => {
      toast.error(getUserFriendlyError(error, "role update"));
    },
  });
}
