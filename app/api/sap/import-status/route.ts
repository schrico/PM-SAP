import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createErrorResponse } from '@/lib/sap/errors';

const SAP_IMPORT_STATUS_ROW_ID = 1;

export async function GET() {
  try {
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

    const { data: statusRow, error } = await supabase
      .from('sap_import_status')
      .select('status, started_at, finished_at, started_by')
      .eq('id', SAP_IMPORT_STATUS_ROW_ID)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch SAP import status' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: statusRow?.status ?? 'idle',
      startedAt: statusRow?.started_at ?? null,
      finishedAt: statusRow?.finished_at ?? null,
      startedBy: statusRow?.started_by ?? null,
    });
  } catch (error) {
    return createErrorResponse(error, 'Failed to fetch SAP import status');
  }
}
