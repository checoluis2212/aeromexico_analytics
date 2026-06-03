import { createAdminClient } from '@/lib/supabase/admin';
import { getSergioAvailability, updateSergioAvailability } from '@/lib/availability';
import { CAPACITY_CONFIG, type SergioCapacity } from '@/lib/availability-config';
import { priorityLabels, requestTypeLabels } from '@/lib/constants';
import { applyRequestDecision } from '@/lib/requests/apply-request-decision';
import { mapDeliveryStatusForUser } from '@/lib/integrations/external-sync';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { AdminPendingAction, AdminToolReadResult } from '@/lib/ai/admin-agent/types';

const VALID_CAPACITY: SergioCapacity[] = ['available', 'limited', 'full', 'oof'];

export async function listRequestsForAdmin(opts?: {
  pendingOnly?: boolean;
  limit?: number;
}): Promise<AdminToolReadResult> {
  const admin = createAdminClient();
  const limit = opts?.limit ?? 12;

  let query = admin
    .from('requests')
    .select(
      'id, reference_code, title, type, priority, status, delivery_status, company, requester_name, sergio_decision, committed_due_date, created_at'
    )
    .order('created_at', { ascending: false })
    .limit(limit);

  if (opts?.pendingOnly) {
    query = query.eq('sergio_decision', 'pending');
  }

  const { data, error } = await query;
  if (error) {
    return { tool: 'list_requests', markdown: `Error al leer pedidos: ${error.message}` };
  }

  const rows = data ?? [];
  if (rows.length === 0) {
    return {
      tool: 'list_requests',
      markdown: opts?.pendingOnly
        ? 'No hay pedidos pendientes de tu decisión.'
        : 'No hay pedidos en el sistema.',
    };
  }

  const lines = rows.map((r) => {
    const ref = r.reference_code ?? r.id.slice(0, 8);
    const status =
      r.sergio_decision === 'pending'
        ? 'pendiente de ti'
        : mapDeliveryStatusForUser(r.delivery_status ?? r.status);
    const type = requestTypeLabels[r.type as keyof typeof requestTypeLabels] ?? r.type;
    return `- **${ref}** · "${r.title}" · ${type} · ${status} · ${r.requester_name ?? '—'} · [Abrir](/command-center/pedidos/${r.id})`;
  });

  return {
    tool: 'list_requests',
    markdown: `**${rows.length} pedido(s)**${opts?.pendingOnly ? ' por aceptar/rechazar' : ''}:\n\n${lines.join('\n')}`,
  };
}

export async function getRequestDetailForAdmin(
  idOrRef: string
): Promise<AdminToolReadResult> {
  const admin = createAdminClient();
  const term = idOrRef.trim().replace(/%/g, '');

  const select =
    'id, reference_code, title, description, type, priority, status, delivery_status, company, requester_name, requester_email, sergio_decision, committed_due_date, sergio_notes, created_at, ai_capacity_advice';

  const byId = await admin.from('requests').select(select).eq('id', term).maybeSingle();
  let request = byId.data;
  let error = byId.error;

  if (!request && !error) {
    const byRef = await admin
      .from('requests')
      .select(select)
      .ilike('reference_code', term)
      .maybeSingle();
    request = byRef.data;
    error = byRef.error;
  }
  if (error || !request) {
    return {
      tool: 'get_request',
      markdown: `No encontré pedido con referencia o id "${term}".`,
    };
  }

  const { data: comments } = await admin
    .from('request_comments')
    .select('author_name, content, created_at, is_internal')
    .eq('request_id', request.id)
    .order('created_at', { ascending: false })
    .limit(5);

  const advice = request.ai_capacity_advice as { summary?: string } | null;
  const commentLines =
    (comments ?? []).length > 0
      ? (comments ?? [])
          .map(
            (c) =>
              `- ${c.author_name}${c.is_internal ? ' (interno)' : ''}: ${c.content.slice(0, 160)}`
          )
          .join('\n')
      : '- Sin comentarios recientes';

  const due = request.committed_due_date
    ? format(new Date(request.committed_due_date), "d MMM yyyy", { locale: es })
    : 'sin fecha';

  return {
    tool: 'get_request',
    markdown: `**Pedido ${request.reference_code ?? request.id}**
- Título: ${request.title}
- Tipo: ${requestTypeLabels[request.type as keyof typeof requestTypeLabels] ?? request.type}
- Prioridad: ${priorityLabels[request.priority as keyof typeof priorityLabels] ?? request.priority}
- Decisión Sergio: ${request.sergio_decision ?? 'pending'}
- Estado entrega: ${mapDeliveryStatusForUser(request.delivery_status ?? request.status)}
- Fecha comprometida: ${due}
- Solicitante: ${request.requester_name ?? '—'} (${request.requester_email ?? '—'})
- Área: ${request.company ?? '—'}
- Descripción: ${(request.description ?? '').slice(0, 500)}
${advice?.summary ? `- Consejo IA capacidad: ${advice.summary}` : ''}
- Comentarios:
${commentLines}
- [Ver en bandeja](/command-center/pedidos/${request.id})`,
  };
}

