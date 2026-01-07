"use client";

import { useMemo } from "react";
import { useUsers } from "./useUsers";
import { useProjectsWithTranslators } from "./useProjectsWithTranslators";

export interface ProjectTranslatorInfo {
  id: string;
  name: string;
  shortName: string | null;
  avatar: string | null;
}

export interface UserWorkloadProject {
  id: number;
  name: string;
  system: string;
  wordsShare: number;
  linesShare: number;
  deadline: Date | null;
  initialDeadline: string | null;
  interimDeadline: string | null;
  finalDeadline: string | null;
  translators: ProjectTranslatorInfo[];
}

export interface UserWorkload {
  userId: string;
  userName: string;
  shortName: string | null;
  avatar: string | null;
  wordsPerHour: number;
  linesPerHour: number;
  totalWords: number;
  totalLines: number;
  estimatedHours: number;
  earliestDeadline: Date | null;
  isFeasible: boolean;
  // Next week stats (projects due within 7 days)
  nextWeekWords: number;
  nextWeekLines: number;
  nextWeekEstimatedHours: number;
  nextWeekIsFeasible: boolean;
  projects: UserWorkloadProject[];
}

const DEFAULT_WORDS_PER_HOUR = 500;
const DEFAULT_LINES_PER_HOUR = 50;

export function useUserWorkload() {
  const { data: users = [], isLoading: usersLoading } = useUsers();
  const { data: projects = [], isLoading: projectsLoading } = useProjectsWithTranslators(false, true);

  const workloads = useMemo(() => {
    const workloadMap = new Map<string, UserWorkload>();

    // Filter to only active projects (not complete)
    const activeProjects = projects.filter((p) => p.status !== "complete");

    // Calculate the date 7 days from now for next week filter
    const now = new Date();
    const nextWeekDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Initialize workload for each user
    users.forEach((user) => {
      workloadMap.set(user.id, {
        userId: user.id,
        userName: user.name,
        shortName: user.short_name || null,
        avatar: user.avatar || null,
        wordsPerHour: user.words_per_hour || DEFAULT_WORDS_PER_HOUR,
        linesPerHour: user.lines_per_hour || DEFAULT_LINES_PER_HOUR,
        totalWords: 0,
        totalLines: 0,
        estimatedHours: 0,
        earliestDeadline: null,
        isFeasible: true,
        nextWeekWords: 0,
        nextWeekLines: 0,
        nextWeekEstimatedHours: 0,
        nextWeekIsFeasible: true,
        projects: [],
      });
    });

    // Calculate workload for each project
    activeProjects.forEach((project) => {
      const translatorCount = project.translators.length;
      if (translatorCount === 0) return;

      // Calculate share per translator
      const wordsShare = Math.ceil((project.words || 0) / translatorCount);
      const linesShare = Math.ceil((project.lines || 0) / translatorCount);

      // Get closest deadline
      const deadlines = [
        project.final_deadline,
        project.interim_deadline,
        project.initial_deadline,
      ]
        .filter(Boolean)
        .map((d) => {
          const date = new Date(d!);
          return isNaN(date.getTime()) ? null : date;
        })
        .filter(Boolean) as Date[];

      const projectDeadline = deadlines.length > 0
        ? new Date(Math.min(...deadlines.map((d) => d.getTime())))
        : null;

      // Map translator info for this project
      const projectTranslators: ProjectTranslatorInfo[] = project.translators.map((t) => ({
        id: t.id,
        name: t.name,
        shortName: t.short_name || null,
        avatar: t.avatar || null,
      }));

      // Check if project is due within next week
      const isDueNextWeek = projectDeadline && projectDeadline <= nextWeekDate;

      // Add share to each assigned translator
      project.translators.forEach((translator) => {
        const userWorkload = workloadMap.get(translator.id);
        if (!userWorkload) return;

        userWorkload.totalWords += wordsShare;
        userWorkload.totalLines += linesShare;

        // Add to next week stats if deadline is within 7 days
        if (isDueNextWeek) {
          userWorkload.nextWeekWords += wordsShare;
          userWorkload.nextWeekLines += linesShare;
        }

        userWorkload.projects.push({
          id: project.id,
          name: project.name,
          system: project.system,
          wordsShare,
          linesShare,
          deadline: projectDeadline,
          initialDeadline: project.initial_deadline,
          interimDeadline: project.interim_deadline,
          finalDeadline: project.final_deadline,
          translators: projectTranslators,
        });

        // Update earliest deadline
        if (projectDeadline) {
          if (!userWorkload.earliestDeadline || projectDeadline < userWorkload.earliestDeadline) {
            userWorkload.earliestDeadline = projectDeadline;
          }
        }
      });
    });

    // Calculate estimated hours and feasibility for each user
    workloadMap.forEach((workload) => {
      // Total workload calculations
      const wordHours = workload.totalWords / workload.wordsPerHour;
      const lineHours = workload.totalLines / workload.linesPerHour;
      workload.estimatedHours = Math.round((wordHours + lineHours) * 10) / 10;

      // Next week workload calculations
      const nextWeekWordHours = workload.nextWeekWords / workload.wordsPerHour;
      const nextWeekLineHours = workload.nextWeekLines / workload.linesPerHour;
      workload.nextWeekEstimatedHours = Math.round((nextWeekWordHours + nextWeekLineHours) * 10) / 10;

      // Calculate feasibility based on time until deadline
      // Assuming 8 working hours per day
      if (workload.earliestDeadline) {
        const hoursUntilDeadline = Math.max(
          0,
          (workload.earliestDeadline.getTime() - now.getTime()) / (1000 * 60 * 60)
        );
        const workingHoursUntilDeadline = (hoursUntilDeadline / 24) * 8; // Approximate working hours
        workload.isFeasible = workload.estimatedHours <= workingHoursUntilDeadline;
      } else {
        workload.isFeasible = true; // No deadline means feasible
      }

      // Next week feasibility: can they complete next week work within 7 days?
      // 7 days * 8 working hours = 56 working hours available
      const nextWeekWorkingHours = 7 * 8;
      workload.nextWeekIsFeasible = workload.nextWeekEstimatedHours <= nextWeekWorkingHours;
    });

    return workloadMap;
  }, [users, projects]);

  return {
    workloads,
    isLoading: usersLoading || projectsLoading,
  };
}

