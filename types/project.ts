// /types/project.ts
export type ProjectStatus = "complete" | "active" | "cancelled" /* | "pending" */;

export type AssignmentStatus = "unclaimed" | "claimed" | "done" | "rejected";

export type ApiSource = 'manual' | 'TPM_sap_api' | 'XTM_sap_api';

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
  /** @deprecated Use custom_instructions instead */
  instructions?: string | null;
  /** User-editable custom instructions */
  custom_instructions?: string | null;
  /** SAP instructions from SAP API (read-only) */
  sap_instructions?: string | null;
  paid?: boolean | null;
  invoiced?: boolean | null;
  created_at?: string;
  updated_at?: string;
  short?: boolean;
  // SAP integration fields
  sap_subproject_id?: string | null;
  sap_parent_id?: string | null;
  sap_parent_name?: string | null;
  sap_account?: string | null;
  api_source?: ApiSource;
  last_synced_at?: string | null;
}

/** Translator info for project lists */
export interface ProjectTranslator {
  id: string;
  name: string;
  short_name?: string | null;
  role: string;
  assignment_status: AssignmentStatus;
  avatar?: string | null;
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