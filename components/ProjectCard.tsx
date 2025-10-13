"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import type { Project } from "@/types/project";
import { languageColors, sistemaColors, completedColor } from "@/types/colors";
import Link from "next/link";

export function ProjectCard({ project }: { project: Project }) {
  const langKey = `${project.language_in}→${project.language_out}`;
  const fontColor =
    languageColors[langKey as keyof typeof languageColors] || "text-foreground";

  const isCompleted = project.status === "complete";
  const bg = isCompleted
    ? completedColor
    : sistemaColors[project.sistema as keyof typeof sistemaColors] ||
      "bg-white";

  return (
    <Link href={`/project/${project.id}`} className="w-full">
      <Card
        className={`hover:shadow-lg transition-shadow cursor-pointer ${bg}`}
      >
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span
              className={`truncate ${isCompleted ? "text-white" : fontColor} ""`}
            >
              {project.name}
            </span>
            <Badge className={isCompleted ? "bg-gray-700 text-white" : ""}>
              {project.sistema}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent
          className={`space-y-2 text-sm ${isCompleted ? "text-gray-200" : "text-muted-foreground"}`}
        >
          <p>
            <span
              className={
                isCompleted
                  ? "font-medium text-white"
                  : "font-medium text-foreground"
              }
            >
              Deadline:
            </span>{" "}
            {format(new Date(project.deadline), "dd MMM yyyy, HH:mm")}
          </p>
          <p>
            <span
              className={
                isCompleted
                  ? "font-medium text-white"
                  : "font-medium text-foreground"
              }
            >
              Words:
            </span>{" "}
            {project.words ?? "—"}
          </p>
          <p>
            <span
              className={
                isCompleted
                  ? "font-medium text-white"
                  : "font-medium text-foreground"
              }
            >
              Lines:
            </span>{" "}
            {project.lines ?? "—"}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
