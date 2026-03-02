// /lib/sap/mappers.ts
// Transform SAP API data to internal database format

import type {
  SapProject,
  SapSubProject,
  SapSubProjectInfo,
  SapEnvironment,
  SapInstruction,
  SapStep,
  SapProjectForImport,
  SapSubProjectDetails,
  SapInstructionEntry,
} from '@/types/sap';

// ============================================================================
// System Extraction
// ============================================================================

/**
 * Extract system from steps and environment.
 * Priority:
 * 1. stepText === "Test, correct and report result" → LAT
 * 2. toolType === "SAP" → extract from environmentName
 * 3. toolType === "XTM_PM" or "XTM" → XTM
 * 4. Otherwise → Unknown
 */
export function extractSystem(steps: SapStep[], environment?: SapEnvironment[]): string {
  // 1. Check for LAT test step
  if (steps.some(s => s.stepText === 'Test, correct and report result')) {
    return 'LAT';
  }

  // Find toolType from environment (authoritative per OpenAPI spec)
  const envWithTool = environment?.find(e => e.toolType);
  const toolType = envWithTool?.toolType?.toUpperCase();

  // 2. SAP toolType → extract system from environmentName
  if (toolType === 'SAP') {
    const envName = envWithTool?.environmentName || '';
    // Extract: chars after "SAP Translation System - " before next " "
    const prefix = 'SAP Translation System - ';
    const idx = envName.indexOf(prefix);
    if (idx !== -1) {
      const rest = envName.slice(idx + prefix.length);
      const system = rest.split(' ')[0];
      if (system) return system;
    }
    return 'Unknown';
  }

  // 3. XTM toolType
  if (toolType === 'XTM_PM' || toolType === 'XTM') {
    return 'XTM';
  }

  // Fallback: try step-level toolType
  const stepWithTool = steps.find(s => s.toolType);
  if (stepWithTool?.toolType) {
    const stepToolType = stepWithTool.toolType.toUpperCase();
    if (stepToolType === 'SAP') return 'Unknown';
    if (stepToolType === 'XTM_PM' || stepToolType === 'XTM') return 'XTM';
  }

  return 'Unknown';
}

// ============================================================================
// Field Extraction Helpers
// ============================================================================

/** Extract unique terminology key numbers from details */
export function extractTerminologyKeys(details: SapSubProjectInfo): string[] {
  if (!details.terminologyKey?.length) return [];
  // Extract unique TK values
  return [...new Set(details.terminologyKey.filter(Boolean))];
}

/** Extract first number from each lxeProject entry (only for systems with LXE) */
export function extractLxeProjects(env: SapEnvironment[], system: string): string[] {
  // Only extract for systems that use LXE
  const relevantEnvs = env.filter(e => e.lxeProject?.length > 0);
  const projects: string[] = [];
  for (const e of relevantEnvs) {
    for (const lxe of e.lxeProject) {
      const num = lxe.split(/\s+/)[0];
      if (num) projects.push(num);
    }
  }
  return [...new Set(projects)];
}

/** Extract first code from each translationArea */
export function extractTranslationAreas(env: SapEnvironment[]): string[] {
  const areas: string[] = [];
  for (const e of env) {
    if (e.translationArea?.length > 0) {
      for (const ta of e.translationArea) {
        const code = ta.split(/\s+/)[0];
        if (code) areas.push(code);
      }
    }
  }
  return [...new Set(areas)];
}

/** Extract first number from each worklist */
export function extractWorkLists(env: SapEnvironment[]): string[] {
  const lists: string[] = [];
  for (const e of env) {
    if (e.worklist?.length > 0) {
      for (const wl of e.worklist) {
        const num = wl.split(/\s+/)[0];
        if (num) lists.push(num);
      }
    }
  }
  return [...new Set(lists)];
}

/** Extract first number from each graphId */
export function extractGraphIds(env: SapEnvironment[]): string[] {
  const ids: string[] = [];
  for (const e of env) {
    if (e.graphId?.length > 0) {
      for (const gid of e.graphId) {
        const num = gid.split(/\s+/)[0];
        if (num) ids.push(num);
      }
    }
  }
  return [...new Set(ids)];
}

