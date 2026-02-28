// /app/api/sap/projects/route.ts
// GET: List all SAP projects and subprojects

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getSapClient } from '@/lib/sap/client';
import { createErrorResponse } from '@/lib/sap/errors';
import type { SapProjectListItem, SapSubProjectListItem } from '@/types/sap';

export async function GET() {
  try {
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

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch SAP projects
    const sapClient = getSapClient();
    const sapData = await sapClient.getProjects();

    // Get existing SAP projects from database for comparison
    // Fetch all SAP-sourced projects with composite matching fields
    const { data: existingProjects } = await supabase
      .from('projects')
      .select('id, sap_subproject_id, language_in, language_out, translation_area, system, last_synced_at')
      .not('sap_subproject_id', 'is', null);

    // Group existing projects by sap_subproject_id (one subproject can map to multiple local projects)
    const existingBySubId = new Map<string, typeof existingProjects>();
    for (const p of existingProjects || []) {
      const key = p.sap_subproject_id;
      if (!existingBySubId.has(key)) {
        existingBySubId.set(key, []);
      }
      existingBySubId.get(key)!.push(p);
    }

    // Transform to frontend format with local status
    const projects: SapProjectListItem[] = sapData.projects.map(project => ({
      projectId: project.projectId,
      projectName: project.projectName,
      account: project.account,
      subProjects: project.subProjects.map(sub => {
        const existingList = existingBySubId.get(sub.subProjectId) || [];
        const hasLocal = existingList.length > 0;
        return {
          subProjectId: sub.subProjectId,
          subProjectName: sub.subProjectName,
          dmName: sub.dmName,
          pmName: sub.pmName,
          projectType: sub.projectType,
          existsLocally: hasLocal,
          localProjectId: hasLocal ? existingList[0].id : undefined,
          needsUpdate: hasLocal,
        } satisfies SapSubProjectListItem;
      }),
    }));

    return NextResponse.json({ projects });
  } catch (error) {
    return createErrorResponse(error, 'Failed to fetch SAP projects');
  }
}
