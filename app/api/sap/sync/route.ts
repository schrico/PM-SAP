// /app/api/sap/sync/route.ts
// POST: Import SAP subprojects to local database

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSapClient } from '@/lib/sap/client';
import { createErrorResponse } from '@/lib/sap/errors';
import { mapSapToProjectImport, sanitizeImportData } from '@/lib/sap/mappers';
import type { SapSyncRequest, SapSyncResponse, SapProjectForImport } from '@/types/sap';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: SapSyncRequest = await request.json();

    if (!body.projects || !Array.isArray(body.projects) || body.projects.length === 0) {
      return NextResponse.json(
        { error: 'Request must include projects array' },
        { status: 400 }
      );
    }

    // Get Supabase client and verify auth
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

    const supabase = createRouteHandlerClient(
      { cookies },
      { supabaseUrl, supabaseKey }
    );

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const sapClient = getSapClient();

    // Fetch all SAP projects to get parent info
    const sapProjectsData = await sapClient.getProjects();
    const sapProjectsMap = new Map(
      sapProjectsData.projects.map(p => [p.projectId, p])
    );

    // Process each subproject
    const results: SapSyncResponse = {
      imported: 0,
      updated: 0,
      failed: 0,
      errors: [],
    };

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

        // Fetch subproject details and instructions
        const [details, instructionsData] = await Promise.all([
          sapClient.getSubProjectDetails(projectId, subProjectId),
          sapClient.getInstructions(projectId, subProjectId).catch(() => ({ instructions: [] })),
        ]);

        // Map to import format
        const importData = mapSapToProjectImport(
          subProject,
          parent,
          details,
          instructionsData.instructions
        );

        // Sanitize data
        const sanitizedData = sanitizeImportData(importData);

        // Check if project exists
        const { data: existing } = await supabase
          .from('projects')
          .select('id')
          .eq('sap_subproject_id', subProjectId)
          .single();

        if (existing) {
          // Update existing project (SAP-owned fields only)
          const { error: updateError } = await supabase
            .from('projects')
            .update({
              name: sanitizedData.name,
              language_in: sanitizedData.language_in,
              language_out: sanitizedData.language_out,
              initial_deadline: sanitizedData.initial_deadline,
              final_deadline: sanitizedData.final_deadline,
              system: sanitizedData.system,
              sap_instructions: sanitizedData.sap_instructions,
              sap_parent_name: sanitizedData.sap_parent_name,
              sap_account: sanitizedData.sap_account,
              last_synced_at: sanitizedData.last_synced_at,
            })
            .eq('sap_subproject_id', subProjectId);

          if (updateError) {
            results.failed++;
            results.errors?.push(`Failed to update ${subProjectId}: ${updateError.message}`);
          } else {
            results.updated++;
          }
        } else {
          // Insert new project
          const { error: insertError } = await supabase
            .from('projects')
            .insert({
              ...sanitizedData,
              status: 'active', // Default status for new projects
            });

          if (insertError) {
            results.failed++;
            results.errors?.push(`Failed to import ${subProjectId}: ${insertError.message}`);
          } else {
            results.imported++;
          }
        }
      } catch (error) {
        results.failed++;
        results.errors?.push(
          `Error processing ${subProjectId}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }

    // Clean up empty errors array
    if (results.errors?.length === 0) {
      delete results.errors;
    }

    return NextResponse.json(results);
  } catch (error) {
    return createErrorResponse(error, 'Failed to sync SAP projects');
  }
}
