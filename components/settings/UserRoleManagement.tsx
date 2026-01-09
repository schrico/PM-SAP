"use client";

import { useState, useRef } from "react";
import { Loader2, Shield, AlertCircle } from "lucide-react";
import { useUsers } from "@/hooks/useUsers";
import { useUpdateUserRole } from "@/hooks/useUpdateUserRole";
import { useQueryClient } from "@tanstack/react-query";
import { ProfileAvatar } from "@/components/profile/ProfileAvatar";
import type { UserRole } from "@/types/user";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: "admin", label: "Admin" },
  { value: "pm", label: "Project Manager" },
  { value: "employee", label: "Employee" },
];

export function UserRoleManagement() {
  const { data: users = [], isLoading } = useUsers();
  const updateUserRole = useUpdateUserRole();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const pendingMutations = useRef<Set<string>>(new Set());

  // Filter users based on search term (name, email, or short_name)
  const filteredUsers = users.filter((user) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.name?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.short_name?.toLowerCase().includes(searchLower)
    );
  });

  const handleRoleChange = (userId: string, newRole: UserRole, currentRole: UserRole) => {
    // Prevent update if role hasn't actually changed
    if (newRole === currentRole) {
      console.log("Role unchanged, skipping update");
      return;
    }
    
    // Prevent duplicate mutations for the same user
    const mutationKey = `${userId}-${newRole}`;
    if (pendingMutations.current.has(mutationKey)) {
      console.log("Mutation already in progress, skipping duplicate call");
      return;
    }
    
    // Mark mutation as pending
    pendingMutations.current.add(mutationKey);
    setUpdatingUserId(userId);
    
    // Optimistic update
    queryClient.setQueryData(["users"], (oldUsers: typeof users) => {
      if (!oldUsers) return oldUsers;
      return oldUsers.map((user) =>
        user.id === userId ? { ...user, role: newRole } : user
      );
    });
    
    updateUserRole.mutate(
      { userId, newRole },
      {
        onSettled: () => {
          setUpdatingUserId(null);
          // Remove from pending set
          pendingMutations.current.delete(mutationKey);
          // Refetch to ensure we have the latest data
          queryClient.invalidateQueries({ queryKey: ["users"] });
        },
        onError: () => {
          // Remove from pending set
          pendingMutations.current.delete(mutationKey);
          // Revert optimistic update on error
          queryClient.invalidateQueries({ queryKey: ["users"] });
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-5 h-5 text-gray-900 dark:text-white" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          User Role Management
        </h2>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Manage user roles for all users in the system. Changes take effect
        immediately.
      </p>

      {/* Search Input */}
      <div className="mb-4">
        <Input
          type="text"
          placeholder="Search by name, email, or short name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full"
        />
      </div>

      {/* Users List */}
      <div className="space-y-3 max-h-[500px] overflow-y-auto">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchTerm ? "No users found matching your search." : "No users found."}
          </div>
        ) : (
          filteredUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <ProfileAvatar
                    name={user.name || "User"}
                    avatar={user.avatar}
                    size="sm"
                    showEditButton={false}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">
                      {user.name}
                      {user.short_name && (
                        <span className="text-muted-foreground ml-2">
                          ({user.short_name})
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
              </div>
              <div className="ml-4 flex-shrink-0">
                <Select
                  value={user.role}
                  onValueChange={(value) =>
                    handleRoleChange(user.id, value as UserRole, user.role)
                  }
                  disabled={updateUserRole.isPending || updatingUserId === user.id}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {updatingUserId === user.id && (
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground mt-1 ml-2 inline-block" />
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {updateUserRole.isError && (
        <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
          <AlertCircle className="w-4 h-4" />
          <span>
            {updateUserRole.error instanceof Error
              ? updateUserRole.error.message
              : "Failed to update user role"}
          </span>
        </div>
      )}
    </div>
  );
}