export async function getSemaphoreForAdmin(): Promise<AdminToolReadResult> {
  const availability = await getSergioAvailability();
  const cfg = CAPACITY_CONFIG[availability.capacity];
  const note = availability.note?.trim() ? `\n- Nota: ${availability.note}` : '';

  return {
    tool: 'get_semaphore',
    markdown: `**Semáforo actual:** ${cfg.label}
- ${cfg.headline}
- ${cfg.hint}${note}
- Actualizado: ${format(new Date(availability.updated_at), "d MMM yyyy HH:mm", { locale: es })}`,
  };
}

export async function listInProgressRequestsForAdmin(
  limit = 12
): Promise<AdminToolReadResult> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('requests')
    .select(
      'id, reference_code, title, type, company, requester_name, delivery_status, status, committed_due_date, sergio_decision'
    )
    .eq('sergio_decision', 'accepted')
    .order('committed_due_date', { ascending: true, nullsFirst: false })
    .limit(limit * 2);

  if (error) {
    return { tool: 'list_in_progress', markdown: `Error: ${error.message}` };
  }

  const done = new Set(['done', 'cancelled', 'backlog']);
  const rows = (data ?? [])
    .filter((r) => !done.has(r.delivery_status ?? r.status ?? ''))
    .slice(0, limit);
  if (rows.length === 0) {
    return {
      tool: 'list_in_progress',
      markdown: 'No hay pedidos aceptados en curso ahora mismo.',
    };
  }

  const lines = rows.map((r) => {
    const ref = r.reference_code ?? r.id.slice(0, 8);
    const due = r.committed_due_date
      ? format(new Date(r.committed_due_date), 'd MMM', { locale: es })
      : 'sin fecha';
    return `- **${ref}** · "${r.title}" · ${r.requester_name ?? '—'} · ${mapDeliveryStatusForUser(r.delivery_status ?? r.status)} · entrega ${due}`;
  });

  return {
    tool: 'list_in_progress',
    markdown: `**${rows.length} pedido(s) en curso:**\n\n${lines.join('\n')}`,
  };
}

export async function listRecentRequestersForAdmin(): Promise<AdminToolReadResult> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('requests')
    .select(
      'requester_name, requester_email, company, sergio_decision, created_at, reference_code, title'
    )
    .order('created_at', { ascending: false })
    .limit(40);

  if (error) {
    return { tool: 'list_requesters', markdown: `Error: ${error.message}` };
  }

  const rows = data ?? [];
  if (rows.length === 0) {
    return { tool: 'list_requesters', markdown: 'No hay solicitudes registradas.' };
  }

  const byEmail = new Map<
    string,
    {
      name: string;
      company: string | null;
      pending: number;
      total: number;
      latest: string;
    }
  >();

  for (const r of rows) {
    const key = (r.requester_email ?? r.requester_name ?? 'sin-email').toLowerCase();
    const cur = byEmail.get(key) ?? {
      name: r.requester_name ?? '—',
      company: r.company,
      pending: 0,
      total: 0,
      latest: r.reference_code ?? r.title,
    };
    cur.total += 1;
    if (r.sergio_decision === 'pending') cur.pending += 1;
    byEmail.set(key, cur);
  }

  const sorted = [...byEmail.values()].sort((a, b) => b.pending - a.pending || b.total - a.total);
  const lines = sorted.slice(0, 10).map((s) => {
    const area = s.company ? ` · ${s.company}` : '';
    const pend = s.pending > 0 ? ` · **${s.pending} pendiente(s)**` : '';
    return `- **${s.name}**${area} — ${s.total} pedido(s) reciente(s)${pend}`;
  });

  return {
    tool: 'list_requesters',
    markdown: `**Solicitantes recientes (muestra):**\n\n${lines.join('\n')}\n\n[Bandeja completa](/command-center/pedidos)`,
  };
}

