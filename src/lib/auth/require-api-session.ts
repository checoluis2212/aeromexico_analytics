import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { ProfileAccess } from '@/lib/auth/access';
import { canAccessCommandCenter, hasInternalAccess } from '@/lib/auth/access';

type SessionOk = {
  supabase: Awaited<ReturnType<typeof createClient>>;
  user: { id: string; email?: string | null };
  profile: ProfileAccess | null;
};

export async function requireApiSession(): Promise<SessionOk | NextResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, acc_role, email, full_name')
    .eq('id', user.id)
    .single();

  return { supabase, user, profile };
}

export async function requireCommandCenterAccess(): Promise<SessionOk | NextResponse> {
  const session = await requireApiSession();
  if (session instanceof NextResponse) return session;
  if (!canAccessCommandCenter(session.profile)) {
    return NextResponse.json({ error: 'Sin acceso' }, { status: 403 });
  }
  return session;
}

export async function requireInternalAccess(): Promise<SessionOk | NextResponse> {
  const session = await requireApiSession();
  if (session instanceof NextResponse) return session;
  if (!hasInternalAccess(session.profile)) {
    return NextResponse.json({ error: 'Sin acceso' }, { status: 403 });
  }
  return session;
}
