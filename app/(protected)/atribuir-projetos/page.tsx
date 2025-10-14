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
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function AtribuirProjetosPage() {
  const supabase = createClientComponentClient();
  const { user, loading } = useUser();
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedRole, setSelectedRole] = useState<
    "translator" | "reviewer" | null
  >(null);
  const [selectedProjects, setSelectedProjects] = useState<number[]>([]);
  const [allProjects, setAllProjects] = useState<any[]>([]); // 👈 armazena todos os projetos carregados
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (loading) return <p className="p-6 text-gray-500">A carregar...</p>;

  // 🔒 Bloqueia acesso se não for PM ou Admin
  if (user && !["pm", "admin"].includes(user.role)) {
    return (
      <div className="p-8 text-center text-gray-500">
        Acesso restrito. Apenas PMs e Admins podem atribuir projetos.
      </div>
    );
  }

  const handleAssign = async () => {
    try {
      for (const projectId of selectedProjects) {
        const { error } = await supabase.from("projects_assignment").insert({
          project_id: projectId,
          user_id: selectedUser.id,
          role_assignment: selectedRole,
        });

        if (error) throw error;
      }

      toast.success(
        `Atribuídos ${selectedProjects.length} projeto(s) a ${selectedUser.name} como ${selectedRole}.`
      );
      setSelectedProjects([]);
      setConfirmOpen(false);
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message || "Erro ao atribuir projetos.");
    }
  };

  // 👇 nomes dos projetos selecionados
  const selectedProjectNames = allProjects
    .filter((p) => selectedProjects.includes(p.id))
    .map((p) => p.name);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Atribuir Projetos</h1>
        <Button variant="outline">Filtros</Button>
      </div>

      <UserSelector
        onSelectUser={setSelectedUser}
        selectedUser={selectedUser}
      />

      {selectedUser && (
        <RoleSelector
          onSelectRole={setSelectedRole}
          selectedRole={selectedRole}
        />
      )}

      {selectedProjects.length > 0 && (
        <div className="flex justify-end pt-4">
          <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
            <AlertDialogTrigger asChild>
              <AssignButton onClick={() => setConfirmOpen(true)} />
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar atribuição</AlertDialogTitle>
                <div className="text-sm text-muted-foreground">
                  Tens a certeza que queres atribuir os seguintes projetos a{" "}
                  <strong>{selectedUser?.name}</strong> como{" "}
                  <strong>{selectedRole}</strong>?
                  <ul className="mt-3 list-disc list-inside text-sm text-gray-700">
                    {selectedProjectNames.map((name) => (
                      <li key={name}>{name}</li>
                    ))}
                  </ul>
                </div>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleAssign}>
                  Confirmar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}

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
          selectedUser={selectedUser} // 👈 aqui
        />
      )}
    </div>
  );
}
