// /app/api/sap/sync/route.ts
// POST: Import SAP subprojects to local database

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSapClient } from '@/lib/sap/client';
import { createErrorResponse } from '@/lib/sap/errors';
import { mapSapSubProjectToProjects, sanitizeImportData } from '@/lib/sap/mappers';
import type { SapSyncRequest, SapSyncResponse } from '@/types/sap';

const RATE_LIMIT_MINUTES = 3;

/**
 * Build a composite match key for finding existing projects.
 * SSE/SSK/SSH use sap_subproject_id + language_in + language_out + translation_area[0].
 * Others use sap_subproject_id + language_in + language_out.
 */
function buildMatchQuery(
  supabase: ReturnType<typeof createServerClient>,
  data: ReturnType<typeof sanitizeImportData>
) {
  let query = supabase
    .from('projects')
    .select('id')
    .eq('sap_subproject_id', data.sap_subproject_id);

  if (data.language_in) {
    query = query.eq('language_in', data.language_in);
  } else {
    query = query.is('language_in', null);
  }

  if (data.language_out) {
    query = query.eq('language_out', data.language_out);
  } else {
    query = query.is('language_out', null);
  }

  // For SSE/SSK/SSH, also match on translation_area
  const multiTaSystems = ['SSE', 'SSK', 'SSH'];
  if (multiTaSystems.includes(data.system) && data.translation_area?.length) {
    query = query.contains('translation_area', [data.translation_area[0]]);
  }

  return query.single();
}

export async function POST(request: NextRequest) {
  try {
    const body: SapSyncRequest = await request.json();

    if (!body.projects || !Array.isArray(body.projects) || body.projects.length === 0) {
      return NextResponse.json(
        { error: 'Request must include projects array' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey =
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check rate limit
    const { data: rateLimit } = await supabase
      .from('sap_api_rate_limits')
      .select('last_fetch_at')
      .eq('user_id', user.id)
      .single();

    if (rateLimit?.last_fetch_at) {
      const lastImport = new Date(rateLimit.last_fetch_at);
      const cooldownMs = RATE_LIMIT_MINUTES * 60 * 1000;
      const elapsed = Date.now() - lastImport.getTime();

      if (elapsed < cooldownMs) {
        const waitMinutes = Math.ceil((cooldownMs - elapsed) / 60000);
        const retryAt = new Date(lastImport.getTime() + cooldownMs).toISOString();
        return NextResponse.json(
          { error: 'rate_limited', waitMinutes, retryAt },
          { status: 429 }
        );
      }
    }

    const sapClient = getSapClient();

    // Fetch all SAP projects to get parent info
    const sapProjectsData = await sapClient.getProjects();
    const sapProjectsMap = new Map(
      sapProjectsData.projects.map(p => [p.projectId, p])
    );

    // Fetch user's instruction exclusions
    const { data: exclusionRows } = await supabase
      .from('instruction_exclusions')
      .select('instruction_text')
      .eq('user_id', user.id);

    const exclusions = exclusionRows?.map(r => r.instruction_text) || [];

    const results: SapSyncResponse = {
      imported: 0,
      updated: 0,
      failed: 0,
      errors: [],
    };

    // Track changes for import report
    const reportNewProjects: Array<{ id: number; name: string; system: string; language_in: string | null; language_out: string | null }> = [];
    const reportModifiedProjects: Array<{ id: number; name: string; changes: Record<string, { old: unknown; new: unknown }> }> = [];

    for (const { projectId, subProjectId } of body.projects) {
      try {
        const parent = sapProjectsMap.get(projectId);
        if (!parent) {
          results.failed++;
          results.errors?.push(`Parent project ${projectId} not found`);
          continue;
        }

        const subProject = parent.subProjects.find(s => s.subProjectId === subProjectId);
        if (!subProject) {
          results.failed++;
          results.errors?.push(`Subproject ${subProjectId} not found in project ${projectId}`);
          continue;
        }

        const details = await sapClient.getSubProjectDetails(projectId, subProjectId);

        // Only call instructions API when at least one step has hasInstructions: true
        const needsInstructions = details.subProjectSteps.some(s => s.hasInstructions);
        const instructionsData = needsInstructions
          ? await sapClient.getInstructions(projectId, subProjectId).catch(() => ({ instructions: [] }))
          : { instructions: [] };

        // Map to potentially multiple import-ready projects
        const importProjects = mapSapSubProjectToProjects(
          subProject,
          parent,
          details,
          instructionsData.instructions,
          exclusions
        );

        // Process each generated project
        for (const importData of importProjects) {
          const sanitizedData = sanitizeImportData(importData);

          // Composite match to find existing project
          const { data: existing } = await buildMatchQuery(supabase, sanitizedData);

          if (existing) {
            // Fetch current values for change tracking
            const { data: currentProject } = await supabase
              .from('projects')
              .select('name, language_in, language_out, initial_deadline, final_deadline, system, instructions, words, lines, hours, sap_pm, project_type')
              .eq('id', existing.id)
              .single();

            // Update existing project (SAP-owned fields only, preserve local fields)
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
              .eq('id', existing.id);

            if (updateError) {
              results.failed++;
              results.errors?.push(`Failed to update ${subProjectId}: ${updateError.message}`);
            } else {
              results.updated++;

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
                    id: existing.id,
                    name: sanitizedData.name,
                    changes,
                  });
                }
              }
            }
          } else {
            // Insert new project
            const { data: inserted, error: insertError } = await supabase
              .from('projects')
              .insert({
                ...sanitizedData,
                status: 'active',
              })
              .select('id')
              .single();

            if (insertError) {
              results.failed++;
              results.errors?.push(`Failed to import ${subProjectId}: ${insertError.message}`);
            } else {
              results.imported++;
              reportNewProjects.push({
                id: inserted.id,
                name: sanitizedData.name,
                system: sanitizedData.system,
                language_in: sanitizedData.language_in,
                language_out: sanitizedData.language_out,
              });
            }
          }
        }
      } catch (error) {
        results.failed++;
        results.errors?.push(
          `Error processing ${subProjectId}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }

    if (results.errors?.length === 0) {
      delete results.errors;
    }

    // Generate import report if there were changes
    if (reportNewProjects.length > 0 || reportModifiedProjects.length > 0) {
      const { error: reportError } = await supabase.from('import_reports').insert({
        triggered_by: user.id,
        report_type: 'manual',
        new_projects: reportNewProjects,
        modified_projects: reportModifiedProjects,
        summary: `Manual import: ${reportNewProjects.length} new, ${reportModifiedProjects.length} modified`,
        acknowledged_by: [],
      });

      if (reportError) {
        console.error('Failed to create import report:', reportError.message);
      }
    }

    // Update rate limit
    if (results.imported > 0 || results.updated > 0) {
      await supabase
        .from('sap_api_rate_limits')
        .upsert({
          user_id: user.id,
          last_fetch_at: new Date().toISOString(),
        });
    }

    return NextResponse.json(results);
  } catch (error) {
    return createErrorResponse(error, 'Failed to sync SAP projects');
  }
}
