import {
  isTeamsWebhook,
  portalMisPedidosUrl,
  portalPedidoUrl,
  getNotificationWebhookUrls,
} from '@/lib/notifications/channels';

/** Pasos automáticos del agente / integraciones */
export type WorkflowStep =
  | 'request_submitted'
  | 'agent_acknowledged'
  | 'agent_triaged'
  | 'agent_auto_accepted'
  | 'agent_escalated'
  | 'status_synced'
  | 'chat_request_created';

const STEP_LABELS: Record<WorkflowStep, string> = {
  request_submitted: 'Pedido recibido',
  chat_request_created: 'Pedido desde Pregúntale',
  agent_acknowledged: 'Agente respondió al cliente',
  agent_triaged: 'Triaje completado',
  agent_auto_accepted: 'Auto-aceptado por el agente',
  agent_escalated: 'Escalado a Sergio',
  status_synced: 'Estado actualizado (sync)',
};

const STEP_COLORS: Record<WorkflowStep, string> = {
  request_submitted: '0078D4',
  chat_request_created: '6264A7',
  agent_acknowledged: '5B5BD6',
  agent_triaged: '8764B8',
  agent_auto_accepted: '107C10',
  agent_escalated: 'FF8C00',
  status_synced: '008272',
};

export type WorkflowNotifyInput = {
  step: WorkflowStep;
  requestId: string;
  title: string;
  reference_code?: string | null;
  requester_name?: string;
  requester_email?: string;
  message: string;
  facts?: Record<string, string>;
  internalLink?: boolean;
};

function buildSlackPayload(input: WorkflowNotifyInput) {
  const label = STEP_LABELS[input.step];
  const ref = input.reference_code ? ` · ${input.reference_code}` : '';
  const link = input.internalLink
    ? portalPedidoUrl(input.requestId)
    : portalMisPedidosUrl(input.requestId);

  const fields = Object.entries(input.facts ?? {}).map(([k, v]) => ({
    type: 'mrkdwn' as const,
    text: `*${k}:*\n${v}`,
  }));

  return {
    text: `${label}${ref} — ${input.title}`,
    blocks: [
      {
        type: 'header',
        text: { type: 'plain_text', text: `${label}${ref}` },
      },
      {
        type: 'section',
        text: { type: 'mrkdwn', text: input.message },
      },
      ...(fields.length
        ? [{ type: 'section', fields: fields.slice(0, 10) }]
        : []),
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: { type: 'plain_text', text: 'Ver pedido' },
            url: link,
          },
        ],
      },
    ],
  };
}

function buildTeamsPayload(input: WorkflowNotifyInput) {
  const label = STEP_LABELS[input.step];
  const ref = input.reference_code ? ` · ${input.reference_code}` : '';
  const link = input.internalLink
    ? portalPedidoUrl(input.requestId)
    : portalMisPedidosUrl(input.requestId);

  const facts = Object.entries(input.facts ?? {}).map(([name, value]) => ({
    name,
    value,
  }));

  if (input.requester_name) {
    facts.unshift({
      name: 'Quién',
      value: input.requester_email
        ? `${input.requester_name} (${input.requester_email})`
        : input.requester_name,
    });
  }

  return {
    '@type': 'MessageCard',
    '@context': 'https://schema.org/extensions',
    summary: `${label}: ${input.title}`,
    themeColor: STEP_COLORS[input.step],
    title: `${label}${ref}`,
    sections: [
      {
        activityTitle: input.title,
        text: input.message,
        ...(facts.length ? { facts } : {}),
      },
    ],
    potentialAction: [
      { '@type': 'OpenUri', name: 'Ver pedido', targets: [{ os: 'default', uri: link }] },
    ],
  };
}

/** Notifica a Slack y/o Teams cada avance automático del proceso */
export async function notifyWorkflowStep(input: WorkflowNotifyInput): Promise<void> {
  const urls = getNotificationWebhookUrls();
  if (urls.length === 0) return;

  await Promise.all(
    urls.map(async (url) => {
      const body = isTeamsWebhook(url) ? buildTeamsPayload(input) : buildSlackPayload(input);
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          console.error(`Workflow webhook responded ${res.status}`);
        }
      } catch (err) {
        console.error('Workflow notification failed:', err);
      }
    })
  );
}

export function workflowEnabled(): boolean {
  return getNotificationWebhookUrls().length > 0;
}
