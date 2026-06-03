import { createClient } from '@/lib/supabase/server';
import { mapDeliveryStatusForUser } from '@/lib/integrations/external-sync';
import { priorityLabels, requestTypeLabels } from '@/lib/constants';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export type RequestAssistantSnapshot = {
  id: string;
  reference_code: string | null;
  title: string;
  description: string;
  type: string;
  priority: string;
  status: string;
  delivery_status: string | null;
  company: string | null;
  sergio_decision: string | null;
  committed_due_date: string | null;
  sergio_notes: string | null;
  created_at: string;
  recent_comments: { author: string; content: string; at: string }[];
};

export async function loadRequestSnapshotForAssistant(
  requestId: string,
  userId: string,
  email: string
): Promise<RequestAssistantSnapshot | null> {
  const supabase = await createClient();

  const { data: request } = await supabase
    .from('requests')
    .select(
      'id, reference_code, title, description, type, priority, status, delivery_status, company, sergio_decision, committed_due_date, sergio_notes, created_at'
    )
    .eq('id', requestId)
    .or(`user_id.eq.${userId},requester_email.eq.${email}`)
    .maybeSingle();

  if (!request) return null;

  const { data: comments } = await supabase
    .from('request_comments')
    .select('author_name, content, created_at')
    .eq('request_id', requestId)
    .eq('is_internal', false)
    .order('created_at', { ascending: false })
    .limit(5);

  return {
    id: request.id,
    reference_code: request.reference_code,
    title: request.title,
    description: request.description ?? request.title,
    type: request.type,
    priority: request.priority,
    status: request.status,
    delivery_status: request.delivery_status,
    company: request.company,
    sergio_decision: request.sergio_decision,
    committed_due_date: request.committed_due_date,
    sergio_notes: request.sergio_notes,
    created_at: request.created_at,
    recent_comments: (comments ?? []).reverse().map((c) => ({
      author: c.author_name ?? 'Equipo',
      content: c.content,
      at: c.created_at,
    })),
  };
}

export function formatRequestSnapshotContext(req: RequestAssistantSnapshot): string {
  const statusLabel = mapDeliveryStatusForUser(req.delivery_status ?? req.status);
  const typeLabel = requestTypeLabels[req.type] ?? req.type;
  const priorityLabel = priorityLabels[req.priority] ?? req.priority;
  const due = req.committed_due_date
    ? format(new Date(req.committed_due_date), "d MMM yyyy", { locale: es })
    : 'sin fecha aún';

  const commentsBlock =
    req.recent_comments.length > 0
      ? req.recent_comments
          .map((c) => `- ${c.author}: ${c.content.slice(0, 200)}`)
          .join('\n')
      : '- Sin comentarios públicos aún';

  return `Pedido activo del usuario (contexto Mis pedidos):
ID: ${req.reference_code ?? req.id}
Título: ${req.title}
Tipo: ${typeLabel}
Urgencia: ${priorityLabel}
Estado: ${statusLabel}
Decisión Sergio: ${req.sergio_decision ?? 'pending'}
Fecha comprometida: ${due}
Área: ${req.company ?? 'Sin área'}
Descripción: ${req.description.slice(0, 800)}
Notas Sergio: ${req.sergio_notes ?? '—'}
Comentarios recientes:
${commentsBlock}

El usuario puede preguntar por el estado, qué sigue, plazos o si debe hacer algo. Responde con datos de este pedido; no inventes avances.`;
}

export function buildRequestWelcomeMessage(req: RequestAssistantSnapshot): string {
  const statusLabel = mapDeliveryStatusForUser(req.delivery_status ?? req.status);
  const ref = req.reference_code ? ` **${req.reference_code}**` : '';

  return `## Tu pedido${ref}

Veo **"${req.title}"** — ahora mismo está en **${statusLabel}**.

Pregúntame lo que quieras: en qué va, qué significa ese estado, si te falta hacer algo o cuándo podría estar listo. Respondo con lo que hay en el sistema; **no invento fechas** que Sergio no haya confirmado.

Si lo que necesitas es **otra cosa distinta**, usa [Pedir con IA](/pedir) o el botón de comentarios en el detalle del pedido.`;
}

export const REQUEST_STATUS_SUGGESTIONS = [
  '¿En qué va mi pedido?',
  '¿Qué significa este estado?',
  '¿Necesito hacer algo yo?',
  '¿Cuándo estará listo?',
] as const;

export type UserOrderSummary = {
  id: string;
  reference_code: string | null;
  title: string;
  type: string;
  status: string;
  delivery_status: string | null;
  created_at: string;
  sergio_decision: string | null;
};

export async function loadUserOrdersForAssistant(
  userId: string,
  email: string,
  limit = 12
): Promise<UserOrderSummary[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('requests')
    .select(
      'id, reference_code, title, type, status, delivery_status, created_at, sergio_decision'
    )
    .or(`user_id.eq.${userId},requester_email.eq.${email}`)
    .order('created_at', { ascending: false })
    .limit(limit);

  return (data ?? []) as UserOrderSummary[];
}

export function formatUserOrdersContext(orders: UserOrderSummary[]): string {
  if (orders.length === 0) {
    return `Pedidos del usuario (Mis pedidos — datos reales del portal):
- Ningún pedido registrado todavía.
Puedes decirlo con naturalidad. No digas que no tienes acceso: sí ves esta lista (vacía).`;
  }

  const lines = orders.map((o) => {
    const statusLabel = mapDeliveryStatusForUser(o.delivery_status ?? o.status);
    const typeLabel = requestTypeLabels[o.type as keyof typeof requestTypeLabels] ?? o.type;
    const ref = o.reference_code ?? o.id.slice(0, 8);
    return `- ${ref} · "${o.title}" · ${typeLabel} · ${statusLabel} · id=${o.id}`;
  });

  return `Pedidos del usuario (Mis pedidos — datos reales; resúmelos si preguntan; NO digas que no tienes acceso):
${lines.join('\n')}`;
}

export function wantsUserOrdersQuery(message: string): boolean {
  const lower = message.toLowerCase().trim();
  return (
    /\b(mis pedidos|mis solicitudes)\b/.test(lower) ||
    /\b(ver|lista(r)?|mostrar|revisar)\s+(mis\s+)?pedidos\b/.test(lower) ||
    /\b(puedes ver|tienes acceso|ves mis|acceso a)\b/.test(lower) ||
    /\b(cu[aá]ntos pedidos|qu[eé] pedidos tengo)\b/.test(lower)
  );
}

export function formatUserOrdersReply(orders: UserOrderSummary[]): string {
  if (orders.length === 0) {
    return `Ahora mismo no aparece ningún pedido tuyo en el portal. Si acabas de enviar uno, puede tardar un momento en reflejarse.

Para crear uno: [Pedir trabajo](/pedir).`;
  }

  const lines = orders.slice(0, 8).map((o) => {
    const statusLabel = mapDeliveryStatusForUser(o.delivery_status ?? o.status);
    const ref = o.reference_code ? `**${o.reference_code}** · ` : '';
    return `- ${ref}**${o.title}** — ${statusLabel}. [Detalle](/mis-pedidos/${o.id})`;
  });

  const extra =
    orders.length > 8
      ? `\n\nY ${orders.length - 8} más en [Mis pedidos](/mis-pedidos).`
      : '';

  return `Sí — veo **${orders.length}** pedido${orders.length === 1 ? '' : 's'} tuyo${orders.length === 1 ? '' : 's'} en el portal:

${lines.join('\n')}${extra}

¿Sobre cuál quieres que baje al detalle (estado, plazo o si te falta hacer algo)?`;
}
