import { createAdminClient } from '@/lib/supabase/admin';
import { mapDeliveryStatusForUser } from '@/lib/integrations/external-sync';
import {
  isTeamsWebhook,
  getNotificationWebhookUrls,
} from '@/lib/notifications/channels';
import {
  notifyClientExternalChannels,
  type ClientNotifyEvent,
} from '@/lib/notifications/user-channels';

export type { ClientNotifyEvent };

export async function notifyRequestUpdate(opts: {
  requestId: string;
  requesterEmail: string;
  requesterUserId?: string | null;
  title: string;
  message: string;
  link: string;
  clientEvent?: ClientNotifyEvent;
}) {
  const admin = createAdminClient();

  let userId = opts.requesterUserId;
  if (!userId) {
    const { data: profile } = await admin
      .from('profiles')
      .select('id')
      .eq('email', opts.requesterEmail)
      .maybeSingle();
    userId = profile?.id ?? null;
  }

  if (userId) {
    await admin.from('notifications').insert({
      user_id: userId,
      type: 'request',
      title: opts.title,
      message: opts.message,
      link: opts.link,
    });
  }

  if (opts.clientEvent && userId) {
    await notifyClientExternalChannels({
      userId,
      event: opts.clientEvent,
      title: opts.title,
      message: opts.message,
      link: opts.link,
    });
  }

  const urls = getNotificationWebhookUrls();
  if (urls.length === 0) return;

  await Promise.all(
    urls.map(async (url) => {
      const body = isTeamsWebhook(url)
        ? {
            '@type': 'MessageCard',
            summary: opts.title,
            title: opts.title,
            text: opts.message,
            potentialAction: [
              {
                '@type': 'OpenUri',
                name: 'Ver pedido',
                targets: [{ os: 'default', uri: opts.link }],
              },
            ],
          }
        : { text: `*${opts.title}*\n${opts.message}\n<${opts.link}|Ver pedido>` };

      try {
        await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      } catch (e) {
        console.error('Notification webhook failed:', e);
      }
    })
  );
}

export function statusChangeMessage(
  title: string,
  oldStatus: string,
  newStatus: string
): { title: string; message: string } {
  const from = mapDeliveryStatusForUser(oldStatus);
  const to = mapDeliveryStatusForUser(newStatus);
  return {
    title: `Actualización: ${title}`,
    message: `Estado cambió de "${from}" a "${to}".`,
  };
}
