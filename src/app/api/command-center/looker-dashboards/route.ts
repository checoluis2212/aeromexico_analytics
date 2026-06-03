import { NextRequest, NextResponse } from 'next/server';
import { requireSergioApi } from '@/lib/auth/require-sergio-api';

export async function GET() {
  const session = await requireSergioApi();
  if (session instanceof NextResponse) return session;

  const { data, error } = await session.supabase
    .from('looker_dashboard_library')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(request: NextRequest) {
  const session = await requireSergioApi();
  if (session instanceof NextResponse) return session;

  const body = await request.json();
  const title = String(body.title ?? '').trim();
  const dashboard_url = String(body.dashboard_url ?? '').trim();
  if (!title || !dashboard_url) {
    return NextResponse.json({ error: 'Título y URL requeridos' }, { status: 400 });
  }

  const { data, error } = await session.supabase
    .from('looker_dashboard_library')
    .insert({
      title,
      dashboard_url,
      description: body.description?.trim() || null,
      tags: Array.isArray(body.tags) ? body.tags : [],
      sort_order: Number(body.sort_order) || 0,
      is_active: body.is_active !== false,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
