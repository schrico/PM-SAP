// /types/project.ts
import type { ApiSource } from './sap';

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
  /** @deprecated Use custom_instructions instead. Alias for backward compatibility */
  instructions?: string | null;
  /** User-editable team notes (DB column: custom_instructions) */
  custom_instructions?: string | null;
  paid?: boolean | null;
  invoiced?: boolean | null;
  created_at?: string;
  updated_at?: string;
  short?: boolean;

  // SAP Integration Fields
  /** Unique SAP subproject identifier (used for upsert) */
  sap_subproject_id?: string | null;
  /** SAP parent project ID */
  sap_parent_id?: string | null;
  /** SAP parent project name */
  sap_parent_name?: string | null;
  /** SAP account/client name */
  sap_account?: string | null;
  /** Data source: manual, TPM_sap_api, or XTM_sap_api */
  api_source?: ApiSource;
  /** Last time this project was synced from SAP */
  last_synced_at?: string | null;
  /** Read-only instructions from SAP (includes DM name) */
  sap_instructions?: string | null;
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