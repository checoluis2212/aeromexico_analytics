import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { hasInternalAccess } from '@/lib/auth/access';
import { notifyRequestUpdate } from '@/lib/notifications/request-notify';
import { acceptanceMessage } from '@/lib/notifications/acceptance-notify';
import type { SergioDecision } from '@/lib/request-acceptance';
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
  const decision = body.decision as SergioDecision;

  if (decision === 'accepted' && !body.committed_due_date) {
    return NextResponse.json(
      { error: 'Indica la fecha en la que puedes entregarlo' },
      { status: 400 }
    );
  }

  const admin = createAdminClient();
  const { data: existing } = await admin
    .from('requests')
    .select('id, title, requester_email, user_id, sergio_decision')
    .eq('id', id)
    .single();

  if (!existing) {
    return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
  }

  const update: Record<string, unknown> = {
    sergio_decision: decision,
    committed_due_date: decision === 'accepted' ? body.committed_due_date : null,
    sergio_notes: body.sergio_notes?.trim() || null,
    sergio_decided_at: new Date().toISOString(),
    sergio_decided_by: user.id,
    updated_at: new Date().toISOString(),
  };

  if (decision === 'rejected') {
    update.status = 'cancelled';
    update.delivery_status = 'blocked';
  } else if (decision === 'accepted') {
    update.status = 'in_review';
  }

  const { data, error } = await admin
    .from('requests')
    .update(update)
    .eq('id', id)
    .select(
      'id, title, sergio_decision, committed_due_date, sergio_notes, sergio_decided_at, requester_email, user_id'
    )
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await admin.from('activity_logs').insert({
    user_id: user.id,
    action: 'acceptance_decision',
    entity_type: 'request',
    entity_id: id,
    metadata: {
      decision,
      committed_due_date: body.committed_due_date ?? null,
      by: profile?.full_name ?? profile?.email,
    },
  });

  if (decision === 'accepted') {
    await admin.from('request_comments').insert({
      request_id: id,
      user_id: user.id,
      author_name: profile?.full_name ?? 'Sergio Burgos',
      content: `Pedido aceptado. Fecha comprometida: ${body.committed_due_date}.${body.sergio_notes?.trim() ? ` ${body.sergio_notes.trim()}` : ''}`,
      is_internal: false,
    });
  }

  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const { title, message } = acceptanceMessage(
    existing.title,
    decision,
    body.committed_due_date ?? null,
    body.sergio_notes ?? null
  );

  await notifyRequestUpdate({
    requestId: id,
    requesterEmail: existing.requester_email,
    requesterUserId: existing.user_id,
    title,
    message,
    link: `${base}/mis-pedidos/${id}`,
  });

  return NextResponse.json(data);
}
