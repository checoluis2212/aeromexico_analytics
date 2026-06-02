type RequestNotification = {
  id: string;
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

function portalUrl(id: string) {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  return `${base}/command-center/pedidos/${id}`;
}

function isTeamsWebhook(url: string) {
  return url.includes('webhook.office.com') || url.includes('logic.azure.com');
}

export async function notifyNewRequest(req: RequestNotification) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL ?? process.env.TEAMS_WEBHOOK_URL;
  if (!webhookUrl) return;

  const priority = PRIORITY_LABELS[req.priority] ?? req.priority;
  const type = TYPE_LABELS[req.type] ?? req.type;
  const area = req.company ?? 'Sin área';
  const link = portalUrl(req.id);

  const body = isTeamsWebhook(webhookUrl)
    ? {
        '@type': 'MessageCard',
        '@context': 'https://schema.org/extensions',
        summary: `Nueva petición: ${req.title}`,
        themeColor: '0078D4',
        title: 'Nueva petición para Sergio Burgos',
        sections: [
          {
            activityTitle: req.title,
            facts: [
              { name: 'Quién', value: `${req.requester_name} (${req.requester_email})` },
              { name: 'Área', value: area },
              { name: 'Tipo', value: type },
              { name: 'Urgencia', value: priority },
            ],
          },
        ],
        potentialAction: [{ '@type': 'OpenUri', name: 'Aceptar o rechazar', targets: [{ os: 'default', uri: link }] }],
      }
    : {
        text: `Nueva petición · ${req.title}`,
        blocks: [
          {
            type: 'header',
            text: { type: 'plain_text', text: 'Nueva petición · Sergio Burgos' },
          },
          {
            type: 'section',
            fields: [
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

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch (err) {
    console.error('Webhook notification failed:', err);
  }
}

export async function notifyInternalOnNewRequest(req: RequestNotification) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return;

  const { createAdminClient } = await import('@/lib/supabase/admin');
  const admin = createAdminClient();
  const priority = PRIORITY_LABELS[req.priority] ?? req.priority;
  const link = portalUrl(req.id);

  const { data: internals } = await admin
    .from('profiles')
    .select('id')
    .in('role', ['admin', 'consultant']);

  for (const profile of internals ?? []) {
    await admin.from('notifications').insert({
      user_id: profile.id,
      type: 'approval',
      title: `Nuevo pedido — ${req.title}`,
      message: `${req.requester_name} · ${priority} · Pendiente de tu respuesta`,
      link,
    });
  }
}
