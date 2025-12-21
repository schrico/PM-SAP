"use client";

import { useState } from "react";
import { Users, UserPlus, MoreVertical, UserMinus, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ProjectWithTranslatorDetails } from "@/types/project";

interface TranslatorsListProps {
  project: ProjectWithTranslatorDetails;
  onAddTranslator: () => void;
  onRemoveTranslator: (userId: string) => void;
  onSendReminder: (userId: string, userName: string) => void;
}

export function TranslatorsList({
  project,
  onAddTranslator,
  onRemoveTranslator,
  onSendReminder,
}: TranslatorsListProps) {
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const getUserInitials = (name: string): string => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "claimed":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "done":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "rejected":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "claimed":
        return "In Progress";
      case "done":
        return "Done";
      case "rejected":
        return "Rejected";
      default:
        return "Unclaimed";
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-gray-900 dark:text-white text-xl font-semibold">
            Assigned Translators
          </h2>
        </div>
        <Button
          onClick={onAddTranslator}
          size="sm"
          className=" cursor-pointer bg-blue-500 hover:bg-blue-600 text-white"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Add
        </Button>
      </div>

      {project.translators.length > 0 ?
        <div className="space-y-3">
          {project.translators.map((translator) => (
            <div
              key={translator.id}
              className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white shrink-0">
                  {getUserInitials(translator.name)}
                </div>
                <div className="flex-1">
                  <p className="text-gray-900 dark:text-white font-medium">
                    {translator.name}
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    {translator.role}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => onRemoveTranslator(translator.id)}
                      className="text-red-600 dark:text-red-400"
                    >
                      <UserMinus className="w-4 h-4 mr-2" />
                      Remove Translator
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        onSendReminder(translator.id, translator.name)
                      }
                    >
                      <Bell className="w-4 h-4 mr-2" />
                      Send Reminder
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="flex items-center gap-2 ml-13 mb-2">
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs ${getStatusColor(
                    translator.assignment_status
                  )}`}
                >
                  {getStatusLabel(translator.assignment_status)}
                </span>
              </div>

              {/* Messages */}
              {(translator.initial_message ||
                translator.refusal_message ||
                translator.done_message) && (
                <div className="mt-2 space-y-1 ml-13">
                  {translator.initial_message && (
                    <div className="text-xs">
                      <span className="text-gray-500 dark:text-gray-400 font-medium">
                        Initial:
                      </span>{" "}
                      <span className="text-gray-700 dark:text-gray-300">
                        {translator.initial_message}
                      </span>
                    </div>
                  )}
                  {translator.refusal_message && (
                    <div className="text-xs">
                      <span className="text-red-500 dark:text-red-400 font-medium">
                        Refusal:
                      </span>{" "}
                      <span className="text-gray-700 dark:text-gray-300">
                        {translator.refusal_message}
                      </span>
                    </div>
                  )}
                  {translator.done_message && (
                    <div className="text-xs">
                      <span className="text-green-500 dark:text-green-400 font-medium">
                        Done:
                      </span>{" "}
                      <span className="text-gray-700 dark:text-gray-300">
                        {translator.done_message}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      : <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 dark:text-gray-400">
            No translators assigned yet
          </p>
        </div>
      }
    </div>
  );
}
