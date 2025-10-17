"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UserSelector } from "@/components/assign/UserSelector";
import { RoleSelector } from "@/components/assign/RoleSelector";
import { ProjectTable } from "@/components/assign/ProjectTable";
import { AssignButton } from "@/components/assign/AssignButton";
import { useUser } from "@/hooks/useUser";
import { toast } from "sonner";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function AssignProjectsPage() {
  const supabase = createClientComponentClient();
  const { user, loading } = useUser();

  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedRole, setSelectedRole] = useState<"translator" | "reviewer" | null>(null);
  const [selectedProjects, setSelectedProjects] = useState<number[]>([]);
  const [allProjects, setAllProjects] = useState<any[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (loading) return <p className="p-6 text-gray-500">Loading...</p>;

  // 🔒 Access control — only PMs and Admins can assign projects
  if (user && !["pm", "admin"].includes(user.role)) {
    return (
      <div className="p-8 text-center text-gray-500">
        Restricted access. Only PMs and Admins can assign projects.
      </div>
    );
  }

  const handleAssign = async () => {
    try {
      for (const projectId of selectedProjects) {
        // Create the user assignment record
        const { error } = await supabase.from("projects_assignment").insert({
          project_id: projectId,
          user_id: selectedUser.id,
          role_assignment: selectedRole,
        });

        if (error) throw error;

        // Update the project's PM to the current logged-in PM/admin
        const { error: updateError } = await supabase
          .from("projects")
          .update({ pm: user.id })
          .eq("id", projectId);

        if (updateError) throw updateError;
      }

      toast.success(
        `Assigned ${selectedProjects.length} project(s) to ${selectedUser.name} as ${selectedRole}.`
      );

      setSelectedProjects([]);
      setConfirmOpen(false);
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message || "Error assigning projects.");
    }
  };

  // 🧠 Possible future: use selectedRole to filter visible projects
  // For example, you could limit visible projects to only those that
  // still need a translator/reviewer:
  // const filteredProjects = allProjects.filter(p => p.role_needed === selectedRole);

  // Get the names of selected projects (for confirmation modal)
  const selectedProjectNames = allProjects
    .filter((p) => selectedProjects.includes(p.id))
    .map((p) => p.name);

  return (
    <div className="p-6 space-y-6 flex flex-col items-center">
      <div className="w-full max-w-5xl">
        {/* Header */}
        <div className="flex justify-center items-center mb-4">
          <h1 className="text-2xl font-semibold text-center">Assign Projects</h1>
        </div>

        {/* Step 1: Select User */}
        <div className="flex flex-col items-center gap-4 mb-6">
          <UserSelector
            onSelectUser={setSelectedUser}
            selectedUser={selectedUser}
          />

          {/* Step 2: Select Role */}
          {/* NOTE: The role could be used in the future to control visibility
              or validation, e.g. restrict certain projects to specific roles */}
          {selectedUser && (
            <RoleSelector
              onSelectRole={setSelectedRole}
              selectedRole={selectedRole}
            />
          )}
        </div>

        {/* Step 3: Confirmation dialog */}
        {selectedProjects.length > 0 && (
          <div className="flex justify-end mb-3">
            <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
              <AlertDialogTrigger asChild>
                <AssignButton onClick={() => setConfirmOpen(true)} />
              </AlertDialogTrigger>

              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Assignment</AlertDialogTitle>
                  <div className="text-sm text-muted-foreground">
                    Are you sure you want to assign the following projects to{" "}
                    <strong>{selectedUser?.name}</strong> as{" "}
                    <strong>{selectedRole}</strong>?
                    <ul className="mt-3 list-disc list-inside text-sm text-gray-700">
                      {selectedProjectNames.map((name) => (
                        <li key={name}>{name}</li>
                      ))}
                    </ul>
                  </div>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleAssign}>
                    Confirm
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}

        {/* Step 4: Project Table */}
        {selectedRole && selectedUser && (
          <ProjectTable
            selectedProjects={selectedProjects}
            onToggleProject={(projectId: number) =>
              setSelectedProjects((prev) =>
                prev.includes(projectId)
                  ? prev.filter((id) => id !== projectId)
                  : [...prev, projectId]
              )
            }
            onProjectsLoaded={setAllProjects}
            selectedUser={selectedUser}
          />
        )}
      </div>
    </div>
  );
}