/** Extract URL from subProjectFiles of first step that has one */
export function extractUrl(steps: SapStep[]): string | null {
  for (const step of steps) {
    if (step.subProjectFiles && step.subProjectFiles.trim()) {
      return step.subProjectFiles.trim();
    }
  }
  return null;
}

/** Extract hours from volumeUnit "Hours" across steps */
export function extractHours(steps: SapStep[]): number {
  let total = 0;
  for (const step of steps) {
    for (const vol of step.volume ?? []) {
      if (vol.volumeUnit === 'Hours') {
        total += vol.volumeQuantity || vol.ceBillQuantity || 0;
      }
    }
  }
  return total;
}

/** Extract PM name from subProject dmName */
export function extractSapPm(subProject: SapSubProject): string | null {
  return subProject.dmName || null;
}

/** Extract project type from subProject */
export function extractProjectType(subProject: SapSubProject): string | null {
  return subProject.projectType || null;
}

// ============================================================================
// Volume Extraction
// ============================================================================

/** Sum volumes by unit type across steps, using volumeQuantity with ceBillQuantity fallback */
export function sumVolumesByUnit(steps: SapStep[], unit: string): number {
  return steps.reduce((total, step) => {
    const match = (step.volume ?? []).find(
      v => v.volumeUnit.toLowerCase() === unit.toLowerCase()
    );
    if (!match) return total;
    return total + (match.volumeQuantity || match.ceBillQuantity || 0);
  }, 0);
}

/** Count terms from steps */
export function countTerms(steps: SapStep[]): number {
  return steps.reduce((total, step) => {
    const match = (step.volume ?? []).find(v => v.volumeUnit === 'Terms');
    return total + (match ? 1 : 0);
  }, 0);
}

// ============================================================================
// Instructions Composition
// ============================================================================

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

