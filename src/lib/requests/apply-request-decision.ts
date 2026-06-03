import { createAdminClient } from '@/lib/supabase/admin';
import { notifyRequestUpdate } from '@/lib/notifications/request-notify';
import { acceptanceMessage } from '@/lib/notifications/acceptance-notify';
import type { CapacityAdvice } from '@/lib/request-acceptance';
import type { SergioDecision } from '@/lib/request-acceptance';
import { addDays, format } from 'date-fns';
import { es } from 'date-fns/locale';

export type ApplyDecisionSource = 'panel' | 'slack' | 'teams' | 'agent';

export type ApplyDecisionInput = {
  requestId: string;
  decision: 'accepted' | 'rejected';
  committed_due_date?: string | null;
  sergio_notes?: string | null;
  decidedByUserId?: string | null;
  decidedByLabel?: string;
  source?: ApplyDecisionSource;
};

function defaultDueDate(): string {
  return format(addDays(new Date(), 7), 'yyyy-MM-dd');
}

export function dueDateFromAdvice(advice: CapacityAdvice | null | undefined): string {
  if (advice?.suggested_due_date) return advice.suggested_due_date;
  return defaultDueDate();
}

export async function applyRequestDecision(
  input: ApplyDecisionInput
): Promise<{ ok: true; data: Record<string, unknown> } | { ok: false; error: string; status: number }> {
  const admin = createAdminClient();
  const { requestId, decision } = input;

  const { data: existing } = await admin
    .from('requests')
    .select(
      'id, title, requester_email, user_id, sergio_decision, ai_capacity_advice, reference_code'
    )
    .eq('id', requestId)
    .single();

  if (!existing) {
    return { ok: false, error: 'Pedido no encontrado', status: 404 };
  }

  if (existing.sergio_decision && existing.sergio_decision !== 'pending') {
    return {
      ok: false,
      error: `Ya decidido: ${existing.sergio_decision}`,
      status: 409,
    };
  }

  const advice = existing.ai_capacity_advice as CapacityAdvice | null;
  const dueDate =
    decision === 'accepted'
      ? input.committed_due_date ?? dueDateFromAdvice(advice)
      : null;

  if (decision === 'accepted' && !dueDate) {
    return { ok: false, error: 'Falta fecha de entrega', status: 400 };
  }

  const sourceLabel = input.source ?? 'panel';
  const notePrefix =
    input.sergio_notes?.trim() ||
    (sourceLabel === 'slack'
      ? 'Decisión desde Slack.'
      : sourceLabel === 'teams'
        ? 'Decisión desde Teams.'
        : '');

  const update: Record<string, unknown> = {
    sergio_decision: decision,
    committed_due_date: decision === 'accepted' ? dueDate : null,
    sergio_notes: notePrefix || null,
    sergio_decided_at: new Date().toISOString(),
    sergio_decided_by: input.decidedByUserId ?? null,
    updated_at: new Date().toISOString(),
  };

  if (decision === 'rejected') {
    update.status = 'cancelled';
    update.delivery_status = 'blocked';
  } else {
    update.status = 'in_review';
  }

  const { data, error } = await admin
    .from('requests')
    .update(update)
    .eq('id', requestId)
    .select(
      'id, title, sergio_decision, committed_due_date, sergio_notes, requester_email, user_id, reference_code'
    )
    .single();

  if (error) {
    return { ok: false, error: error.message, status: 500 };
  }

  await admin.from('activity_logs').insert({
    user_id: input.decidedByUserId ?? null,
    action: 'acceptance_decision',
    entity_type: 'request',
    entity_id: requestId,
    metadata: {
      decision,
      committed_due_date: dueDate,
      source: sourceLabel,
      by: input.decidedByLabel ?? 'Sergio',
    },
  });

  if (decision === 'accepted') {
    const dateLabel = format(new Date(dueDate!), "d 'de' MMMM yyyy", { locale: es });
    await admin.from('request_comments').insert({
      request_id: requestId,
      user_id: input.decidedByUserId ?? null,
      author_name: input.decidedByLabel ?? 'Sergio Burgos',
      content: `Pedido aceptado. Fecha comprometida: ${dateLabel}.${notePrefix ? ` ${notePrefix}` : ''}`,
      is_internal: false,
    });
  }

  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const { title, message } = acceptanceMessage(
    existing.title,
    decision,
    dueDate,
    notePrefix || null
  );

  await notifyRequestUpdate({
    requestId,
    requesterEmail: existing.requester_email,
    requesterUserId: existing.user_id,
    title,
    message,
    link: `${base}/mis-pedidos/${requestId}`,
    clientEvent: decision === 'accepted' ? 'accepted' : undefined,
  });

  return { ok: true, data: data as Record<string, unknown> };
}
