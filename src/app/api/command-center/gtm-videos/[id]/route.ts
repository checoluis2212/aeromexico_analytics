import { NextRequest, NextResponse } from 'next/server';
import { requireSergioApi } from '@/lib/auth/require-sergio-api';

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  const session = await requireSergioApi();
  if (session instanceof NextResponse) return session;
  const { id } = await params;
  const body = await request.json();

  const updates: Record<string, unknown> = {};
  if (body.title !== undefined) updates.title = String(body.title).trim();
  if (body.video_url !== undefined) updates.video_url = String(body.video_url).trim();
  if (body.description !== undefined) updates.description = body.description?.trim() || null;
  if (body.event_name !== undefined) updates.event_name = body.event_name?.trim() || null;
  if (body.recorded_at !== undefined) updates.recorded_at = body.recorded_at || null;
  if (body.tags !== undefined) updates.tags = body.tags;
  if (body.sort_order !== undefined) updates.sort_order = Number(body.sort_order);
  if (body.is_active !== undefined) updates.is_active = Boolean(body.is_active);

  const { data, error } = await session.supabase
    .from('gtm_debug_video_library')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const session = await requireSergioApi();
  if (session instanceof NextResponse) return session;
  const { id } = await params;

  const { error } = await session.supabase
    .from('gtm_debug_video_library')
    .delete()
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
