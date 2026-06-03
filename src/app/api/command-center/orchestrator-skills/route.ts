import { NextRequest, NextResponse } from 'next/server';
import { requireSergioApi } from '@/lib/auth/require-sergio-api';
import { createClient } from '@/lib/supabase/server';
import {
  inferConnectionStatus,
  listOrchestratorSkills,
} from '@/lib/ai/orchestrator-skills-server';

export async function GET() {
  const session = await requireSergioApi();
  if (session instanceof NextResponse) return session;

  const skills = await listOrchestratorSkills();
  return NextResponse.json({ skills });
}

export async function PATCH(request: NextRequest) {
  const session = await requireSergioApi();
  if (session instanceof NextResponse) return session;

  const body = await request.json();
  const slug = typeof body.slug === 'string' ? body.slug : '';
  if (!slug) {
    return NextResponse.json({ error: 'slug requerido' }, { status: 400 });
  }

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (typeof body.enabled === 'boolean') updates.enabled = body.enabled;
  if (body.connection_status === 'connected' || body.connection_status === 'not_configured' || body.connection_status === 'error') {
    updates.connection_status = body.connection_status;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('orchestrator_skills')
    .update(updates)
    .eq('slug', slug)
    .select('*')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const row = {
    ...data,
    connection_status: inferConnectionStatus(
      data.slug,
      data.connection_status as 'not_configured' | 'connected' | 'error'
    ),
  };

  return NextResponse.json({ skill: row });
}
