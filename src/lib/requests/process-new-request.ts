import { createAdminClient } from '@/lib/supabase/admin';
import { triageNewRequest } from '@/lib/ai/request-intake-agent';
import { getSergioAvailability } from '@/lib/availability';
import { notifyRequestUpdate } from '@/lib/notifications/request-notify';
import { acceptanceMessage } from '@/lib/notifications/acceptance-notify';
import { notifyInternalOnNewRequest, notifyNewRequest } from '@/lib/notify-request';
import { notifyWorkflowStep } from '@/lib/notifications/workflow-notify';
import {
  postSlackEscalationQuestion,
  slackInteractiveEnabled,
} from '@/lib/notifications/slack-interactive';
import { siteConfig, requestTypeLabels, priorityLabels } from '@/lib/constants';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

type InsertedRequest = {
  id: string;
  reference_code?: string | null;
  title: string;
  type: string;
  priority: string;
  requester_name: string;
  requester_email: string;
  company: string | null;
  description?: string | null;
  user_id?: string | null;
};

async function findSergioUserId(admin: ReturnType<typeof createAdminClient>): Promise<string | null> {
  const allowlist =
    process.env.SERGIO_ADMIN_EMAILS?.split(',').map((e) => e.trim().toLowerCase()) ?? [];
  const emails = [siteConfig.email.toLowerCase(), ...allowlist].filter(Boolean);

  if (emails.length === 0) return null;

  const { data } = await admin
    .from('profiles')
    .select('id, email, role, acc_role')
    .in('email', emails)
    .limit(1)
    .maybeSingle();

  if (data?.id) return data.id;

  const { data: adminProfile } = await admin
    .from('profiles')
    .select('id')
    .in('role', ['admin', 'consultant'])
    .limit(1)
    .maybeSingle();

  return adminProfile?.id ?? null;
}

export type ProcessNewRequestResult = {
  intake: Awaited<ReturnType<typeof triageNewRequest>>;
  auto_accepted: boolean;
};

