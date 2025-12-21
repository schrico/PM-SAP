"use client";

import { FileText, Calendar, Clock, FileDown, FileUp } from "lucide-react";
import { formatNumber } from "@/utils/formatters";
import { format, differenceInDays } from "date-fns";
import type { ProjectWithTranslatorDetails } from "@/types/project";

interface ProjectDetailsCardProps {
  project: ProjectWithTranslatorDetails;
}

export function ProjectDetailsCard({ project }: ProjectDetailsCardProps) {
  const calculateDaysLeft = (dueDate: string | null) => {
    if (!dueDate) return "No deadline set";
    const today = new Date();
    const due = new Date(dueDate);
    const diffDays = differenceInDays(due, today);

    if (diffDays < 0) return `${Math.abs(diffDays)} Days Overdue`;
    if (diffDays === 0) return "Due Today";
    if (diffDays === 1) return "1 Day Left";
    return `${diffDays} Days Left`;
  };

  const getClosestDeadline = () => {
    const validDates = [
      project.initial_deadline,
      project.interim_deadline,
      project.final_deadline,
    ]
      .filter(Boolean)
      .map((d) => new Date(d!))
      .filter((d) => !isNaN(d.getTime()));

    if (validDates.length === 0) return null;
    return new Date(Math.min(...validDates.map((d) => d.getTime())));
  };

  const closestDeadline = getClosestDeadline();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-gray-900 dark:text-white mb-6 text-xl font-semibold">
        Project Details
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">
              Status
            </p>
            <p className="text-gray-900 dark:text-white font-medium capitalize">
              {project.status}
            </p>
          </div>
        </div>

        {closestDeadline && (
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">
                Days Left
              </p>
              <p className="text-gray-900 dark:text-white font-medium">
                {calculateDaysLeft(closestDeadline.toISOString())}
              </p>
            </div>
          </div>
        )}

        {project.initial_deadline && (
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">
                Initial Deadline
              </p>
              <p className="text-gray-900 dark:text-white font-medium">
                {format(new Date(project.initial_deadline), "dd MMM yyyy")}
              </p>
            </div>
          </div>
        )}

        {project.interim_deadline && (
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">
                Interim Deadline
              </p>
              <p className="text-gray-900 dark:text-white font-medium">
                {format(new Date(project.interim_deadline), "dd MMM yyyy")}
              </p>
            </div>
          </div>
        )}

        {project.final_deadline && (
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">
                Final Deadline
              </p>
              <p className="text-gray-900 dark:text-white font-medium">
                {format(new Date(project.final_deadline), "dd MMM yyyy")}
              </p>
            </div>
          </div>
        )}

        {project.language_in && (
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900/30 rounded-lg flex items-center justify-center shrink-0">
              <FileDown className="w-5 h-5 text-pink-600 dark:text-pink-400" />
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">
                Source Language
              </p>
              <p className="text-gray-900 dark:text-white font-medium">
                {project.language_in}
              </p>
            </div>
          </div>
        )}

        {project.language_out && (
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center shrink-0">
              <FileUp className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">
                Target Language
              </p>
              <p className="text-gray-900 dark:text-white font-medium">
                {project.language_out}
              </p>
            </div>
          </div>
        )}

        {project.language_in && (
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">
                Word Count
              </p>
              <p className="text-gray-900 dark:text-white font-medium">
                {project.words !== null && project.words !== undefined ?
                  `${formatNumber(project.words)} words`
                : "N/A"}
              </p>
            </div>
          </div>
        )}

        {project.lines !== null && (
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">
                Lines
              </p>
              <p className="text-gray-900 dark:text-white font-medium">
                {project.lines}
              </p>
            </div>
          </div>
        )}

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">
              Paid
            </p>
            <p className="text-gray-900 dark:text-white font-medium">
              {project.paid ? "Yes" : "No"}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">
              Invoiced
            </p>
            <p className="text-gray-900 dark:text-white font-medium">
              {project.invoiced ? "Yes" : "No"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
