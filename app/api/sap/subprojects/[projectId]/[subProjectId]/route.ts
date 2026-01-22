// /app/api/sap/subprojects/[projectId]/[subProjectId]/route.ts
// GET: Get SAP subproject details with instructions

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSapClient } from '@/lib/sap/client';
import { createErrorResponse } from '@/lib/sap/errors';
import { mapSapToSubProjectDetails } from '@/lib/sap/mappers';

interface RouteParams {
  params: Promise<{ projectId: string; subProjectId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { projectId, subProjectId } = await params;
    const projectIdNum = parseInt(projectId, 10);

    if (isNaN(projectIdNum)) {
      return NextResponse.json(
        { error: 'Invalid project ID' },
        { status: 400 }
      );
    }

    if (!subProjectId) {
      return NextResponse.json(
        { error: 'Invalid subproject ID' },
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

    const sapClient = getSapClient();

    // Fetch subproject details and instructions in parallel
    const [detailsResponse, instructionsResponse, projectsResponse] = await Promise.all([
      sapClient.getSubProjectDetails(projectIdNum, subProjectId),
      sapClient.getInstructions(projectIdNum, subProjectId).catch(() => ({ instructions: [] })),
      sapClient.getProjects(), // Need this to get dmName from subproject list
    ]);

    // Find the subproject in the project list to get dmName
    const project = projectsResponse.projects.find(p => p.projectId === projectIdNum);
    const subProjectSummary = project?.subProjects.find(s => s.subProjectId === subProjectId);

    if (!subProjectSummary) {
      return NextResponse.json(
        { error: 'Subproject not found' },
        { status: 404 }
      );
    }

    // Map to frontend details format
    const details = mapSapToSubProjectDetails(
      subProjectSummary,
      detailsResponse,
      instructionsResponse.instructions
    );

    return NextResponse.json({ details });
  } catch (error) {
    return createErrorResponse(error, 'Failed to fetch SAP subproject details');
  }
}
