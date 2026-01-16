// /app/api/cron/sap-sync/route.ts
// GET: Scheduled sync of all SAP-sourced projects (Vercel cron)

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSapClient } from '@/lib/sap/client';
import { mapSapToProjectImport, sanitizeImportData } from '@/lib/sap/mappers';

// Vercel cron secret for authentication
const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret (Vercel sends this header for cron jobs)
    const authHeader = request.headers.get('authorization');
    if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Use service role key for cron (bypasses RLS)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Cron: Missing Supabase configuration');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all projects that came from SAP
    const { data: sapProjects, error: fetchError } = await supabase
      .from('projects')
      .select('id, sap_subproject_id, sap_parent_id')
      .eq('api_source', 'TPM_sap_api')
      .not('sap_subproject_id', 'is', null);

    if (fetchError) {
      console.error('Cron: Failed to fetch SAP projects:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch projects' },
        { status: 500 }
      );
    }

    if (!sapProjects || sapProjects.length === 0) {
      console.log('Cron: No SAP projects to sync');
      return NextResponse.json({
        message: 'No SAP projects to sync',
        synced: 0,
        failed: 0,
      });
    }

    console.log(`Cron: Starting sync for ${sapProjects.length} SAP projects`);

    const sapClient = getSapClient();

    // Fetch all SAP projects once
    const sapProjectsData = await sapClient.getProjects();
    const sapProjectsMap = new Map(
      sapProjectsData.projects.map(p => [String(p.projectId), p])
    );

    let synced = 0;
    let failed = 0;
    const errors: string[] = [];

    // Process each local SAP project
    for (const localProject of sapProjects) {
      try {
        const parent = sapProjectsMap.get(localProject.sap_parent_id);
        if (!parent) {
          // Project may have been removed from SAP - skip but don't error
          console.log(`Cron: Parent project ${localProject.sap_parent_id} not found in SAP`);
          continue;
        }

        const subProject = parent.subProjects.find(
          s => s.subProjectId === localProject.sap_subproject_id
        );
        if (!subProject) {
          console.log(`Cron: Subproject ${localProject.sap_subproject_id} not found in SAP`);
          continue;
        }

        // Fetch fresh details and instructions
        const [details, instructionsData] = await Promise.all([
          sapClient.getSubProjectDetails(parent.projectId, subProject.subProjectId),
          sapClient.getInstructions(parent.projectId, subProject.subProjectId)
            .catch(() => ({ instructions: [] })),
        ]);

        // Map and sanitize
        const importData = mapSapToProjectImport(
          subProject,
          parent,
          details,
          instructionsData.instructions
        );
        const sanitizedData = sanitizeImportData(importData);

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
            sap_instructions: sanitizedData.sap_instructions,
            sap_parent_name: sanitizedData.sap_parent_name,
            sap_account: sanitizedData.sap_account,
            last_synced_at: sanitizedData.last_synced_at,
          })
          .eq('id', localProject.id);

        if (updateError) {
          failed++;
          errors.push(`Project ${localProject.id}: ${updateError.message}`);
        } else {
          synced++;
        }
      } catch (error) {
        failed++;
        errors.push(
          `Project ${localProject.id}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
      }
    }

    console.log(`Cron: Sync complete. Synced: ${synced}, Failed: ${failed}`);

    if (errors.length > 0) {
      console.error('Cron: Sync errors:', errors);
    }

    return NextResponse.json({
      message: 'SAP sync complete',
      synced,
      failed,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Cron: Fatal error:', error);
    return NextResponse.json(
      { error: 'Sync failed', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
