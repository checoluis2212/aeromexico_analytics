import { NextRequest, NextResponse } from 'next/server';
import { requireSergioApi } from '@/lib/auth/require-sergio-api';
import { createAdminClient } from '@/lib/supabase/admin';

/** Admin-ready: list access requests (approve/reject via PATCH on [id]) */
export async function GET(request: NextRequest) {
  const session = await requireSergioApi();
  if (session instanceof NextResponse) return session;

  const status = request.nextUrl.searchParams.get('status');
  const supabase = createAdminClient();

  let query = supabase
    .from('platform_access_requests')
    .select(
      'id, full_name, email, company, department, job_title, reason, status, admin_notes, reviewer_notes, proposed_role, proposed_acc_role, created_at, reviewed_at, reviewed_by'
    )
    .order('created_at', { ascending: false })
    .limit(100);

  if (status === 'pending' || status === 'approved' || status === 'rejected') {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    console.error('admin access-requests list:', error.message);
    return NextResponse.json({ error: 'Unable to load requests.' }, { status: 500 });
  }

  return NextResponse.json({ requests: data ?? [] });
}