/** Strip HTML tags from a string (used internally by mappers) */
function stripHtmlTags(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// ============================================================================
// Step Joining (TRANSLFWL + TRANSLREGU)
// ============================================================================

interface JoinedStepGroup {
  contentId: string;
  languageIn: string | null;
  languageOut: string | null;
  initialDeadline: string | null;  // from TRANSLREGU endDate
  finalDeadline: string | null;    // from TRANSLFWL endDate
  words: number;
  lines: number;
  hours: number;
  terms: number;
  hasTermsInFwl: boolean;
  allSteps: SapStep[];
}

/**
 * Group steps by contentId + language pair, joining TRANSLFWL and TRANSLREGU.
 * TRANSLREGU endDate → initial_deadline
 * TRANSLFWL endDate → final_deadline
 */
function joinSteps(steps: SapStep[]): JoinedStepGroup[] {
  const groups = new Map<string, JoinedStepGroup>();

  for (const step of steps) {
    const key = `${step.contentId}|${step.sourceLang}|${step.slsLang}`;

    if (!groups.has(key)) {
      groups.set(key, {
        contentId: step.contentId,
        languageIn: step.sourceLang || null,
        languageOut: step.slsLang || null,
        initialDeadline: null,
        finalDeadline: null,
        words: 0,
        lines: 0,
        hours: 0,
        terms: 0,
        hasTermsInFwl: false,
        allSteps: [],
      });
    }

    const group = groups.get(key)!;
    group.allSteps.push(step);

    // Deadline assignment based on service step type
    if (step.serviceStep === 'TRANSLREGU' && step.endDate) {
      if (!group.initialDeadline || step.endDate > group.initialDeadline) {
        group.initialDeadline = step.endDate;
      }
    }
    if (step.serviceStep === 'TRANSLFWL' && step.endDate) {
      if (!group.finalDeadline || step.endDate > group.finalDeadline) {
        group.finalDeadline = step.endDate;
      }
    }

    // If neither TRANSLFWL nor TRANSLREGU, use endDate as final_deadline
    if (step.serviceStep !== 'TRANSLREGU' && step.serviceStep !== 'TRANSLFWL' && step.endDate) {
      if (!group.finalDeadline || step.endDate > group.finalDeadline) {
        group.finalDeadline = step.endDate;
      }
    }

    // Sum volumes from this step
    for (const vol of step.volume ?? []) {
      const qty = vol.volumeQuantity || vol.ceBillQuantity || 0;
      switch (vol.volumeUnit) {
        case 'Words': group.words += qty; break;
        case 'Lines': group.lines += qty; break;
        case 'Hours': group.hours += qty; break;
        case 'Terms': group.terms += 1; break;
      }
    }

    // Track Terms presence in TRANSLFWL steps specifically
    if (step.serviceStep === 'TRANSLFWL' && (step.volume ?? []).some(v => v.volumeUnit === 'Terms')) {
      group.hasTermsInFwl = true;
    }
  }

  return Array.from(groups.values());
}

// ============================================================================
// Multi-Project Logic
// ============================================================================

/** Systems that create language_pairs × translationAreas projects */
const MULTI_TA_SYSTEMS = new Set(['SSE', 'SSK', 'SSH']);

function keyPart(value: string | null | undefined): string {
  const normalized = value?.trim();
  return normalized && normalized.length > 0 ? normalized : '_';
}

function buildSapImportKey(params: {
  mode: 'STD' | 'STM';
  system: string;
  languageIn: string | null;
  languageOut: string | null;
  contentId?: string | null;
  translationArea?: string | null;
}): string {
  const base = [
    params.mode,
    keyPart(params.system),
    keyPart(params.languageIn),
    keyPart(params.languageOut),
  ];

  if (params.translationArea !== undefined) {
    return [...base, 'TA', keyPart(params.translationArea)].join('|');
  }

  if (params.contentId !== undefined) {
    return [...base, 'CID', keyPart(params.contentId)].join('|');
  }

  return [...base, 'LANGPAIR'].join('|');
}

/**
 * Map SAP subproject data to one or more import-ready projects.
 * Returns array because some systems generate multiple projects per subproject.
 */
export function mapSapSubProjectToProjects(
  subProject: SapSubProject,
  parent: SapProject,
  details: SapSubProjectInfo,
  instructions: SapInstruction[],
  exclusions: string[] = []
): SapProjectForImport[] {
  const system = extractSystem(details.subProjectSteps, details.environment);
  const terminologyKeys = extractTerminologyKeys(details);
  const allTranslationAreas = extractTranslationAreas(details.environment);
  const allLxeProjects = extractLxeProjects(details.environment, system);
  const allWorkLists = extractWorkLists(details.environment);
  const allGraphIds = extractGraphIds(details.environment);
  const url = extractUrl(details.subProjectSteps);
  const sapPm = extractSapPm(subProject);
  const projectType = extractProjectType(subProject);

  const sapInstructions = buildSapInstructions(instructions, exclusions);

  const now = new Date().toISOString();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const joinedGroups = joinSteps(details.subProjectSteps);

  // Name format: {subProjectId}: {projectName} | {subProjectName}
  const baseName = `${subProject.subProjectId}: ${parent.projectName} | ${subProject.subProjectName}`;

  const results: SapProjectForImport[] = [];

  if (MULTI_TA_SYSTEMS.has(system)) {
    // SSE/SSK/SSH: unique_language_pairs × translationAreas
    const uniqueLangPairs = new Map<string, JoinedStepGroup>();

    for (const group of joinedGroups) {
      const langKey = `${group.languageIn}|${group.languageOut}`;
      if (!uniqueLangPairs.has(langKey)) {
        uniqueLangPairs.set(langKey, group);
      } else {
        // Merge deadlines, volumes
        const existing = uniqueLangPairs.get(langKey)!;
        if (group.initialDeadline && (!existing.initialDeadline || group.initialDeadline < existing.initialDeadline)) {
          existing.initialDeadline = group.initialDeadline;
        }
        if (group.finalDeadline && (!existing.finalDeadline || group.finalDeadline > existing.finalDeadline)) {
          existing.finalDeadline = group.finalDeadline;
        }
        existing.words += group.words;
        existing.lines += group.lines;
        existing.hours += group.hours;
        existing.terms += group.terms;
        existing.hasTermsInFwl = existing.hasTermsInFwl || group.hasTermsInFwl;
        existing.allSteps.push(...group.allSteps);
      }
    }

    const tas = allTranslationAreas.length > 0 ? allTranslationAreas : [''];

    for (const [, langGroup] of uniqueLangPairs) {
      for (const ta of tas) {
        const taArr = ta ? [ta] : [];
        const composedInstructions = buildInstructions({
          translationAreas: taArr,
          lxeProjects: allLxeProjects,
          graphIds: allGraphIds,
          hours: langGroup.hours,
          terms: langGroup.terms,
          terminologyKeys,
          workLists: allWorkLists,
          system,
        });

        // Deadline filter — skip if all deadlines are in the past
        const deadlines = [langGroup.finalDeadline, langGroup.initialDeadline].filter(Boolean);
        const allInPast = deadlines.length > 0 && deadlines.every(d => new Date(d!) < today);

        if (allInPast) continue;

        results.push({
          sap_subproject_id: subProject.subProjectId,
          sap_import_key: buildSapImportKey({
            mode: 'STD',
            system,
            languageIn: langGroup.languageIn,
            languageOut: langGroup.languageOut,
            translationArea: ta,
          }),
          name: sanitizeString(baseName) || baseName,
          language_in: langGroup.languageIn,
          language_out: langGroup.languageOut,
          initial_deadline: langGroup.initialDeadline,
          final_deadline: langGroup.finalDeadline,
          instructions: composedInstructions,
          sap_instructions: sapInstructions,
          system,
          api_source: 'TPM_sap_api',
          last_synced_at: now,
          sap_pm: sapPm,
          project_type: projectType,
          terminology_key: terminologyKeys.length > 0 ? terminologyKeys : null,
          lxe_project: allLxeProjects.length > 0 ? allLxeProjects : null,
          translation_area: taArr.length > 0 ? taArr : null,
          work_list: allWorkLists.length > 0 ? allWorkLists : null,
          graph_id: allGraphIds.length > 0 ? allGraphIds : null,
          lxe_projects: allLxeProjects.length > 0 ? allLxeProjects : null,
          url,
          hours: langGroup.hours || null,
          words: langGroup.words || null,
          lines: langGroup.lines || null,
        });
      }

      if (langGroup.hasTermsInFwl) {
        // Deadline filter — skip STM if all deadlines are in the past
        const stmDeadlines = [langGroup.finalDeadline, langGroup.initialDeadline].filter(Boolean);
        const stmAllInPast = stmDeadlines.length > 0 && stmDeadlines.every(d => new Date(d!) < today);

        if (!stmAllInPast) {
          const stmInstructions = buildInstructions({
            translationAreas: allTranslationAreas,
            lxeProjects: allLxeProjects,
            graphIds: allGraphIds,
            hours: langGroup.hours,
            terms: langGroup.terms,
            terminologyKeys,
            workLists: allWorkLists,
            system: 'STM',
          });

          results.push({
            sap_subproject_id: subProject.subProjectId,
            sap_import_key: buildSapImportKey({
              mode: 'STM',
              system: 'STM',
              languageIn: langGroup.languageIn,
              languageOut: langGroup.languageOut,
            }),
            name: sanitizeString(baseName) || baseName,
            language_in: langGroup.languageIn,
            language_out: langGroup.languageOut,
            initial_deadline: langGroup.initialDeadline,
            final_deadline: langGroup.finalDeadline,
            instructions: stmInstructions,
            sap_instructions: sapInstructions,
            system: 'STM',
            api_source: 'TPM_sap_api',
            last_synced_at: now,
            sap_pm: sapPm,
            project_type: projectType,
            terminology_key: terminologyKeys.length > 0 ? terminologyKeys : null,
            lxe_project: allLxeProjects.length > 0 ? allLxeProjects : null,
            translation_area: allTranslationAreas.length > 0 ? allTranslationAreas : null,
            work_list: allWorkLists.length > 0 ? allWorkLists : null,
            graph_id: allGraphIds.length > 0 ? allGraphIds : null,
            lxe_projects: allLxeProjects.length > 0 ? allLxeProjects : null,
            url,
            hours: langGroup.hours || null,
            words: null,
            lines: null,
          });
        }
      }
    }
  } else {
    // All other systems: 1 project per contentId
    // Group by contentId across joined step groups
    const contentGroups = new Map<string, JoinedStepGroup[]>();

    for (const group of joinedGroups) {
      const cid = group.contentId || '_default';
      if (!contentGroups.has(cid)) {
        contentGroups.set(cid, []);
      }
      contentGroups.get(cid)!.push(group);
    }

    // If no content groups at all, create one project from environment data
    if (contentGroups.size === 0) {
      contentGroups.set('_default', []);
    }

    for (const [contentId, groups] of contentGroups) {
      // Find environment matching this contentId
      const matchingEnv = details.environment.find(e => e.contentId === contentId);

      // Merge all groups for this contentId
      let langIn: string | null = null;
      let langOut: string | null = null;
      let initialDeadline: string | null = null;
      let finalDeadline: string | null = null;
      let words = 0;
      let lines = 0;
      let hours = 0;
      let terms = 0;
      let hasTermsInFwl = false;

      for (const g of groups) {
        if (!langIn) langIn = g.languageIn;
        if (!langOut) langOut = g.languageOut;
        if (g.initialDeadline && (!initialDeadline || g.initialDeadline < initialDeadline)) {
          initialDeadline = g.initialDeadline;
        }
        if (g.finalDeadline && (!finalDeadline || g.finalDeadline > finalDeadline)) {
          finalDeadline = g.finalDeadline;
        }
        words += g.words;
        lines += g.lines;
        hours += g.hours;
        terms += g.terms;
        hasTermsInFwl = hasTermsInFwl || g.hasTermsInFwl;
      }

      // Extract TA from matching env or all envs
      const envTAs = matchingEnv ? extractTranslationAreas([matchingEnv]) : allTranslationAreas;
      const envLxeProjects = matchingEnv
        ? extractLxeProjects([matchingEnv], system)
        : allLxeProjects;
      const envGraphIds = matchingEnv ? extractGraphIds([matchingEnv]) : allGraphIds;
      const envWorkLists = matchingEnv ? extractWorkLists([matchingEnv]) : allWorkLists;

      const composedInstructions = buildInstructions({
        translationAreas: envTAs,
        lxeProjects: envLxeProjects,
        graphIds: envGraphIds,
        hours,
        terms,
        terminologyKeys,
        workLists: envWorkLists,
        system,
      });

      // XTM words normalization
      const finalWords = system === 'XTM' ? (words !== 0 ? 1 : 0) : words;

      // Deadline filter — skip if all deadlines are in the past
      const deadlines = [finalDeadline, initialDeadline].filter(Boolean);
      const allInPast = deadlines.length > 0 && deadlines.every(d => new Date(d!) < today);

      if (allInPast) continue;

      results.push({
        sap_subproject_id: subProject.subProjectId,
        sap_import_key: buildSapImportKey({
          mode: 'STD',
          system,
          languageIn: langIn,
          languageOut: langOut,
          contentId,
        }),
        name: sanitizeString(baseName) || baseName,
        language_in: langIn,
        language_out: langOut,
        initial_deadline: initialDeadline,
        final_deadline: finalDeadline,
        instructions: composedInstructions,
        sap_instructions: sapInstructions,
        system,
        api_source: 'TPM_sap_api',
        last_synced_at: now,
        sap_pm: sapPm,
        project_type: projectType,
        terminology_key: terminologyKeys.length > 0 ? terminologyKeys : null,
        lxe_project: envLxeProjects.length > 0 ? envLxeProjects : null,
        translation_area: envTAs.length > 0 ? envTAs : null,
        work_list: envWorkLists.length > 0 ? envWorkLists : null,
        graph_id: envGraphIds.length > 0 ? envGraphIds : null,
        lxe_projects: envLxeProjects.length > 0 ? envLxeProjects : null,
        url,
        hours: hours || null,
        words: finalWords || null,
        lines: lines || null,
      });

      if (hasTermsInFwl) {
        const stmInstructions = buildInstructions({
          translationAreas: envTAs,
          lxeProjects: envLxeProjects,
          graphIds: envGraphIds,
          hours,
          terms,
          terminologyKeys,
          workLists: envWorkLists,
          system: 'STM',
        });

        results.push({
          sap_subproject_id: subProject.subProjectId,
          sap_import_key: buildSapImportKey({
            mode: 'STM',
            system: 'STM',
            languageIn: langIn,
            languageOut: langOut,
            contentId,
          }),
          name: sanitizeString(baseName) || baseName,
          language_in: langIn,
          language_out: langOut,
          initial_deadline: initialDeadline,
          final_deadline: finalDeadline,
          instructions: stmInstructions,
          sap_instructions: sapInstructions,
          system: 'STM',
          api_source: 'TPM_sap_api',
          last_synced_at: now,
          sap_pm: sapPm,
          project_type: projectType,
          terminology_key: terminologyKeys.length > 0 ? terminologyKeys : null,
          lxe_project: envLxeProjects.length > 0 ? envLxeProjects : null,
          translation_area: envTAs.length > 0 ? envTAs : null,
          work_list: envWorkLists.length > 0 ? envWorkLists : null,
          graph_id: envGraphIds.length > 0 ? envGraphIds : null,
          lxe_projects: envLxeProjects.length > 0 ? envLxeProjects : null,
          url,
          hours: hours || null,
          words: null,
          lines: null,
        });
      }
    }
  }

  return results;
}

// ============================================================================
// Preview Mapping (for Import UI)
// ============================================================================

/**
 * Map SAP subproject to preview details (for import UI)
 */
export function mapSapToSubProjectDetails(
  subProject: SapSubProject,
  details: SapSubProjectInfo,
  instructions: SapInstruction[]
): SapSubProjectDetails {
  const system = extractSystem(details.subProjectSteps, details.environment);
  const terminologyKeys = extractTerminologyKeys(details);
  const translationAreas = extractTranslationAreas(details.environment);

  // Extract languages from first step group
  const joinedGroups = joinSteps(details.subProjectSteps);
  const firstGroup = joinedGroups[0];

  const words = sumVolumesByUnit(details.subProjectSteps, 'Words');
  const lines = sumVolumesByUnit(details.subProjectSteps, 'Lines');
  const hours = extractHours(details.subProjectSteps);

  const sapInstructions = buildSapInstructions(instructions);

  return {
    subProjectId: subProject.subProjectId,
    subProjectName: subProject.subProjectName,
    dmName: subProject.dmName,
    languages: {
      source: firstGroup?.languageIn || null,
      target: firstGroup?.languageOut || null,
    },
    deadlines: {
      start: firstGroup?.initialDeadline || null,
      end: firstGroup?.finalDeadline || null,
    },
    system,
    instructions: sapInstructions?.map(e => e.instructionLong || e.instructionShort || e.text || '').join('\n\n') || null,
    volumes: { words, lines },
    projectType: extractProjectType(subProject),
    terminologyKey: terminologyKeys,
    translationArea: translationAreas,
    hours,
  };
}

// ============================================================================
// Sanitization
// ============================================================================

/**
 * Sanitize string for database storage (XSS prevention)
 */
export function sanitizeString(input: string | null | undefined): string | null {
  if (!input) return null;

  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
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
    instructions: sanitizeString(data.instructions),
    sap_pm: sanitizeString(data.sap_pm),
    url: sanitizeString(data.url),
  };
}
