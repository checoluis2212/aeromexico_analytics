/** Envío a Slack y/o Teams — pueden configurarse ambos a la vez */

export function isTeamsWebhook(url: string): boolean {
  return (
    url.includes('webhook.office.com') ||
    url.includes('office.com') ||
    url.includes('logic.azure.com') ||
    url.includes('azure.com')
  );
}

export function getNotificationWebhookUrls(): string[] {
  const urls: string[] = [];
  const slack = process.env.SLACK_WEBHOOK_URL?.trim();
  const teams = process.env.TEAMS_WEBHOOK_URL?.trim();
  if (slack) urls.push(slack);
  if (teams && teams !== slack) urls.push(teams);
  return urls;
}

export async function postToNotificationChannels(body: unknown): Promise<void> {
  const urls = getNotificationWebhookUrls();
  if (urls.length === 0) return;

  await Promise.all(
    urls.map(async (url) => {
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          console.error(`Webhook ${url.slice(0, 40)}… responded ${res.status}`);
        }
      } catch (err) {
        console.error('Notification webhook failed:', err);
      }
    })
  );
}

export function portalPedidoUrl(id: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  return `${base}/command-center/pedidos/${id}`;
}

export function portalMisPedidosUrl(id: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  return `${base}/mis-pedidos/${id}`;
}