export async function processNewRequest(
  inserted: InsertedRequest,
  opts?: { skipAutoAccept?: boolean; source?: 'form' | 'chat_assistant' }
): Promise<ProcessNewRequestResult> {
  const admin = createAdminClient();
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const link = `${base}/mis-pedidos/${inserted.id}`;
  const sergioLink = `${base}/command-center/pedidos/${inserted.id}`;
  const source = opts?.source ?? 'form';

  const availability = await getSergioAvailability();

  const { data: allOpen } = await admin
    .from('requests')
    .select('id, priority, type, sergio_decision, delivery_status')
    .neq('id', inserted.id);

  const openRequests = (allOpen ?? []).filter(
    (r) =>
      r.sergio_decision !== 'rejected' &&
      !['done', 'cancelled', 'completed'].includes(r.delivery_status ?? '')
  );

  await notifyNewRequest(inserted);
  await notifyInternalOnNewRequest(inserted);

  await notifyWorkflowStep({
    step: source === 'chat_assistant' ? 'chat_request_created' : 'request_submitted',
    requestId: inserted.id,
    reference_code: inserted.reference_code,
    title: inserted.title,
    requester_name: inserted.requester_name,
    requester_email: inserted.requester_email,
    message:
      source === 'chat_assistant'
        ? `Pedido confirmado desde **Pregúntale** (copiloto IA). El cliente usó el flujo de borrador en el chat. El agente inicia triaje y respuesta automática.`
        : 'Pedido registrado. El agente inicia triaje y respuesta automática.',
    facts: {
      Tipo: requestTypeLabels[inserted.type] ?? inserted.type,
      Urgencia: priorityLabels[inserted.priority] ?? inserted.priority,
      Área: inserted.company ?? 'Sin área',
    },
    internalLink: true,
  });

  const intake = await triageNewRequest({
    request: inserted,
    openRequests,
    capacity: availability.capacity,
    skipAutoAccept: opts?.skipAutoAccept,
  });

  await admin
    .from('requests')
    .update({
      ai_capacity_advice: intake.advice,
      ai_intake: {
        decision: intake.decision,
        auto_accept: intake.auto_accept,
        ack_message: intake.ack_message,
        processed_at: new Date().toISOString(),
        reason: intake.reason,
      },
    })
    .eq('id', inserted.id);

  await notifyWorkflowStep({
    step: 'agent_triaged',
    requestId: inserted.id,
    reference_code: inserted.reference_code,
    title: inserted.title,
    requester_name: inserted.requester_name,
    message: intake.auto_accept
      ? `Triaje: criterios de auto-aceptación cumplidos. Confianza ${intake.confidence}.`
      : `Triaje: requiere revisión de Sergio. ${intake.advice.summary}`,
    facts: {
      Decisión: intake.decision === 'auto_accept' ? 'Auto-aceptar' : 'Escalar a Sergio',
      Capacidad: availability.capacity,
      Recomendación: intake.advice.recommendation,
    },
    internalLink: true,
  });

  await notifyRequestUpdate({
    requestId: inserted.id,
    requesterEmail: inserted.requester_email,
    requesterUserId: inserted.user_id ?? null,
    title: inserted.reference_code
      ? `Recibimos tu pedido ${inserted.reference_code}`
      : `Recibimos tu pedido: ${inserted.title}`,
    message: `${intake.ack_message}${inserted.reference_code ? ` Tu ID de seguimiento: ${inserted.reference_code}.` : ''}`,
    link,
    clientEvent: 'submitted',
  });

  await notifyWorkflowStep({
    step: 'agent_acknowledged',
    requestId: inserted.id,
    reference_code: inserted.reference_code,
    title: inserted.title,
    requester_name: inserted.requester_name,
    message: `Respuesta automática enviada al solicitante: "${intake.ack_message.slice(0, 200)}${intake.ack_message.length > 200 ? '…' : ''}"`,
    internalLink: true,
  });

  await admin.from('request_comments').insert({
    request_id: inserted.id,
    user_id: null,
    author_name: 'Asistente de Sergio',
    content: intake.ack_message,
    is_internal: false,
  });

  let auto_accepted = false;

  if (intake.auto_accept) {
    const sergioUserId = await findSergioUserId(admin);
    const dueDate = intake.advice.suggested_due_date;
    const agentNote =
      'Confirmado automáticamente por el asistente según capacidad y prioridad. Sergio puede ajustar la fecha.';

    const { error: updateError } = await admin
      .from('requests')
      .update({
        sergio_decision: 'accepted',
        committed_due_date: dueDate,
        sergio_notes: agentNote,
        sergio_decided_at: new Date().toISOString(),
        sergio_decided_by: sergioUserId,
        status: 'in_review',
        agent_handled: true,
        ai_intake: {
          decision: intake.decision,
          auto_accept: true,
          ack_message: intake.ack_message,
          processed_at: new Date().toISOString(),
          reason: intake.reason,
        },
      })
      .eq('id', inserted.id);

    if (!updateError) {
      auto_accepted = true;
      const dateLabel = format(new Date(dueDate), "d 'de' MMMM yyyy", { locale: es });

      await admin.from('request_comments').insert({
        request_id: inserted.id,
        user_id: sergioUserId,
        author_name: 'Asistente de Sergio',
        content: `Pedido aceptado automáticamente. Fecha orientativa: ${dateLabel}. ${agentNote}`,
        is_internal: false,
      });

      const { title, message } = acceptanceMessage(
        inserted.title,
        'accepted',
        dueDate,
        agentNote
      );

      await notifyRequestUpdate({
        requestId: inserted.id,
        requesterEmail: inserted.requester_email,
        requesterUserId: inserted.user_id ?? null,
        title,
        message,
        link,
        clientEvent: 'accepted',
      });

      await notifyWorkflowStep({
        step: 'agent_auto_accepted',
        requestId: inserted.id,
        reference_code: inserted.reference_code,
        title: inserted.title,
        requester_name: inserted.requester_name,
        message: `Pedido aceptado automáticamente. Fecha orientativa: ${dateLabel}.`,
        facts: {
          'Fecha orientativa': dateLabel,
          Nota: agentNote,
        },
        internalLink: true,
      });

      await admin.from('activity_logs').insert({
        user_id: sergioUserId,
        action: 'agent_auto_accept',
        entity_type: 'request',
        entity_id: inserted.id,
        metadata: { dueDate, advice: intake.advice.recommendation },
      });
    }
  } else {
    const { data: internals } = await admin
      .from('profiles')
      .select('id')
      .in('role', ['admin', 'consultant']);

    for (const profile of internals ?? []) {
      await admin.from('notifications').insert({
        user_id: profile.id,
        type: 'approval',
        title: `Agente → Sergio: ${inserted.title}`,
        message: intake.sergio_message,
        link: sergioLink,
      });
    }

    await notifyWorkflowStep({
      step: 'agent_escalated',
      requestId: inserted.id,
      reference_code: inserted.reference_code,
      title: inserted.title,
      requester_name: inserted.requester_name,
      message: intake.sergio_message,
      facts: {
        Motivo: intake.reason.slice(0, 3).join(' ') || 'Revisión manual',
      },
      internalLink: true,
    });

    if (slackInteractiveEnabled()) {
      await postSlackEscalationQuestion({
        requestId: inserted.id,
        reference_code: inserted.reference_code,
        title: inserted.title,
        requester_name: inserted.requester_name,
        requester_email: inserted.requester_email,
        type: inserted.type,
        priority: inserted.priority,
        company: inserted.company,
        description: inserted.description,
        sergio_message: intake.sergio_message,
        reasons: intake.reason,
        advice: intake.advice,
      });
    }
  }

  return { intake, auto_accepted };
}
