// /app/api/sap/projects/route.ts
// GET: List all SAP projects and subprojects

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getSapClient } from '@/lib/sap/client';
import { createErrorResponse } from '@/lib/sap/errors';
import type { SapProjectListItem, SapSubProjectListItem } from '@/types/sap';

const RATE_LIMIT_MINUTES = 5;

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

    // Check rate limit
    const { data: rateLimit } = await supabase
      .from('sap_api_rate_limits')
      .select('last_fetch_at')
      .eq('user_id', user.id)
      .single();

    if (rateLimit?.last_fetch_at) {
      const lastFetch = new Date(rateLimit.last_fetch_at);
      const cooldownMs = RATE_LIMIT_MINUTES * 60 * 1000;
      const elapsed = Date.now() - lastFetch.getTime();

      if (elapsed < cooldownMs) {
        const waitMinutes = Math.ceil((cooldownMs - elapsed) / 60000);
        return NextResponse.json(
          { error: 'rate_limited', waitMinutes },
          { status: 429 }
        );
      }
    }

    // Fetch SAP projects
    const sapClient = getSapClient();
    const sapData = await sapClient.getProjects();

    // Get existing SAP projects from database for comparison
    const { data: existingProjects } = await supabase
      .from('projects')
      .select('id, sap_subproject_id, last_synced_at')
      .not('sap_subproject_id', 'is', null);

    const existingMap = new Map(
      (existingProjects || []).map(p => [p.sap_subproject_id, p])
    );

    // Transform to frontend format with local status
    const projects: SapProjectListItem[] = sapData.projects.map(project => ({
      projectId: project.projectId,
      projectName: project.projectName,
      account: project.account,
      subProjects: project.subProjects.map(sub => {
        const existing = existingMap.get(sub.subProjectId);
        return {
          subProjectId: sub.subProjectId,
          subProjectName: sub.subProjectName,
          dmName: sub.dmName,
          pmName: sub.pmName,
          projectType: sub.projectType,
          existsLocally: !!existing,
          localProjectId: existing?.id,
          needsUpdate: existing ? true : false, // TODO: Compare dates for actual update detection
        } satisfies SapSubProjectListItem;
      }),
    }));

    // Update rate limit (upsert)
    await supabase
      .from('sap_api_rate_limits')
      .upsert({
        user_id: user.id,
        last_fetch_at: new Date().toISOString(),
      });

    return NextResponse.json({ projects });
  } catch (error) {
    return createErrorResponse(error, 'Failed to fetch SAP projects');
  }
}
