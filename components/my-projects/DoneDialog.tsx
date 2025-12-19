"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DoneDialogProps {
  open: boolean;
  projectName: string;
  onConfirm: (message: string | null) => void;
  onCancel: () => void;
}

export function DoneDialog({
  open,
  projectName,
  onConfirm,
  onCancel,
}: DoneDialogProps) {
  const [message, setMessage] = useState("");

  const handleConfirm = () => {
    onConfirm(message.trim() || null);
    setMessage("");
  };

  const handleCancel = () => {
    setMessage("");
    onCancel();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleCancel()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Mark Project as Done</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Add an optional note for "{projectName}":
            </p>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a note about what was completed (optional)..."
              className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none min-h-[120px]"
              rows={4}
            />
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            Mark as Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
