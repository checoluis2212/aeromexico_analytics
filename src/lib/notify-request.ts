import {
  isTeamsWebhook,
  portalPedidoUrl,
  getNotificationWebhookUrls,
} from '@/lib/notifications/channels';

type RequestNotification = {
  id: string;
  reference_code?: string | null;
  title: string;
  type: string;
  priority: string;
  requester_name: string;
  requester_email: string;
  company?: string | null;
};

const PRIORITY_LABELS: Record<string, string> = {
  p0_critical: 'Urgente',
  p1_high: 'Importante',
  p2_medium: 'Normal',
  p3_low: 'Sin prisa',
};

const TYPE_LABELS: Record<string, string> = {
  dashboard: 'Dashboard o reporte',
  tracking: 'Medir algo nuevo',
  funnel: 'Embudo',
  qa: 'Revisar datos',
  reporting: 'BigQuery',
  investigation: 'Investigar un dato',
};

function buildSlackNewRequest(req: RequestNotification) {
  const priority = PRIORITY_LABELS[req.priority] ?? req.priority;
  const type = TYPE_LABELS[req.type] ?? req.type;
  const area = req.company ?? 'Sin área';
  const link = portalPedidoUrl(req.id);
  const ref = req.reference_code ? ` · ${req.reference_code}` : '';

  return {
    text: `Nueva petición · ${req.title}${ref}`,
    blocks: [
      {
        type: 'header',
        text: { type: 'plain_text', text: `Nueva petición · Sergio Burgos${ref}` },
      },
      {
        type: 'section',
        fields: [
          ...(req.reference_code
            ? [{ type: 'mrkdwn', text: `*ID:*\n${req.reference_code}` }]
            : []),
          { type: 'mrkdwn', text: `*Qué:*\n${req.title}` },
          { type: 'mrkdwn', text: `*Urgencia:*\n${priority}` },
          { type: 'mrkdwn', text: `*Quién:*\n${req.requester_name}` },
          { type: 'mrkdwn', text: `*Área:*\n${area}` },
        ],
      },
      {
        type: 'context',
        elements: [{ type: 'mrkdwn', text: `${type} · ${req.requester_email}` }],
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: { type: 'plain_text', text: 'Revisar y aceptar' },
            url: link,
          },
        ],
      },
    ],
  };
}

function buildTeamsNewRequest(req: RequestNotification) {
  const priority = PRIORITY_LABELS[req.priority] ?? req.priority;
  const type = TYPE_LABELS[req.type] ?? req.type;
  const area = req.company ?? 'Sin área';
  const link = portalPedidoUrl(req.id);
  const ref = req.reference_code ? ` · ${req.reference_code}` : '';

  return {
    '@type': 'MessageCard',
    '@context': 'https://schema.org/extensions',
    summary: `Nueva petición: ${req.title}`,
    themeColor: '0078D4',
    title: `Nueva petición para Sergio Burgos${ref}`,
    sections: [
      {
        activityTitle: req.title,
        facts: [
          ...(req.reference_code
            ? [{ name: 'ID pedido', value: req.reference_code }]
            : []),
          { name: 'Quién', value: `${req.requester_name} (${req.requester_email})` },
          { name: 'Área', value: area },
          { name: 'Tipo', value: type },
          { name: 'Urgencia', value: priority },
        ],
      },
    ],
    potentialAction: [
      { '@type': 'OpenUri', name: 'Aceptar o rechazar', targets: [{ os: 'default', uri: link }] },
    ],
  };
}

export async function notifyNewRequest(req: RequestNotification) {
  const urls = getNotificationWebhookUrls();
  if (urls.length === 0) return;

  await Promise.all(
    urls.map(async (url) => {
      const body = isTeamsWebhook(url) ? buildTeamsNewRequest(req) : buildSlackNewRequest(req);
      try {
        await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      } catch (err) {
        console.error('Webhook notification failed:', err);
      }
    })
  );
}

export async function notifyInternalOnNewRequest(req: RequestNotification) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return;

  const { createAdminClient } = await import('@/lib/supabase/admin');
  const admin = createAdminClient();
  const priority = PRIORITY_LABELS[req.priority] ?? req.priority;
  const link = portalPedidoUrl(req.id);

  const { data: internals } = await admin
    .from('profiles')
    .select('id')
    .in('role', ['admin', 'consultant']);

  for (const profile of internals ?? []) {
    await admin.from('notifications').insert({
      user_id: profile.id,
      type: 'approval',
      title: `Nuevo pedido — ${req.reference_code ?? req.title}`,
      message: `${req.requester_name} · ${priority} · Pendiente de tu respuesta`,
      link,
    });
  }
}