export async function listEventsForAdmin(limit = 10): Promise<AdminToolReadResult> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('event_catalog')
    .select('event_name, description, category, health_status')
    .eq('is_active', true)
    .order('event_name')
    .limit(limit);

  if (error) {
    return { tool: 'list_events', markdown: `Error catálogo: ${error.message}` };
  }

  const rows = data ?? [];
  const lines = rows.map(
    (e) =>
      `- \`${e.event_name}\` (${e.category ?? '—'}) · ${e.health_status ?? 'ok'} — ${(e.description ?? '').slice(0, 80)}`
  );

  return {
    tool: 'list_events',
    markdown: `**Eventos GA4 (muestra ${rows.length}):**\n\n${lines.join('\n')}\n\n[Catálogo completo](/command-center/events)`,
  };
}

export async function executeAdminPendingAction(
  action: AdminPendingAction,
  userId: string,
  userLabel: string
): Promise<{ ok: true; markdown: string } | { ok: false; error: string }> {
  switch (action.type) {
    case 'accept_request': {
      if (!action.requestId) return { ok: false, error: 'Falta id del pedido' };
      const result = await applyRequestDecision({
        requestId: action.requestId,
        decision: 'accepted',
        committed_due_date: action.committed_due_date ?? null,
        sergio_notes: action.sergio_notes ?? null,
        decidedByUserId: userId,
        decidedByLabel: userLabel,
        source: 'agent',
      });
      if (!result.ok) return { ok: false, error: result.error };
      const ref = (result.data.reference_code as string) ?? action.referenceCode;
      return {
        ok: true,
        markdown: `Pedido **${ref ?? action.requestTitle}** aceptado. Fecha: ${action.committed_due_date ?? 'según consejo IA'}.`,
      };
    }
    case 'reject_request': {
      if (!action.requestId) return { ok: false, error: 'Falta id del pedido' };
      const result = await applyRequestDecision({
        requestId: action.requestId,
        decision: 'rejected',
        sergio_notes: action.sergio_notes ?? 'Rechazado desde Admin Agent.',
        decidedByUserId: userId,
        decidedByLabel: userLabel,
        source: 'agent',
      });
      if (!result.ok) return { ok: false, error: result.error };
      return {
        ok: true,
        markdown: `Pedido **${action.referenceCode ?? action.requestTitle}** rechazado.`,
      };
    }
    case 'set_capacity': {
      const cap = action.capacity;
      if (!cap || !VALID_CAPACITY.includes(cap)) {
        return { ok: false, error: 'Estado de semáforo inválido' };
      }
      await updateSergioAvailability({
        capacity: cap,
        note: action.capacity_note ?? null,
        userId,
      });
      return {
        ok: true,
        markdown: `Semáforo actualizado a **${CAPACITY_CONFIG[cap].label}**.`,
      };
    }
    case 'add_comment': {
      if (!action.requestId || !action.comment?.trim()) {
        return { ok: false, error: 'Falta pedido o texto del comentario' };
      }
      const admin = createAdminClient();
      const { error } = await admin.from('request_comments').insert({
        request_id: action.requestId,
        user_id: userId,
        author_name: userLabel,
        content: action.comment.trim(),
        is_internal: action.is_internal ?? false,
      });
      if (error) return { ok: false, error: error.message };
      return {
        ok: true,
        markdown: `Comentario añadido al pedido **${action.referenceCode ?? action.requestTitle}**.`,
      };
    }
    default:
      return { ok: false, error: 'Acción no reconocida' };
  }
}

export async function resolveRequestIdByRef(refOrId: string): Promise<{
  id: string;
  title: string;
  reference_code: string | null;
  sergio_decision: string | null;
} | null> {
  const admin = createAdminClient();
  const term = refOrId.trim();
  const cols = 'id, title, reference_code, sergio_decision';

  const { data: byId } = await admin.from('requests').select(cols).eq('id', term).maybeSingle();
  if (byId) return byId;

  const { data: byRef } = await admin
    .from('requests')
    .select(cols)
    .ilike('reference_code', term)
    .maybeSingle();
  return byRef ?? null;
}
