import { NextResponse } from 'next/server';
import { isSergioAdmin } from '@/lib/auth/access';
import { requireApiSession } from '@/lib/auth/require-api-session';

export async function requireSergioApi() {
  const session = await requireApiSession();
  if (session instanceof NextResponse) return session;
  if (!isSergioAdmin(session.profile)) {
    return NextResponse.json({ error: 'Solo operación Sergio' }, { status: 403 });
  }
  return session;
}
