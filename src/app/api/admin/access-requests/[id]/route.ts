import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireSergioApi } from '@/lib/auth/require-sergio-api';
import { createAdminClient } from '@/lib/supabase/admin';
import { accessRequestReviewSchema } from '@/lib/access-requests/schema';

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  const session = await requireSergioApi();
  if (session instanceof NextResponse) return session;

  const { id } = await context.params;
  const body = accessRequestReviewSchema.parse(await request.json());
  const supabase = createAdminClient();

  const { data: existing, error: fetchError } = await supabase
    .from('platform_access_requests')
    .select('id, email, status')
    .eq('id', id)
    .maybeSingle();

  if (fetchError || !existing) {
    return NextResponse.json({ error: 'Request not found.' }, { status: 404 });
  }

  if (existing.status !== 'pending') {
    return NextResponse.json({ error: 'Request has already been reviewed.' }, { status: 409 });
  }

  const { data, error } = await supabase
    .from('platform_access_requests')
    .update({
      status: body.status,
      admin_notes: body.admin_notes ?? null,
      reviewer_notes: body.reviewer_notes ?? null,
      proposed_role: body.proposed_role ?? 'client',
      proposed_acc_role: body.proposed_acc_role ?? null,
      reviewed_at: new Date().toISOString(),
      reviewed_by: session.user.id,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('admin access-requests review:', error.message);
    return NextResponse.json({ error: 'Unable to update request.' }, { status: 500 });
  }

  if (body.status === 'approved') {
    await supabase
      .from('profiles')
      .update({
        platform_access_approved: true,
        platform_access_request_id: id,
      })
      .eq('email', existing.email);

    // Profile may not exist until user is invited — approval stored on request row
  }

  return NextResponse.json({ success: true, request: data });
}
