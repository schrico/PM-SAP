// /lib/sap/mappers.ts
// Transform SAP API data to internal database format

import type {
  SapProject,
  SapSubProject,
  SapSubProjectInfo,
  SapInstruction,
  SapStep,
  SapProjectForImport,
  SapSubProjectDetails,
  TOOL_TYPE_TO_SYSTEM,
  DEFAULT_SYSTEM,
} from '@/types/sap';

// Re-export constants for use in this module
const toolTypeMapping: Record<string, string> = {
  'XTM': 'XTM',
  'LXE': 'LAT',
  'SSE': 'SSE',
  'STM': 'STM',
};
const defaultSystem = 'B0X';

/**
 * Map SAP toolType to local system value
 */
export function mapToolTypeToSystem(toolType: string | undefined): string {
  if (!toolType) return defaultSystem;
  return toolTypeMapping[toolType.toUpperCase()] || defaultSystem;
}

/**
 * Sum volumes by unit type across all steps
 */
export function sumVolumesByUnit(steps: SapStep[], unit: string): number {
  return steps.reduce((total, step) => {
    const volumeMatch = step.volume.find(
      v => v.volumeUnit.toLowerCase() === unit.toLowerCase()
    );
    return total + (volumeMatch?.volumeQuantity || 0);
  }, 0);
}

/**
 * Extract earliest start date and latest end date from steps
 */
export function extractDateRange(steps: SapStep[]): {
  startDate: string | null;
  endDate: string | null;
} {
  if (!steps.length) {
    return { startDate: null, endDate: null };
  }

  const validDates = steps.filter(s => s.startDate && s.endDate);
  if (!validDates.length) {
    return { startDate: null, endDate: null };
  }

  const startDates = validDates
    .map(s => new Date(s.startDate))
    .filter(d => !isNaN(d.getTime()));

  const endDates = validDates
    .map(s => new Date(s.endDate))
    .filter(d => !isNaN(d.getTime()));

  const earliestStart = startDates.length
    ? new Date(Math.min(...startDates.map(d => d.getTime())))
    : null;

  const latestEnd = endDates.length
    ? new Date(Math.max(...endDates.map(d => d.getTime())))
    : null;

  return {
    startDate: earliestStart?.toISOString() || null,
    endDate: latestEnd?.toISOString() || null,
  };
}

/**
 * Extract language pair from steps (first step with language info)
 */
export function extractLanguages(steps: SapStep[]): {
  source: string | null;
  target: string | null;
} {
  const stepWithLang = steps.find(s => s.sourceLang || s.slsLang);
  return {
    source: stepWithLang?.sourceLang || null,
    target: stepWithLang?.slsLang || null,
  };
}

/**
 * Extract system/tool type from steps (first step with toolType)
 */
export function extractSystem(steps: SapStep[]): string {
  const stepWithTool = steps.find(s => s.toolType);
  return mapToolTypeToSystem(stepWithTool?.toolType);
}

/**
 * Build SAP instructions string from DM name and instruction entries
 */
export function buildSapInstructions(
  dmName: string,
  instructions: SapInstruction[]
): string | null {
  const parts: string[] = [];

  // Always include DM name if present
  if (dmName) {
    parts.push(`DM: ${dmName}`);
  }

  // Add instruction content
  const instructionText = instructions
    .filter(i => i.instructionLong || i.instructionShort)
    .map(i => i.instructionLong || i.instructionShort)
    .join('\n\n');

  if (instructionText) {
    parts.push(instructionText);
  }

  return parts.length > 0 ? parts.join('\n\n') : null;
}

/**
 * Map SAP subproject data to database import format
 */
export function mapSapToProjectImport(
  subProject: SapSubProject,
  parent: SapProject,
  details: SapSubProjectInfo,
  instructions: SapInstruction[]
): SapProjectForImport {
  const dates = extractDateRange(details.subProjectSteps);
  const languages = extractLanguages(details.subProjectSteps);
  const system = extractSystem(details.subProjectSteps);
  const sapInstructions = buildSapInstructions(subProject.dmName, instructions);

  return {
    sap_subproject_id: subProject.subProjectId,
    sap_parent_id: String(parent.projectId),
    sap_parent_name: parent.projectName,
    sap_account: parent.account,
    name: subProject.subProjectName,
    language_in: languages.source,
    language_out: languages.target,
    initial_deadline: dates.startDate,
    final_deadline: dates.endDate,
    sap_instructions: sapInstructions,
    system,
    api_source: 'TPM_sap_api',
    last_synced_at: new Date().toISOString(),
  };
}

/**
 * Map SAP subproject to preview details (for import UI)
 */
export function mapSapToSubProjectDetails(
  subProject: SapSubProject,
  details: SapSubProjectInfo,
  instructions: SapInstruction[]
): SapSubProjectDetails {
  const dates = extractDateRange(details.subProjectSteps);
  const languages = extractLanguages(details.subProjectSteps);
  const system = extractSystem(details.subProjectSteps);
  const sapInstructions = buildSapInstructions(subProject.dmName, instructions);

  // Calculate volumes for display (not imported per client requirement)
  const words = sumVolumesByUnit(details.subProjectSteps, 'Words');
  const lines = sumVolumesByUnit(details.subProjectSteps, 'Lines');

  return {
    subProjectId: subProject.subProjectId,
    subProjectName: subProject.subProjectName,
    dmName: subProject.dmName,
    languages: {
      source: languages.source,
      target: languages.target,
    },
    deadlines: {
      start: dates.startDate,
      end: dates.endDate,
    },
    system,
    instructions: sapInstructions,
    volumes: {
      words,
      lines,
    },
  };
}

/**
 * Sanitize string for database storage (XSS prevention)
 */
export function sanitizeString(input: string | null | undefined): string | null {
  if (!input) return null;

  // Remove potentially dangerous characters while preserving legitimate content
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .trim();
}

/**
 * Apply sanitization to all string fields in import data
 */
export function sanitizeImportData(
  data: SapProjectForImport
): SapProjectForImport {
  return {
    ...data,
    name: sanitizeString(data.name) || data.name,
    sap_parent_name: sanitizeString(data.sap_parent_name) || data.sap_parent_name,
    sap_account: sanitizeString(data.sap_account) || data.sap_account,
    sap_instructions: sanitizeString(data.sap_instructions),
  };
}
