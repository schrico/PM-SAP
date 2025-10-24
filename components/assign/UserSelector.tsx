"use client";
import { Card } from "@/components/ui/card";
import { useUsers } from "@/hooks/useUsers";
import { Loader2 } from "lucide-react";

export function UserSelector({ onSelectUser, selectedUser }: any) {
  const { data: users = [], isLoading, error } = useUsers();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="animate-spin w-6 h-6 text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-8">
        Error loading users. Please try again.
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-medium mb-3">Select User</h2>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {users.map((user) => (
          <Card
            key={user.id}
            onClick={() => onSelectUser(user)}
            className={`cursor-pointer border transition-all p-4 hover:shadow-md ${
              selectedUser?.id === user.id
                ? "border-primary bg-primary/10"
                : "border-gray-200"
            }`}
          >
            <p className="font-semibold">{user.name}</p>
            <p className="text-sm text-gray-500">{user.role}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
