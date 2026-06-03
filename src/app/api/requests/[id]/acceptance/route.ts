import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { hasInternalAccess } from '@/lib/auth/access';
import { applyRequestDecision } from '@/lib/requests/apply-request-decision';
import { z } from 'zod';

const schema = z.object({
  decision: z.enum(['accepted', 'rejected']),
  committed_due_date: z.string().nullable().optional(),
  sergio_notes: z.string().nullable().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, acc_role, full_name, email')
    .eq('id', user.id)
    .single();

  if (!hasInternalAccess(profile)) {
    return NextResponse.json({ error: 'Sin permiso' }, { status: 403 });
  }

  const body = schema.parse(await request.json());
  const decision = body.decision;

  if (decision === 'accepted' && !body.committed_due_date) {
    return NextResponse.json(
      { error: 'Indica la fecha en la que puedes entregarlo' },
      { status: 400 }
    );
  }

  const result = await applyRequestDecision({
    requestId: id,
    decision,
    committed_due_date: body.committed_due_date ?? null,
    sergio_notes: body.sergio_notes ?? null,
    decidedByUserId: user.id,
    decidedByLabel: profile?.full_name ?? profile?.email ?? 'Sergio',
    source: 'panel',
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json(result.data);
}
