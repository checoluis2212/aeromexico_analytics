import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireApiSession } from '@/lib/auth/require-api-session';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  isValidSlackWebhook,
  isValidTeamsWebhookUrl,
  loadUserNotificationSettings,
  sendClientWebhookTest,
  webhookHint,
} from '@/lib/notifications/user-channels';

const updateSchema = z.object({
  enabled: z.boolean().optional(),
  slack_webhook_url: z.string().nullable().optional(),
  teams_webhook_url: z.string().nullable().optional(),
  notify_submitted: z.boolean().optional(),
  notify_accepted: z.boolean().optional(),
  notify_status_change: z.boolean().optional(),
  notify_comment: z.boolean().optional(),
});

function toPublicSettings(row: Awaited<ReturnType<typeof loadUserNotificationSettings>>) {
  if (!row) {
    return {
      enabled: false,
      slackConfigured: false,
      teamsConfigured: false,
      slackHint: null as string | null,
      teamsHint: null as string | null,
      notify_submitted: true,
      notify_accepted: true,
      notify_status_change: true,
      notify_comment: true,
    };
  }

  return {
    enabled: row.enabled,
    slackConfigured: Boolean(row.slack_webhook_url?.trim()),
    teamsConfigured: Boolean(row.teams_webhook_url?.trim()),
    slackHint: webhookHint(row.slack_webhook_url),
    teamsHint: webhookHint(row.teams_webhook_url),
    notify_submitted: row.notify_submitted,
    notify_accepted: row.notify_accepted,
    notify_status_change: row.notify_status_change,
    notify_comment: row.notify_comment,
  };
}

export async function GET() {
  const session = await requireApiSession();
  if (session instanceof NextResponse) return session;

  const row = await loadUserNotificationSettings(session.user.id);
  return NextResponse.json(toPublicSettings(row));
}

export async function PUT(request: NextRequest) {
  const session = await requireApiSession();
  if (session instanceof NextResponse) return session;

  const body = updateSchema.parse(await request.json());
  const admin = createAdminClient();
  const existing = await loadUserNotificationSettings(session.user.id);

  let slackUrl = existing?.slack_webhook_url ?? null;
  let teamsUrl = existing?.teams_webhook_url ?? null;

  if (body.slack_webhook_url !== undefined) {
    if (body.slack_webhook_url === null || body.slack_webhook_url.trim() === '') {
      slackUrl = null;
    } else {
      const trimmed = body.slack_webhook_url.trim();
      if (!isValidSlackWebhook(trimmed)) {
        return NextResponse.json(
          { error: 'URL de Slack inválida. Debe empezar con https://hooks.slack.com/services/' },
          { status: 400 }
        );
      }
      slackUrl = trimmed;
    }
  }

  if (body.teams_webhook_url !== undefined) {
    if (body.teams_webhook_url === null || body.teams_webhook_url.trim() === '') {
      teamsUrl = null;
    } else {
      const trimmed = body.teams_webhook_url.trim();
      if (!isValidTeamsWebhookUrl(trimmed)) {
        return NextResponse.json(
          { error: 'URL de Teams inválida. Usa el webhook entrante de Microsoft Teams.' },
          { status: 400 }
        );
      }
      teamsUrl = trimmed;
    }
  }

  const hasWebhook = Boolean(slackUrl?.trim() || teamsUrl?.trim());
  const enabled =
    body.enabled !== undefined ? body.enabled && hasWebhook : (existing?.enabled ?? false) && hasWebhook;

  const row = {
    user_id: session.user.id,
    slack_webhook_url: slackUrl,
    teams_webhook_url: teamsUrl,
    enabled: hasWebhook ? enabled : false,
    notify_submitted: body.notify_submitted ?? existing?.notify_submitted ?? true,
    notify_accepted: body.notify_accepted ?? existing?.notify_accepted ?? true,
    notify_status_change: body.notify_status_change ?? existing?.notify_status_change ?? true,
    notify_comment: body.notify_comment ?? existing?.notify_comment ?? true,
  };

  const { error } = await admin.from('user_notification_settings').upsert(row, {
    onConflict: 'user_id',
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const saved = await loadUserNotificationSettings(session.user.id);
  return NextResponse.json(toPublicSettings(saved));
}

export async function POST() {
  const session = await requireApiSession();
  if (session instanceof NextResponse) return session;

  const existing = await loadUserNotificationSettings(session.user.id);
  if (!existing?.slack_webhook_url?.trim() && !existing?.teams_webhook_url?.trim()) {
    return NextResponse.json(
      { error: 'Guarda al menos un webhook de Slack o Teams antes de probar.' },
      { status: 400 }
    );
  }

  const { sent, errors } = await sendClientWebhookTest(existing);
  if (sent === 0) {
    return NextResponse.json(
      { error: errors[0] ?? 'No se pudo enviar el mensaje de prueba.' },
      { status: 502 }
    );
  }

  return NextResponse.json({
    ok: true,
    sent,
    message: 'Mensaje de prueba enviado. Revisa Slack y/o Teams.',
  });
}
