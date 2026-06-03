import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireInternalAccess } from '@/lib/auth/require-api-session';
import { getAppRole } from '@/lib/auth/access';

export async function GET() {
  const session = await requireInternalAccess();
  if (session instanceof NextResponse) return session;

  const admin = createAdminClient();
  const { data, error } = await admin
    .from('profiles')
    .select('id, email, full_name, company, role, acc_role, department, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('admin profiles list:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const profiles = (data ?? []).map((p) => ({
    ...p,
    app_role: getAppRole({ role: p.role, acc_role: p.acc_role, email: p.email }),
  }));

  return NextResponse.json({ profiles });
}

const patchSchema = z.object({
  id: z.string().uuid(),
  role: z.enum(['admin', 'consultant', 'client', 'viewer']),
  acc_role: z
    .enum([
      'analytics_lead',
      'analytics_consultant',
      'manager',
      'director',
      'product_owner',
      'developer',
      'qa',
      'read_only',
    ])
    .nullable()
    .optional(),
});

export async function PATCH(request: NextRequest) {
  const session = await requireInternalAccess();
  if (session instanceof NextResponse) return session;

  let body: z.infer<typeof patchSchema>;
  try {
    body = patchSchema.parse(await request.json());
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message ?? 'Datos inválidos' }, { status: 400 });
    }
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  if (body.id === session.user.id && body.role !== 'admin') {
    return NextResponse.json(
      { error: 'No puedes quitarte el rol de administrador a ti mismo' },
      { status: 400 }
    );
  }

  const admin = createAdminClient();
  const accRole =
    body.role === 'client' || body.role === 'viewer' ? null : (body.acc_role ?? null);

  if (
    body.role !== 'client' &&
    body.role !== 'viewer' &&
    !accRole
  ) {
    return NextResponse.json(
      { error: 'Los usuarios internos necesitan un rol ACC (acc_role)' },
      { status: 400 }
    );
  }

  const { error } = await admin.rpc('admin_update_profile_roles', {
    p_profile_id: body.id,
    p_role: body.role,
    p_acc_role: accRole,
  });

  if (error) {
    console.error('admin_update_profile_roles:', error);
    const msg = error.message.includes('profile_not_found')
      ? 'Usuario no encontrado'
      : 'No se pudo actualizar el rol';
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  const { data: updated } = await admin
    .from('profiles')
    .select('id, email, full_name, role, acc_role')
    .eq('id', body.id)
    .single();

  return NextResponse.json({
    profile: updated
      ? {
          ...updated,
          app_role: getAppRole({
            role: updated.role,
            acc_role: updated.acc_role,
            email: updated.email,
          }),
        }
      : null,
  });
}
