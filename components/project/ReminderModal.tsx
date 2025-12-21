"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ReminderModalProps {
  open: boolean;
  translatorName: string;
  onClose: () => void;
  onSend: (message: string) => void;
  onSendDefault: () => void;
  isSending: boolean;
}

export function ReminderModal({
  open,
  translatorName,
  onClose,
  onSend,
  onSendDefault,
  isSending,
}: ReminderModalProps) {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim()) {
      onSend(message);
      setMessage("");
    }
  };

  const handleClose = () => {
    setMessage("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Send Reminder to {translatorName}</DialogTitle>
          <DialogDescription>
            Enter a custom message or send a default reminder
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your custom message here..."
            className="min-h-32"
            disabled={isSending}
          />

          <div className="flex items-center justify-between gap-4">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isSending}
            >
              Cancel
            </Button>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={onSendDefault}
                disabled={isSending}
              >
                Send Default
              </Button>
              <Button
                onClick={handleSend}
                disabled={!message.trim() || isSending}
              >
                {isSending ? "Sending..." : "Send Custom Message"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
