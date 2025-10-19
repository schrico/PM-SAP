import { Project } from './project';

export interface ProjectAssignment {
  id: string;
  project_id: string;
  user_id: string;
  assignment_status: "unclaimed" | "claimed" | "done" | "rejected";
  projects: Project;
}