"use client";

import { useQuery } from '@tanstack/react-query';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Project } from '@/types/project';

interface ProjectWithTranslators extends Project {
  translators: Array<{
    id: string;
    name: string;
    role: string;
    assignment_status: string;
  }>;
}

export function useProjectsWithTranslators(showPast: boolean = false, showAll: boolean = false) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables.");
  }

  const supabase = createClientComponentClient({ supabaseUrl, supabaseKey });

  return useQuery({
    queryKey: ['projects-with-translators', showPast, showAll],
    queryFn: async (): Promise<ProjectWithTranslators[]> => {
      // First, get all projects
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (projectsError) {
        throw new Error(`Failed to fetch projects: ${projectsError.message}`);
      }

      if (!projects || projects.length === 0) {
        return [];
      }

      // Get all project assignments with user data
      const { data: assignments, error: assignmentsError } = await supabase
        .from('projects_assignment')
        .select(`
          project_id,
          assignment_status,
          users (
            id,
            name,
            role
          )
        `) as any;

      if (assignmentsError) {
        throw new Error(`Failed to fetch project assignments: ${assignmentsError.message}`);
      }

      // Group assignments by project_id
      const assignmentsByProject = (assignments || []).reduce((acc: Record<number, Array<{ id: string; name: string; role: string; assignment_status: string }>>, assignment: any) => {
        const projectId = assignment.project_id;
        if (!acc[projectId]) {
          acc[projectId] = [];
        }
        if (assignment.users) {
          acc[projectId].push({
            id: assignment.users.id,
            name: assignment.users.name,
            role: assignment.users.role,
            assignment_status: assignment.assignment_status,
          });
        }
        return acc;
      }, {});

      // Combine projects with their translators
      const projectsWithTranslators: ProjectWithTranslators[] = projects.map(project => ({
        ...project,
        translators: assignmentsByProject[project.id] || []
      }));

      // Filter and sort projects based on showPast parameter
      const now = new Date();
      
      const getClosestDeadline = (p: ProjectWithTranslators) => {
        const validDates = [p.initial_deadline, p.interim_deadline, p.final_deadline]
          .filter(Boolean)
          .map((d) => {
            const date = new Date(d!);
            return isNaN(date.getTime()) ? null : date;
          })
          .filter(Boolean);
        
        if (validDates.length === 0) return null;
        return new Date(Math.min(...validDates.map((d) => d!.getTime())));
      };

      // Filter projects based on their closest deadline
      // If showAll is true, return all projects without filtering
      const filteredProjects = showAll
        ? projectsWithTranslators // Show all projects
        : projectsWithTranslators.filter((p) => {
            const closest = getClosestDeadline(p);
            if (!closest) return false; // Exclude projects without valid deadlines
            
            const isPast = closest.getTime() < now.getTime();
            const shouldInclude = showPast ? isPast : !isPast;
            
            return shouldInclude;
          });

      // Sort projects
      const sortedProjects = filteredProjects.sort((a, b) => {
        const da = getClosestDeadline(a);
        const db = getClosestDeadline(b);
        
        // Handle projects without deadlines
        if (!da && !db) return 0;
        if (!da) return 1; // Put projects without deadlines at the end
        if (!db) return -1;
        
        if (showPast) {
          // For past projects: most recent first (reverse chronological order)
          return db.getTime() - da.getTime();
        } else {
          // For future projects: closest deadline first (chronological order)
          return da.getTime() - db.getTime();
        }
      });

      return sortedProjects;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
