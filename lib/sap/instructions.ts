// /lib/sap/instructions.ts
// SAP instruction composition and processing

import type { SapInstruction, SapInstructionEntry } from '@/types/sap';
import {
  normalizeInstructionText,
  normalizeInstructionTextForMatch,
} from './instruction-normalization';

/**
 * Build composed instructions string from extracted fields.
 * Order: TA, lxe/DITA (if DNW), Graph ID, Hours & Terms (if exist/=0), TK, WL
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
 * - Normalizes text for consistent display + matching
 * - Deduplicates by normalized long/short text
 * - Compares exclusions against the same normalized representation
 */
export function buildSapInstructions(
  instructions: SapInstruction[],
  exclusions: string[] = []
): SapInstructionEntry[] | null {
  const seen = new Set<string>();
  const entries: SapInstructionEntry[] = [];
  const exclusionSet = new Set(
    exclusions
      .map((e) => normalizeInstructionTextForMatch(e))
      .filter((e) => e.length > 0)
  );

  for (const instr of instructions) {
    const strippedShort = normalizeInstructionText(instr.instructionShort || '');
    const strippedLong = normalizeInstructionText(instr.instructionLong || '');

    const textForDedup = strippedLong || strippedShort;
    const normalizedForMatch = normalizeInstructionTextForMatch(textForDedup);
    if (!normalizedForMatch) continue;

    if (exclusionSet.has(normalizedForMatch)) continue;

    if (seen.has(normalizedForMatch)) continue;
    seen.add(normalizedForMatch);

    entries.push({
      instructionShort: strippedShort,
      instructionLong: strippedLong,
      slsLang: instr.slsLang || undefined,
      contentId: instr.contentId || undefined,
    });
  }

  return entries.length > 0 ? entries : null;
}

/**
 * Legacy helper kept for compatibility with existing imports.
 * Prefer normalizeInstructionText for new code.
 */
export function stripHtmlTags(html: string): string {
  return normalizeInstructionText(html);
}