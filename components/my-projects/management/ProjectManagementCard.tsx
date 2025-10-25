"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Edit,
  CheckCircle,
  UserPlus,
  UserMinus,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
} from "lucide-react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import type { GroupedProject } from "@/hooks/useProjectManagement";
import { useColorSettings } from "@/hooks/useColorSettings";

interface ProjectManagementCardProps {
  project: GroupedProject;
  onMarkComplete: (projectId: number) => void;
  onAddTranslator: (projectId: number) => void;
  onRemoveTranslator: (projectId: number, userId: string) => void;
  onUpdateStatus: (
    projectId: number,
    userId: string,
    status: "unclaimed" | "claimed" | "done" | "rejected"
  ) => void;
  isCollapsible?: boolean;
  isMarkingComplete?: boolean;
  showAssignAgain?: boolean;
}

export function ProjectManagementCard({
  project,
  onMarkComplete,
  onAddTranslator,
  onRemoveTranslator,
  onUpdateStatus,
  isCollapsible = false,
  isMarkingComplete = false,
  showAssignAgain = false,
}: ProjectManagementCardProps) {
  const router = useRouter();
  const { getRowColors } = useColorSettings();
  const [isExpanded, setIsExpanded] = useState(!isCollapsible);

  const formatDeadline = (date: string | null) => {
    if (!date) return null;
    try {
      return format(new Date(date), "dd/MM HH'h'", { locale: pt });
    } catch {
      return null;
    }
  };

  const getDeadlineBadge = (deadline: string | null) => {
    if (!deadline) return null;

    const now = new Date();
    const deadlineDate = new Date(deadline);
    const hoursUntilDeadline =
      (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilDeadline < 0) {
      return (
        <Badge variant="destructive" className="ml-2">
          Overdue
        </Badge>
      );
    } else if (hoursUntilDeadline < 24) {
      return (
        <Badge variant="destructive" className="ml-2">
          Due Soon
        </Badge>
      );
    } else if (hoursUntilDeadline < 72) {
      return (
        <Badge variant="secondary" className="ml-2">
          Due in {Math.ceil(hoursUntilDeadline / 24)} days
        </Badge>
      );
    }
    return null;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "unclaimed":
        return "bg-gray-100 text-gray-800";
      case "claimed":
        return "bg-blue-100 text-blue-800";
      case "done":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "unclaimed":
        return "Unclaimed";
      case "claimed":
        return "In Progress";
      case "done":
        return "Done";
      case "rejected":
        return "Rejected";
      default:
        return status;
    }
  };

  const nearestDeadline =
    project.interim_deadline || project.final_deadline || null;
  const { bgColor, textColor } = getRowColors({
    status: project.project_status,
    system: project.system,
    langIn: project.language_in || undefined,
    langOut: project.language_out || undefined,
  });

  const isProjectComplete = project.project_status === "complete";
  const allTranslatorsDone =
    project.translators.length > 0 &&
    project.translators.every((t) => t.assignment_status === "done");

  return (
    <Card
      className="w-full border transition-all duration-200 hover:shadow-lg"
      style={{ backgroundColor: bgColor }}
    >
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1">
            <CardTitle
              className="text-lg font-semibold mb-2"
              style={{ color: textColor }}
            >
              {project.project_name}
            </CardTitle>

            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs">
                {project.system}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {project.language_in} → {project.language_out}
              </Badge>
              {project.project_status === "complete" && (
                <Badge variant="default" className="text-xs bg-green-600">
                  Complete
                </Badge>
              )}
            </div>

            <div className="text-sm text-muted-foreground">
              {nearestDeadline && (
                <div className="flex flex-wrap items-center gap-1">
                  <span className="font-medium">Deadline:</span>
                  <span>{formatDeadline(nearestDeadline)}</span>
                  {getDeadlineBadge(nearestDeadline)}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/project/${project.project_id}/edit`)}
              className="flex items-center gap-1 text-xs sm:text-sm"
            >
              <Edit className="w-4 h-4" />
              <span className="hidden sm:inline">Edit</span>
            </Button>

            {!isProjectComplete && allTranslatorsDone && (
              <Button
                variant="default"
                size="sm"
                onClick={() => onMarkComplete(project.project_id)}
                disabled={isMarkingComplete}
                className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-xs sm:text-sm"
              >
                <CheckCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Mark Complete</span>
                <span className="sm:hidden">Complete</span>
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Translator Management Section */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h4 className="font-medium text-sm">
              Translators ({project.translators.length})
            </h4>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAddTranslator(project.project_id)}
                className="flex items-center gap-1 text-xs"
              >
                <UserPlus className="w-3 h-3" />
                <span className="hidden sm:inline">Add Translator</span>
                <span className="sm:hidden">Add</span>
              </Button>

              {isCollapsible && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-1"
                  aria-label={
                    isExpanded ? "Collapse translators" : "Expand translators"
                  }
                >
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </Button>
              )}
            </div>
          </div>

          {isExpanded && (
            <div className="space-y-2">
              {project.translators.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">
                  No translators assigned
                </p>
              ) : (
                <div className="space-y-2">
                  {project.translators.map((translator) => (
                    <div
                      key={translator.user_id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-white rounded-lg border gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-medium text-sm">
                            {translator.translator_name}
                          </p>
                          <Badge
                            variant="outline"
                            className={`text-xs ${getStatusColor(translator.assignment_status)}`}
                          >
                            {getStatusLabel(translator.assignment_status)}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {showAssignAgain &&
                          translator.assignment_status !== "unclaimed" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                onUpdateStatus(
                                  project.project_id,
                                  translator.user_id,
                                  "unclaimed"
                                )
                              }
                              className="text-xs px-2 py-1"
                            >
                              Assign Again
                            </Button>
                          )}

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            onRemoveTranslator(
                              project.project_id,
                              translator.user_id
                            )
                          }
                          className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50"
                          aria-label={`Remove ${translator.translator_name}`}
                        >
                          <UserMinus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
