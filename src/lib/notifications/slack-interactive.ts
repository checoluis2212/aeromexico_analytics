import { createHmac, timingSafeEqual } from 'crypto';
import type { CapacityAdvice } from '@/lib/request-acceptance';
import { priorityLabels, requestTypeLabels } from '@/lib/constants';
import { portalPedidoUrl } from '@/lib/notifications/channels';
import { dueDateFromAdvice } from '@/lib/requests/apply-request-decision';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export type EscalationPayload = {
  requestId: string;
  reference_code?: string | null;
  title: string;
  requester_name: string;
  requester_email: string;
  type: string;
  priority: string;
  company?: string | null;
  description?: string | null;
  sergio_message: string;
  reasons: string[];
  advice?: CapacityAdvice | null;
};

export function slackInteractiveEnabled(): boolean {
  return Boolean(
    process.env.SLACK_BOT_TOKEN?.trim() &&
      process.env.SLACK_SIGNING_SECRET?.trim() &&
      process.env.SLACK_CHANNEL_ID?.trim()
  );
}

export function verifySlackSignature(
  signingSecret: string,
  signature: string | null,
  timestamp: string | null,
  rawBody: string
): boolean {
  if (!signature || !timestamp) return false;
  const age = Math.abs(Date.now() / 1000 - Number(timestamp));
  if (Number.isNaN(age) || age > 60 * 5) return false;

  const base = `v0:${timestamp}:${rawBody}`;
  const hmac = createHmac('sha256', signingSecret).update(base).digest('hex');
  const expected = `v0=${hmac}`;

  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

function buildEscalationBlocks(payload: EscalationPayload) {
  const ref = payload.reference_code ? ` · ${payload.reference_code}` : '';
  const due = dueDateFromAdvice(payload.advice ?? null);
  const dueLabel = format(new Date(due), "d 'de' MMMM yyyy", { locale: es });
  const link = portalPedidoUrl(payload.requestId);
  const desc =
    payload.description && payload.description.length > 280
      ? `${payload.description.slice(0, 277)}…`
      : payload.description;

  const reasonText =
    payload.reasons.length > 0
      ? payload.reasons.map((r) => `• ${r}`).join('\n')
      : '• Revisión manual';

  return [
    {
      type: 'header',
      text: { type: 'plain_text', text: `¿Cómo procedo?${ref}` },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*${payload.title}*\n${payload.sergio_message}`,
      },
    },
    {
      type: 'section',
      fields: [
        { type: 'mrkdwn', text: `*Quién:*\n${payload.requester_name}` },
        { type: 'mrkdwn', text: `*Área:*\n${payload.company ?? '—'}` },
        { type: 'mrkdwn', text: `*Tipo:*\n${requestTypeLabels[payload.type] ?? payload.type}` },
        {
          type: 'mrkdwn',
          text: `*Urgencia:*\n${priorityLabels[payload.priority] ?? payload.priority}`,
        },
      ],
    },
    ...(desc
      ? [
          {
            type: 'section',
            text: { type: 'mrkdwn', text: `*Detalle:*\n${desc}` },
          },
        ]
      : []),
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Por qué no auto-acepté:*\n${reasonText}\n\n*Si aceptas desde aquí:* fecha sugerida *${dueLabel}* (ajústala en el panel si hace falta).`,
      },
    },
    {
      type: 'actions',
      block_id: `req_actions_${payload.requestId}`,
      elements: [
        {
          type: 'button',
          text: { type: 'plain_text', text: 'Aceptar' },
          style: 'primary',
          action_id: 'req_accept',
          value: payload.requestId,
        },
        {
          type: 'button',
          text: { type: 'plain_text', text: 'Rechazar' },
          style: 'danger',
          action_id: 'req_reject',
          value: payload.requestId,
        },
        {
          type: 'button',
          text: { type: 'plain_text', text: 'Abrir en panel' },
          url: link,
          action_id: 'req_open_panel',
        },
      ],
    },
  ];
}

/** Mensaje interactivo en Slack cuando el agente escala a Sergio */
export async function postSlackEscalationQuestion(
  payload: EscalationPayload
): Promise<boolean> {
  const token = process.env.SLACK_BOT_TOKEN?.trim();
  const channel = process.env.SLACK_CHANNEL_ID?.trim();
  if (!token || !channel) return false;

  const res = await fetch('https://slack.com/api/chat.postMessage', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      channel,
      text: `Pedido pendiente: ${payload.title} — ¿Aceptar o rechazar?`,
      blocks: buildEscalationBlocks(payload),
    }),
  });

  const json = await res.json();
  if (!json.ok) {
    console.error('Slack chat.postMessage failed:', json.error);
    return false;
  }
  return true;
}

export async function updateSlackInteractionMessage(
  responseUrl: string,
  text: string
): Promise<void> {
  await fetch(responseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      replace_original: true,
      text,
    }),
  });
}
