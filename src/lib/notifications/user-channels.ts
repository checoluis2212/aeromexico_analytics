import { createAdminClient } from '@/lib/supabase/admin';
import { isTeamsWebhook } from '@/lib/notifications/channels';

export type ClientNotifyEvent = 'submitted' | 'accepted' | 'status_change' | 'comment';

export type UserNotificationSettings = {
  user_id: string;
  slack_webhook_url: string | null;
  teams_webhook_url: string | null;
  enabled: boolean;
  notify_submitted: boolean;
  notify_accepted: boolean;
  notify_status_change: boolean;
  notify_comment: boolean;
};

export function isValidSlackWebhook(url: string): boolean {
  return /^https:\/\/hooks\.slack\.com\/services\/.+/.test(url.trim());
}

export function isValidTeamsWebhookUrl(url: string): boolean {
  const t = url.trim();
  return isTeamsWebhook(t) && t.startsWith('https://');
}

export function webhookHint(url: string | null | undefined): string | null {
  if (!url?.trim()) return null;
  const t = url.trim();
  return t.length <= 8 ? '••••' : `••••${t.slice(-6)}`;
}

export async function loadUserNotificationSettings(
  userId: string
): Promise<UserNotificationSettings | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from('user_notification_settings')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  return data as UserNotificationSettings | null;
}

function eventAllowed(settings: UserNotificationSettings, event: ClientNotifyEvent): boolean {
  if (!settings.enabled) return false;
  switch (event) {
    case 'submitted':
      return settings.notify_submitted;
    case 'accepted':
      return settings.notify_accepted;
    case 'status_change':
      return settings.notify_status_change;
    case 'comment':
      return settings.notify_comment;
    default:
      return false;
  }
}

function getClientWebhookUrls(settings: UserNotificationSettings): string[] {
  const urls: string[] = [];
  const slack = settings.slack_webhook_url?.trim();
  const teams = settings.teams_webhook_url?.trim();
  if (slack) urls.push(slack);
  if (teams && teams !== slack) urls.push(teams);
  return urls;
}

export async function notifyClientExternalChannels(opts: {
  userId: string | null | undefined;
  event: ClientNotifyEvent;
  title: string;
  message: string;
  link: string;
}): Promise<void> {
  if (!opts.userId) return;

  const settings = await loadUserNotificationSettings(opts.userId);
  if (!settings || !eventAllowed(settings, opts.event)) return;

  const urls = getClientWebhookUrls(settings);
  if (urls.length === 0) return;

  await Promise.all(
    urls.map(async (url) => {
      const body = isTeamsWebhook(url)
        ? {
            '@type': 'MessageCard',
            '@context': 'https://schema.org/extensions',
            summary: opts.title,
            themeColor: '008272',
            title: opts.title,
            text: opts.message,
            potentialAction: [
              {
                '@type': 'OpenUri',
                name: 'Ver en Mis pedidos',
                targets: [{ os: 'default', uri: opts.link }],
              },
            ],
          }
        : {
            text: `*${opts.title}*\n${opts.message}\n<${opts.link}|Ver en Mis pedidos>`,
          };

      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          console.error(`Client webhook responded ${res.status} for user ${opts.userId}`);
        }
      } catch (err) {
        console.error('Client notification webhook failed:', err);
      }
    })
  );
}

export async function sendClientWebhookTest(
  settings: Pick<UserNotificationSettings, 'slack_webhook_url' | 'teams_webhook_url'>
): Promise<{ sent: number; errors: string[] }> {
  const urls: string[] = [];
  const slack = settings.slack_webhook_url?.trim();
  const teams = settings.teams_webhook_url?.trim();
  if (slack) urls.push(slack);
  if (teams && teams !== slack) urls.push(teams);

  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const title = 'Prueba · Notificaciones Aero Analytics';
  const message =
    'Si ves esto, tu canal está conectado. Recibirás avisos de tus pedidos según las preferencias que elijas.';
  const link = `${base}/mis-pedidos`;

  const errors: string[] = [];
  let sent = 0;

  await Promise.all(
    urls.map(async (url) => {
      const body = isTeamsWebhook(url)
        ? {
            '@type': 'MessageCard',
            summary: title,
            title,
            text: message,
            potentialAction: [
              { '@type': 'OpenUri', name: 'Mis pedidos', targets: [{ os: 'default', uri: link }] },
            ],
          }
        : { text: `*${title}*\n${message}\n<${link}|Mis pedidos>` };

      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (res.ok) sent += 1;
        else errors.push(`HTTP ${res.status}`);
      } catch {
        errors.push('Error de conexión');
      }
    })
  );

  return { sent, errors };
}
