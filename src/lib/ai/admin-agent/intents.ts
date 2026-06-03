import type { SergioCapacity } from '@/lib/availability-config';
import type { AdminPendingAction } from '@/lib/ai/admin-agent/types';
import { resolveRequestIdByRef } from '@/lib/ai/admin-agent/tools';
import { addDays, format } from 'date-fns';

export type AdminReadIntent =
  | { kind: 'list_pending' }
  | { kind: 'list_requests' }
  | { kind: 'list_in_progress' }
  | { kind: 'list_requesters' }
  | { kind: 'get_request'; ref: string }
  | { kind: 'semaphore' }
  | { kind: 'list_events' };

export type AdminIntentResult =
  | { mode: 'read'; read: AdminReadIntent }
  | { mode: 'pending'; pending: AdminPendingAction }
  | { mode: 'chat' };

const REF_RE = /\b(AMX[-_]?\d{3,}|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\b/i;

function extractRef(message: string): string | null {
  const m = message.match(REF_RE);
  return m ? m[1] : null;
}

function parseDateFromMessage(message: string): string | null {
  const iso = message.match(/\b(20\d{2}-\d{2}-\d{2})\b/);
  if (iso) return iso[1];
  const dmy = message.match(/\b(\d{1,2})[\/\-](\d{1,2})[\/\-](20\d{2})\b/);
  if (dmy) {
    const [, d, mo, y] = dmy;
    return `${y}-${mo.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  if (/\b(pr[oó]xima semana|en una semana|7 d[ií]as)\b/i.test(message)) {
    return format(addDays(new Date(), 7), 'yyyy-MM-dd');
  }
  return null;
}

function extractNotes(message: string): string | null {
  const m = message.match(/(?:nota|porque|motivo)[:\s]+(.+)/i);
  return m?.[1]?.trim().slice(0, 500) ?? null;
}

export function isAdminConfirm(message: string): boolean {
  const t = message.trim().toLowerCase();
  return /^(s[ií]|si|confirmo|adelante|dale|ok|okay|hazlo|ejecuta)\b/.test(t);
}

export function isAdminCancel(message: string): boolean {
  const t = message.trim().toLowerCase();
  return /^(no|cancelar|cancela|mejor no|olv[ií]dalo)\b/.test(t);
}

export async function detectAdminIntent(message: string): Promise<AdminIntentResult> {
  const lower = message.toLowerCase().trim();
  const ref = extractRef(message);

  if (
    /\b(pedidos pendientes|por aceptar|esperan mi respuesta|bandeja pendiente|cu[aá]ntos pendientes)\b/.test(
      lower
    )
  ) {
    return { mode: 'read', read: { kind: 'list_pending' } };
  }

  if (
    /\b(solicitantes|qui[eé]n pide|qui[eé]n est[aá] pidiendo|clientes|requester|por [aá]rea)\b/.test(
      lower
    )
  ) {
    return { mode: 'read', read: { kind: 'list_requesters' } };
  }

  if (
    /\b(en curso|en desarrollo|aceptados|activos|en progreso)\b/.test(lower) &&
    /\b(pedido|solicitud|trabajo)\b/.test(lower)
  ) {
    return { mode: 'read', read: { kind: 'list_in_progress' } };
  }

  if (
    /\b(lista(r)?|ver|todas las|últimas|ultimas)\b/.test(lower) &&
    /\b(solicitud|pedido|bandeja|cliente)\b/.test(lower) &&
    !/\b(pendiente|mis pedidos)\b/.test(lower)
  ) {
    return { mode: 'read', read: { kind: 'list_requests' } };
  }

  if (/\b(sem[aá]foro|capacidad|cola|disponibilidad|oof|fuera de oficina)\b/.test(lower)) {
    if (/\b(cambiar|poner|marcar|actualizar|a)\s+(disponible|limited|limitado|lleno|full|oof)\b/i.test(message)) {
      const cap = parseCapacityTarget(message);
      if (cap) {
        const pending = await buildCapacityPending(cap, message);
        if (pending) return { mode: 'pending', pending };
      }
    }
    return { mode: 'read', read: { kind: 'semaphore' } };
  }

  if (/\b(eventos|cat[aá]logo ga4|event catalog)\b/.test(lower)) {
    return { mode: 'read', read: { kind: 'list_events' } };
  }

  if (ref && /\b(detalle|ver|info|pedido|solicitud)\b/.test(lower)) {
    return { mode: 'read', read: { kind: 'get_request', ref } };
  }

  if (/\b(aceptar|acepto|tomar|s[ií] lo tomo)\b/.test(lower)) {
    const pending = await buildAcceptPending(message, ref);
    if (pending) return { mode: 'pending', pending };
  }

  if (/\b(rechazar|rechazo|no puedo tomarlo|declinar)\b/.test(lower)) {
    const pending = await buildRejectPending(message, ref);
    if (pending) return { mode: 'pending', pending };
  }

  if (/\b(comentar|comentario|nota en el pedido|avisar al cliente)\b/.test(lower)) {
    const pending = await buildCommentPending(message, ref);
    if (pending) return { mode: 'pending', pending };
  }

  if (ref && !/\b(aceptar|rechazar)\b/.test(lower)) {
    return { mode: 'read', read: { kind: 'get_request', ref } };
  }

  return { mode: 'chat' };
}

function parseCapacityTarget(message: string): SergioCapacity | null {
  if (/\b(disponible|available|verde)\b/i.test(message)) return 'available';
  if (/\b(limitado|limited|amarillo)\b/i.test(message)) return 'limited';
  if (/\b(lleno|full|rojo)\b/i.test(message)) return 'full';
  if (/\b(oof|fuera|vacaciones|ausente)\b/i.test(message)) return 'oof';
  return null;
}

async function buildCapacityPending(
  cap: SergioCapacity,
  message: string
): Promise<AdminPendingAction | null> {
  const note = extractNotes(message);
  return {
    type: 'set_capacity',
    summary: `Cambiar semáforo a «${cap}»${note ? ` — nota: ${note}` : ''}`,
    capacity: cap,
    capacity_note: note,
  };
}

async function buildAcceptPending(
  message: string,
  ref: string | null
): Promise<AdminPendingAction | null> {
  const idRef = ref ?? extractRef(message);
  if (!idRef) return null;
  const row = await resolveRequestIdByRef(idRef);
  if (!row) return null;
  if (row.sergio_decision && row.sergio_decision !== 'pending') return null;

  const due = parseDateFromMessage(message) ?? format(addDays(new Date(), 7), 'yyyy-MM-dd');
  const notes = extractNotes(message);

  return {
    type: 'accept_request',
    summary: `Aceptar «${row.title}» (${row.reference_code ?? row.id}) para el ${due}`,
    requestId: row.id,
    requestTitle: row.title,
    referenceCode: row.reference_code,
    committed_due_date: due,
    sergio_notes: notes,
  };
}

async function buildRejectPending(
  message: string,
  ref: string | null
): Promise<AdminPendingAction | null> {
  const idRef = ref ?? extractRef(message);
  if (!idRef) return null;
  const row = await resolveRequestIdByRef(idRef);
  if (!row) return null;

  return {
    type: 'reject_request',
    summary: `Rechazar «${row.title}» (${row.reference_code ?? row.id})`,
    requestId: row.id,
    requestTitle: row.title,
    referenceCode: row.reference_code,
    sergio_notes: extractNotes(message) ?? 'Rechazado desde Admin Agent.',
  };
}

async function buildCommentPending(
  message: string,
  ref: string | null
): Promise<AdminPendingAction | null> {
  const idRef = ref ?? extractRef(message);
  if (!idRef) return null;
  const row = await resolveRequestIdByRef(idRef);
  if (!row) return null;

  const content =
    message
      .replace(/.*(?:comentar|comentario|decir|avisar)[:\s]+/i, '')
      .trim()
      .slice(0, 2000) || message.trim();

  if (content.length < 3) return null;

  return {
    type: 'add_comment',
    summary: `Comentario en «${row.title}»: "${content.slice(0, 80)}${content.length > 80 ? '…' : ''}"`,
    requestId: row.id,
    requestTitle: row.title,
    referenceCode: row.reference_code,
    comment: content,
    is_internal: /\binterno\b/i.test(message),
  };
}
