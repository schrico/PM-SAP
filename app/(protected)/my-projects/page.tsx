"use client";

import { useState } from "react";
import { Loader2, AlertCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/hooks/useUser";
import { useMyProjects } from "@/hooks/useMyProjects";
import { UnclaimedProjectsTable } from "@/components/my-projects/UnclaimedProjectsTable";
import { ClaimedProjectsTable } from "@/components/my-projects/ClaimedProjectsTable";
import { ConfirmationDialog } from "@/components/my-projects/ConfirmationDialog";

export default function MyProjectsPage() {
  const { user, loading: userLoading } = useUser();
  const {
    unclaimedProjects,
    claimedProjects,
    loading: projectsLoading,
    claimProject,
    rejectProject,
    markAsDone,
  } = useMyProjects(user?.id || null);

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    projectId: number | null;
    projectName: string;
  }>({ open: false, projectId: null, projectName: "" });

  function handleMarkAsDoneClick(projectId: number, projectName: string) {
    setConfirmDialog({
      open: true,
      projectId: projectId,
      projectName,
    });
  }

  function handleConfirmMarkAsDone() {
    if (confirmDialog.projectId) {
      markAsDone(confirmDialog.projectId, confirmDialog.projectName);
      setConfirmDialog({ open: false, projectId: null, projectName: "" });
    }
  }

  function handleCancelDialog() {
    setConfirmDialog({ open: false, projectId: null, projectName: "" });
  }

  if (userLoading || projectsLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="animate-spin w-8 h-8 text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Please log in to view your projects</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold">My Projects</h1>

      {/* Unclaimed Projects Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-6 h-6 text-orange-500" />
          <h2 className="text-2xl font-semibold">Unclaimed Projects</h2>
          <Badge variant="secondary">{unclaimedProjects.length}</Badge>
        </div>
        <UnclaimedProjectsTable
          projects={unclaimedProjects}
          loading={false}
          onClaim={claimProject}
          onReject={rejectProject}
        />
      </section>

      {/* Claimed Projects Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Clock className="w-6 h-6 text-blue-500" />
          <h2 className="text-2xl font-semibold">In Progress</h2>
          <Badge variant="secondary">{claimedProjects.length}</Badge>
        </div>
        <ClaimedProjectsTable
          projects={claimedProjects}
          loading={false}
          onMarkAsDone={handleMarkAsDoneClick}
        />
      </section>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={confirmDialog.open}
        projectName={confirmDialog.projectName}
        onConfirm={handleConfirmMarkAsDone}
        onCancel={handleCancelDialog}
      />
    </div>
  );
}