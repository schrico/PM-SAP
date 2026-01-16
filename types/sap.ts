// /types/sap.ts
// SAP TPM API response types and internal mapping types

// ============================================================================
// SAP API Response Types (from /v1/suppliers/projects endpoints)
// ============================================================================

/** Response from GET /v1/suppliers/projects */
export interface SapProjectDTO {
  projects: SapProject[];
}

/** Project from SAP (contains sub-projects) */
export interface SapProject {
  projectId: number;
  projectName: string;
  account: string;
  subProjects: SapSubProject[];
}

/** Sub-project summary from project list */
export interface SapSubProject {
  subProjectId: string;
  subProjectName: string;
  dmName: string;
  pmName: string;
  projectType: string;
}

/** Detailed sub-project info from GET /v1/suppliers/projects/{id}/subprojects/{subId} */
export interface SapSubProjectInfo {
  subProjectId: string;
  subProjectName: string;
  terminologyKey: string[];
  environment: SapEnvironment[];
  subProjectSteps: SapStep[];
}

/** Environment info for sub-project */
export interface SapEnvironment {
  environmentName: string;
  environmentValue: string;
}

/** Step within a sub-project (contains dates, volumes, language info) */
export interface SapStep {
  contentId: string;
  serviceStep: string;
  stepText: string;
  slsLang: string;       // Target language
  sourceLang: string;    // Source language
  startDate: string;     // ISO date string
  endDate: string;       // ISO date string
  hasInstructions: boolean;
  toolType: string;      // Maps to system field (XTM, LXE, SSE, STM, etc.)
  volume: SapVolume[];
}

/** Volume info within a step */
export interface SapVolume {
  volumeQuantity: number;
  volumeUnit: string;    // "Words", "Lines", etc.
  activityText: string;
}

/** Response from GET /v1/suppliers/projects/{id}/subprojects/{subId}/instructions */
export interface SapInstructionDTO {
  instructions: SapInstruction[];
}

/** Individual instruction entry */
export interface SapInstruction {
  instructionType: string;
  instructionShort: string;
  instructionLong: string;
}

/** Error response from SAP API */
export interface SapErrorDTO {
  error: string;
  message: string;
  status: number;
  timestamp: string;
  path: string;
}

// ============================================================================
// Internal Types (for mapping SAP data to local database)
// ============================================================================

/** Data ready to be inserted/updated in the projects table */
export interface SapProjectForImport {
  sap_subproject_id: string;
  sap_parent_id: string;
  sap_parent_name: string;
  sap_account: string;
  name: string;
  language_in: string | null;
  language_out: string | null;
  initial_deadline: string | null;
  final_deadline: string | null;
  sap_instructions: string | null;
  system: string;
  api_source: 'TPM_sap_api';
  last_synced_at: string;
}

/** Request body for POST /api/sap/sync */
export interface SapSyncRequest {
  projects: Array<{
    projectId: number;    // SAP parent project ID
    subProjectId: string; // SAP sub-project ID
  }>;
}

/** Response from POST /api/sap/sync */
export interface SapSyncResponse {
  imported: number;  // New projects created
  updated: number;   // Existing projects updated
  failed: number;    // Projects that failed to import
  errors?: string[]; // Error messages for failed imports
}

/** Response from GET /api/sap/projects (transformed for frontend) */
export interface SapProjectListItem {
  projectId: number;
  projectName: string;
  account: string;
  subProjects: SapSubProjectListItem[];
}

/** Sub-project item for the import list */
export interface SapSubProjectListItem {
  subProjectId: string;
  subProjectName: string;
  dmName: string;
  pmName: string;
  projectType: string;
  /** Whether this sub-project already exists in local DB */
  existsLocally: boolean;
  /** Local project ID if exists */
  localProjectId?: number;
  /** Whether local version needs update (SAP has newer data) */
  needsUpdate?: boolean;
}

/** Combined sub-project details (info + instructions) for import preview */
export interface SapSubProjectDetails {
  subProjectId: string;
  subProjectName: string;
  dmName: string;
  languages: {
    source: string | null;
    target: string | null;
  };
  deadlines: {
    start: string | null;
    end: string | null;
  };
  system: string;
  instructions: string | null;
  // Volume info (for display only - not imported per client requirement)
  volumes: {
    words: number;
    lines: number;
  };
}

// ============================================================================
// API Source Type
// ============================================================================

export type ApiSource = 'manual' | 'TPM_sap_api' | 'XTM_sap_api';

// ============================================================================
// System/ToolType Mapping
// ============================================================================

/** Map SAP toolType to local system value */
export const TOOL_TYPE_TO_SYSTEM: Record<string, string> = {
  'XTM': 'XTM',
  'LXE': 'LAT',
  'SSE': 'SSE',
  'STM': 'STM',
};

/** Default system when toolType is not recognized */
export const DEFAULT_SYSTEM = 'B0X';
