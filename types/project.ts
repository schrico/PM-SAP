// /types/project.ts
export type ProjectStatus = "complete" | "active" | "cancelled" /* | "pending" */;

export type AssignmentStatus = "unclaimed" | "claimed" | "done" | "rejected";

export interface Project {
  id: number;
  name: string;
  interim_deadline: string | null;
  initial_deadline: string | null;
  final_deadline: string | null;
  translator: string | null;
  system: string;
  words: number | null;
  lines: number | null;
  status: ProjectStatus;
  language_in: string;
  language_out: string;
  instructions?: string | null;
  paid?: boolean | null;
  invoiced?: boolean | null;
  created_at?: string;
  updated_at?: string;
  short?: boolean;
}

/** Translator info for project lists */
export interface ProjectTranslator {
  id: string;
  name: string;
  role: string;
  assignment_status: AssignmentStatus;
}

/** Extended translator info with messages (for detail views) */
export interface ProjectTranslatorWithMessages extends ProjectTranslator {
  initial_message?: string | null;
  refusal_message?: string | null;
  done_message?: string | null;
}

/** Project with basic translator info (for lists) */
export interface ProjectWithTranslators extends Project {
  translators: ProjectTranslator[];
}

/** Project with detailed translator info including messages (for detail/edit views) */
export interface ProjectWithTranslatorDetails extends Project {
  translators: ProjectTranslatorWithMessages[];
}