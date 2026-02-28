// /app/api/cron/sap-sync/route.ts
// GET: Scheduled sync of all SAP-sourced projects (Vercel cron)

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSapClient } from '@/lib/sap/client';
import { mapSapSubProjectToProjects, sanitizeImportData } from '@/lib/sap/mappers';

const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all projects that came from SAP
    const { data: sapProjects, error: fetchError } = await supabase
      .from('projects')
      .select('id, sap_subproject_id, language_in, language_out, translation_area, system')
      .eq('api_source', 'TPM_sap_api')
      .not('sap_subproject_id', 'is', null);

    if (fetchError) {
      return NextResponse.json(
        { error: 'Failed to fetch projects' },
        { status: 500 }
      );
    }

    if (!sapProjects || sapProjects.length === 0) {
      return NextResponse.json({
        message: 'No SAP projects to sync',
        synced: 0,
        failed: 0,
      });
    }

    const sapClient = getSapClient();

    // Fetch all SAP projects once
    const sapProjectsData = await sapClient.getProjects();

    // Build a map from subProjectId to parent project
    const subProjectToParent = new Map<string, { parent: typeof sapProjectsData.projects[0]; subProject: typeof sapProjectsData.projects[0]['subProjects'][0] }>();
    for (const parent of sapProjectsData.projects) {
      for (const sub of parent.subProjects) {
        subProjectToParent.set(sub.subProjectId, { parent, subProject: sub });
      }
    }

    let synced = 0;
    let failed = 0;
    const errors: string[] = [];

    // Track changes for import report
    const reportModifiedProjects: Array<{ id: number; name: string; changes: Record<string, { old: unknown; new: unknown }> }> = [];

    // Track which subprojects we've already fetched details for
    const detailsCache = new Map<string, Awaited<ReturnType<typeof sapClient.getSubProjectDetails>>>();
    const instructionsCache = new Map<string, { instructions: Awaited<ReturnType<typeof sapClient.getInstructions>>['instructions'] }>();

    for (const localProject of sapProjects) {
      try {
        const sapData = subProjectToParent.get(localProject.sap_subproject_id);
        if (!sapData) {
          continue;
        }

        const { parent, subProject } = sapData;
        const cacheKey = `${parent.projectId}|${subProject.subProjectId}`;

        // Cache API calls to avoid duplicate requests for same subproject
        if (!detailsCache.has(cacheKey)) {
          const details = await sapClient.getSubProjectDetails(parent.projectId, subProject.subProjectId);
          detailsCache.set(cacheKey, details);

          // Only call instructions API when at least one step has hasInstructions: true
          const needsInstructions = details.subProjectSteps.some(s => s.hasInstructions);
          const instructionsData = needsInstructions
            ? await sapClient.getInstructions(parent.projectId, subProject.subProjectId)
                .catch(() => ({ instructions: [] as any[] }))
            : { instructions: [] as any[] };
          instructionsCache.set(cacheKey, instructionsData);
        }

        const details = detailsCache.get(cacheKey)!;
        const instructionsData = instructionsCache.get(cacheKey)!;

        // Map and generate projects
        const importProjects = mapSapSubProjectToProjects(
          subProject,
          parent,
          details,
          instructionsData.instructions
        );

        // Find the matching import project for this local project
        const matchingImport = importProjects.find(ip => {
          if (ip.language_in !== localProject.language_in) return false;
          if (ip.language_out !== localProject.language_out) return false;

          // For multi-TA systems, also match on translation_area
          const multiTa = ['SSE', 'SSK', 'SSH'];
          if (multiTa.includes(ip.system) && ip.translation_area?.length && localProject.translation_area?.length) {
            return ip.translation_area[0] === localProject.translation_area[0];
          }

          return true;
        });

        if (!matchingImport) {
          continue;
        }

        const sanitizedData = sanitizeImportData(matchingImport);

        // Fetch current values for change tracking
        const { data: currentProject } = await supabase
          .from('projects')
          .select('name, language_in, language_out, initial_deadline, final_deadline, system, instructions, words, lines, hours, sap_pm, project_type')
          .eq('id', localProject.id)
          .single();

        // Update SAP-owned fields only
        const { error: updateError } = await supabase
          .from('projects')
          .update({
            name: sanitizedData.name,
            language_in: sanitizedData.language_in,
            language_out: sanitizedData.language_out,
            initial_deadline: sanitizedData.initial_deadline,
            final_deadline: sanitizedData.final_deadline,
            system: sanitizedData.system,
            instructions: sanitizedData.instructions,
            sap_instructions: sanitizedData.sap_instructions,
            sap_pm: sanitizedData.sap_pm,
            project_type: sanitizedData.project_type,
            terminology_key: sanitizedData.terminology_key,
            lxe_project: sanitizedData.lxe_project,
            translation_area: sanitizedData.translation_area,
            work_list: sanitizedData.work_list,
            graph_id: sanitizedData.graph_id,
            lxe_projects: sanitizedData.lxe_projects,
            url: sanitizedData.url,
            hours: sanitizedData.hours,
            words: sanitizedData.words,
            lines: sanitizedData.lines,
            last_synced_at: sanitizedData.last_synced_at,
          })
          .eq('id', localProject.id);

        if (updateError) {
          failed++;
          errors.push(`Project ${localProject.id}: ${updateError.message}`);
        } else {
          synced++;

          // Track field-level changes
          if (currentProject) {
            const changes: Record<string, { old: unknown; new: unknown }> = {};
            const trackFields = ['name', 'language_in', 'language_out', 'initial_deadline', 'final_deadline', 'system', 'instructions', 'words', 'lines', 'hours', 'sap_pm', 'project_type'] as const;

            for (const field of trackFields) {
              const oldVal = currentProject[field];
              const newVal = sanitizedData[field];
              if (String(oldVal ?? '') !== String(newVal ?? '')) {
                changes[field] = { old: oldVal, new: newVal };
              }
            }

            if (Object.keys(changes).length > 0) {
              reportModifiedProjects.push({
                id: localProject.id,
                name: sanitizedData.name,
                changes,
              });
            }
          }
        }
      } catch (error) {
        failed++;
        errors.push(
          `Project ${localProject.id}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }

    // Generate import report if there were changes
    if (reportModifiedProjects.length > 0) {
      const { error: reportError } = await supabase.from('import_reports').insert({
        triggered_by: null,
        report_type: 'cron',
        new_projects: [],
        modified_projects: reportModifiedProjects,
        summary: `Scheduled sync: ${reportModifiedProjects.length} modified`,
        acknowledged_by: [],
      });

      if (reportError) {
        console.error('Failed to create cron import report:', reportError.message);
      }
    }

    return NextResponse.json({
      message: 'SAP sync complete',
      synced,
      failed,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Sync failed', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
