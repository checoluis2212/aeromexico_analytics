import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  slackInteractiveEnabled,
  updateSlackInteractionMessage,
  verifySlackSignature,
} from '@/lib/notifications/slack-interactive';
import { applyRequestDecision } from '@/lib/requests/apply-request-decision';
import { siteConfig } from '@/lib/constants';

export const runtime = 'nodejs';

async function findSergioUserId(): Promise<string | null> {
  const admin = createAdminClient();
  const emails =
    process.env.SERGIO_ADMIN_EMAILS?.split(',').map((e) => e.trim().toLowerCase()) ?? [];
  const list = [siteConfig.email.toLowerCase(), ...emails].filter(Boolean);
  if (list.length === 0) return null;

  const { data } = await admin
    .from('profiles')
    .select('id')
    .in('email', list)
    .limit(1)
    .maybeSingle();

  return data?.id ?? null;
}

export async function POST(request: NextRequest) {
  if (!slackInteractiveEnabled()) {
    return NextResponse.json({ error: 'Slack interactivo no configurado' }, { status: 503 });
  }

  const rawBody = await request.text();
  const signingSecret = process.env.SLACK_SIGNING_SECRET!.trim();

  if (
    !verifySlackSignature(
      signingSecret,
      request.headers.get('x-slack-signature'),
      request.headers.get('x-slack-request-timestamp'),
      rawBody
    )
  ) {
    return NextResponse.json({ error: 'Firma inválida' }, { status: 401 });
  }

  const payload = JSON.parse(rawBody) as {
    type: string;
    challenge?: string;
    user?: { name?: string; username?: string };
    actions?: { action_id: string; value: string }[];
    response_url?: string;
  };

  if (payload.type === 'url_verification' && payload.challenge) {
    return NextResponse.json({ challenge: payload.challenge });
  }

  if (payload.type !== 'block_actions' || !payload.actions?.length) {
    return new NextResponse('', { status: 200 });
  }

  const action = payload.actions[0];
  const requestId = action.value;
  const responseUrl = payload.response_url;
  const actor = payload.user?.name ?? payload.user?.username ?? 'Sergio (Slack)';

  if (action.action_id === 'req_open_panel') {
    return new NextResponse('', { status: 200 });
  }

  const sergioUserId = await findSergioUserId();

  if (action.action_id === 'req_accept') {
    const result = await applyRequestDecision({
      requestId,
      decision: 'accepted',
      sergio_notes: 'Aceptado desde Slack.',
      decidedByUserId: sergioUserId,
      decidedByLabel: actor,
      source: 'slack',
    });

    if (responseUrl) {
      await updateSlackInteractionMessage(
        responseUrl,
        result.ok
          ? `✅ *Aceptado* por ${actor}. El cliente fue notificado.`
          : `⚠️ No se pudo aceptar: ${result.error}`
      );
    }

    return new NextResponse('', { status: 200 });
  }

  if (action.action_id === 'req_reject') {
    const result = await applyRequestDecision({
      requestId,
      decision: 'rejected',
      sergio_notes: 'Rechazado desde Slack.',
      decidedByUserId: sergioUserId,
      decidedByLabel: actor,
      source: 'slack',
    });

    if (responseUrl) {
      await updateSlackInteractionMessage(
        responseUrl,
        result.ok
          ? `❌ *Rechazado* por ${actor}. El cliente fue notificado.`
          : `⚠️ No se pudo rechazar: ${result.error}`
      );
    }

    return new NextResponse('', { status: 200 });
  }

  return new NextResponse('', { status: 200 });
}
