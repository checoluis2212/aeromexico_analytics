import { NextResponse } from 'next/server';
import { requireCommandCenterAccess } from '@/lib/auth/require-api-session';
import { getNotificationWebhookUrls } from '@/lib/notifications/channels';
import {
  notifyWorkflowStep,
  workflowEnabled,
} from '@/lib/notifications/workflow-notify';

export async function GET() {
  const session = await requireCommandCenterAccess();
  if (session instanceof NextResponse) return session;

  const urls = getNotificationWebhookUrls();
  return NextResponse.json({
    configured: workflowEnabled(),
    slack: Boolean(process.env.SLACK_WEBHOOK_URL?.trim()),
    teams: Boolean(process.env.TEAMS_WEBHOOK_URL?.trim()),
    webhookCount: urls.length,
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  });
}

export async function POST() {
  const session = await requireCommandCenterAccess();
  if (session instanceof NextResponse) return session;

  if (!workflowEnabled()) {
    return NextResponse.json(
      {
        error:
          'No hay webhooks configurados. Añade SLACK_WEBHOOK_URL y/o TEAMS_WEBHOOK_URL en .env.local',
      },
      { status: 400 }
    );
  }

  await notifyWorkflowStep({
    step: 'request_submitted',
    requestId: '00000000-0000-0000-0000-000000000000',
    title: 'Prueba de notificaciones — Aero Analytics',
    reference_code: 'TEST-WEBHOOK',
    requester_name: session.user.email?.split('@')[0] ?? 'Sergio',
    requester_email: session.user.email ?? undefined,
    message:
      'Si ves este mensaje, Slack/Teams está conectado correctamente. Los pedidos reales dispararán notificaciones similares en cada paso automático.',
    facts: {
      Origen: 'Botón de prueba en panel Sergio',
      Entorno: process.env.NEXT_PUBLIC_SITE_URL ?? 'localhost',
    },
    internalLink: true,
  });

  return NextResponse.json({ ok: true, message: 'Mensaje de prueba enviado' });
}
