"use client";
import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Card } from "@/components/ui/card";

export function UserSelector({ onSelectUser, selectedUser }: any) {
  const [users, setUsers] = useState<any[]>([]);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchUsers = async () => {
      const { data } = await supabase.from("users").select("id, name, role");
      setUsers(data || []);
    };
    fetchUsers();
  }, [supabase]);

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
