// /lib/sap/instructions.ts
// SAP instruction composition and processing

import type { SapInstruction, SapInstructionEntry } from '@/types/sap';

/**
 * Build composed instructions string from extracted fields.
 * Order: TA, lxe/DITA (if DNW), Graph ID, Hours & Terms (if exist/≠0), TK, WL
 */
export function buildInstructions(params: {
  translationAreas: string[];
  lxeProjects: string[];
  graphIds: string[];
  hours: number;
  terms: number;
  terminologyKeys: string[];
  workLists: string[];
  system: string;
}): string | null {
  const parts: string[] = [];

  if (params.translationAreas.length > 0) {
    parts.push(`TA: ${params.translationAreas.join(', ')}`);
  }

  // LXE/DITA only for DNW system
  if (params.system === 'DNW' && params.lxeProjects.length > 0) {
    parts.push(`LXE: ${params.lxeProjects.join(', ')}`);
  }

  if (params.graphIds.length > 0) {
    parts.push(`Graph ID: ${params.graphIds.join(', ')}`);
  }

  if (params.hours !== 0) {
    parts.push(`Hours: ${params.hours}`);
  }

  if (params.terms !== 0) {
    parts.push(`Terms: ${params.terms}`);
  }

  if (params.terminologyKeys.length > 0) {
    parts.push(`TK: ${params.terminologyKeys.join(', ')}`);
  }

  if (params.workLists.length > 0) {
    parts.push(`WL: ${params.workLists.join(', ')}`);
  }

  return parts.length > 0 ? parts.join('\n') : null;
}

/**
 * Build sap_instructions JSONB array from SAP instruction entries.
 * - Stores both instructionShort and instructionLong
 * - Strips HTML from both fields
 * - Deduplicates by stripped instructionLong text only
 * - Compares exclusions against stripped text (what users see on screen)
 */
export function buildSapInstructions(
  instructions: SapInstruction[],
  exclusions: string[] = []
): SapInstructionEntry[] | null {
  const seen = new Set<string>();
  const entries: SapInstructionEntry[] = [];
  const exclusionSet = new Set(exclusions.map(e => e.toLowerCase().trim()));

  for (const instr of instructions) {
    const rawShort = (instr.instructionShort || '').trim();
    const rawLong = (instr.instructionLong || '').trim();
    if (!rawLong && !rawShort) continue;

    // Strip HTML from both fields
    const strippedShort = stripHtmlTags(rawShort);
    const strippedLong = stripHtmlTags(rawLong);

    const textForDedup = strippedLong || strippedShort;
    if (!textForDedup) continue;

    // Skip if matches exclusion list (compare against stripped text)
    if (exclusionSet.has(textForDedup.toLowerCase())) continue;
    if (strippedShort && exclusionSet.has(strippedShort.toLowerCase())) continue;

    // Deduplicate by stripped long text only
    if (seen.has(textForDedup.toLowerCase())) continue;
    seen.add(textForDedup.toLowerCase());

    entries.push({
      instructionShort: strippedShort,
      instructionLong: strippedLong,
      slsLang: instr.slsLang || undefined,
      contentId: instr.contentId || undefined,
    });
  }

  return entries.length > 0 ? entries : null;
}

/** Strip HTML tags from a string */
export function stripHtmlTags(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
