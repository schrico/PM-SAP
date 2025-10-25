"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUsers } from "@/hooks/useUsers";
import type { User } from "@/types/user";

interface AddTranslatorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: number;
  projectName: string;
  onAddTranslator: (
    projectId: number,
    userId: string,
    roleAssignment: string
  ) => void;
  isAdding: boolean;
}

export function AddTranslatorDialog({
  open,
  onOpenChange,
  projectId,
  projectName,
  onAddTranslator,
  isAdding,
}: AddTranslatorDialogProps) {
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [roleAssignment, setRoleAssignment] = useState<string>("translator");
  const { data: users, isLoading: usersLoading } = useUsers();

  const handleSubmit = () => {
    if (selectedUserId && roleAssignment) {
      onAddTranslator(projectId, selectedUserId, roleAssignment);
      setSelectedUserId("");
      setRoleAssignment("translator");
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    setSelectedUserId("");
    setRoleAssignment("translator");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Translator</DialogTitle>
          <DialogDescription>
            Add a translator to "{projectName}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="translator">Select Translator</Label>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a translator" />
              </SelectTrigger>
              <SelectContent>
                {usersLoading ? (
                  <SelectItem value="loading" disabled>
                    Loading users...
                  </SelectItem>
                ) : (
                  users?.map((user: User) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role Assignment</Label>
            <Select value={roleAssignment} onValueChange={setRoleAssignment}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="translator">Translator</SelectItem>
                <SelectItem value="reviewer">Reviewer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedUserId || !roleAssignment || isAdding}
          >
            {isAdding ? "Adding..." : "Add Translator"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
