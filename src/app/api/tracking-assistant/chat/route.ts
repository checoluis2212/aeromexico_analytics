import { NextRequest, NextResponse } from 'next/server';
import { requireApiSession } from '@/lib/auth/require-api-session';
import {
  buildTrackingAssistantContext,
  generateTrackingFallbackReply,
  getOffTopicReply,
  isOffTopicForGa4Assistant,
} from '@/lib/ai/tracking-assistant-context';
import { formatSiteGuideReply, isSiteGuideQuestion } from '@/lib/ai/site-guide';
import {
  isRequestConfirmation,
  isRequestCancellation,
  isExplicitRequestStart,
  isNewRequestIntent,
  isNewRequestFlowConfirm,
  isNewRequestFlowDecline,
  lastAssistantOfferedNewRequestConfirm,
  formatNewRequestConfirmPrompt,
  formatNewRequestAcceptedReply,
  formatNewRequestDeclinedReply,
  extractRequestDraft,
  formatDraftSummary,
  formatRequestCreatedReply,
  formatRequestStartPrompt,
  formatRequestCancelledReply,
  formatInsufficientContextReply,
  hasEnoughContextForDraft,
  isValidDraft,
  type AssistantRequestDraft,
  type RequestChatAction,
} from '@/lib/ai/assistant-request-flow';
import { getSergioGuidedFallbackReply } from '@/lib/ai/guided-request-coach';
import {
  generateConsultorFallbackReply,
  invokeSergioAnalyticsLLM,
} from '@/lib/ai/consultor-reply';
import { createAuthenticatedRequest } from '@/lib/requests/create-request';
import { buildConsultantLearningContext } from '@/lib/ai/analytics-learning-skills';
import { buildClientLearningContext } from '@/lib/ai/client-learning-context';
import type { AssistantMode } from '@/lib/ai/assistant-modes';
import {
  logConsultorChatUsage,
  logAssistantChatUsage,
} from '@/lib/rate-limit/assistant-chat';
import { buildOrchestratorContextForChat } from '@/lib/ai/orchestrator-skills-server';
import {
  formatUserOrdersReply,
  loadUserOrdersForAssistant,
  wantsUserOrdersQuery,
} from '@/lib/ai/request-assistant-context';
import { validateClientAgentChatBody } from '@/lib/ai/agent-scope';

const AI_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
const MAX_MESSAGE_LENGTH = 2000;

function isConsultorRateLimited(mode: AssistantMode, guidedOrder: boolean) {
  return mode === 'consultor' && !guidedOrder;
}

async function logConsultorIfNeeded(
  userId: string,
  mode: AssistantMode,
  guidedOrder: boolean
) {
  if (isConsultorRateLimited(mode, guidedOrder)) {
    await logConsultorChatUsage(userId);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireApiSession();
    if (session instanceof NextResponse) return session;

    const body = (await request.json()) as Record<string, unknown>;
    const scopeError = validateClientAgentChatBody(body);
    if (scopeError) {
      return NextResponse.json(
        { error: scopeError.message, scope: 'client_agent' },
        { status: 400 }
      );
    }

    const message = typeof body.message === 'string' ? body.message.trim() : '';
    const history = Array.isArray(body.history) ? body.history.slice(-10) : [];
    const action = body.action as RequestChatAction | undefined;
    const clientDraft = body.draft as AssistantRequestDraft | undefined;
    const scenarioId =
      typeof body.scenarioId === 'string' ? body.scenarioId : undefined;

    if (!message && !action) {
      return NextResponse.json({ error: 'Mensaje vacío' }, { status: 400 });
    }
    if (message.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        { error: `Máximo ${MAX_MESSAGE_LENGTH} caracteres` },
        { status: 400 }
      );
    }

    const guidedOrder = body.guidedOrder === true;
    const assistantMode: AssistantMode =
      body.assistantMode === 'solicitud' ? 'solicitud' : 'consultor';

    if (guidedOrder && message && !action) {
      try {
        const res = await fetch(`${AI_URL}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message,
            module: 'guided_request',
            context: message,
            history,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          return NextResponse.json({ reply: data.reply });
        }
      } catch {
        // fallback below
      }
      return NextResponse.json({
        reply: getSergioGuidedFallbackReply(message),
      });
    }

    if (isOffTopicForGa4Assistant(message, history)) {
      await logConsultorIfNeeded(session.user.id, assistantMode, guidedOrder);
      return NextResponse.json({
        reply: getOffTopicReply(),
      });
    }

    if (action === 'cancel_request' || (message && isRequestCancellation(message))) {
      await logConsultorIfNeeded(session.user.id, assistantMode, guidedOrder);
      return NextResponse.json({
        reply: formatRequestCancelledReply(),
      });
    }

    if (action === 'confirm_request' && clientDraft?.title) {
      if (!isValidDraft(clientDraft)) {
        return NextResponse.json({
          reply: formatInsufficientContextReply(),
        });
      }
      try {
        const created = await createAuthenticatedRequest(
          {
            title: clientDraft.title,
            type: clientDraft.type,
            priority: clientDraft.priority,
            description: clientDraft.description,
            company: clientDraft.company,
            source: 'chat_assistant',
          },
          session.user.id
        );
        await logAssistantChatUsage(session.user.id, 'request_created');
        return NextResponse.json({
          reply: formatRequestCreatedReply(created),
          request_created: {
            id: created.id,
            reference_code: created.reference_code,
            auto_accepted: created.auto_accepted,
          },
        });
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : 'No se pudo crear el pedido';
        return NextResponse.json({
          reply: `## No pude enviar el pedido\n\n${errMsg}. Puedes completarlo en [Pedir trabajo](/pedir).`,
        });
      }
    }

    if (action === 'start_request' || (assistantMode === 'solicitud' && isExplicitRequestStart(message))) {
      if (!hasEnoughContextForDraft(message, history, scenarioId)) {
        return NextResponse.json({
          reply: action === 'start_request' ? formatRequestStartPrompt() : formatInsufficientContextReply(),
        });
      }

      const draft = extractRequestDraft(message, history, scenarioId);
      if (!draft || !isValidDraft(draft)) {
        return NextResponse.json({
          reply: formatInsufficientContextReply(),
        });
      }

      await logAssistantChatUsage(session.user.id, 'request_draft');

      return NextResponse.json({
        reply: formatDraftSummary(draft),
        request_draft: draft,
      });
    }

    if (message && isRequestConfirmation(message, history)) {
      try {
        const draft = extractRequestDraft(message, history, scenarioId);
        if (!draft || !isValidDraft(draft)) {
          return NextResponse.json({
            reply: formatInsufficientContextReply(),
          });
        }
        const created = await createAuthenticatedRequest(
          {
            title: draft.title,
            type: draft.type,
            priority: draft.priority,
            description: draft.description,
            company: draft.company,
            source: 'chat_assistant',
          },
          session.user.id
        );
        await logAssistantChatUsage(session.user.id, 'request_created');
        return NextResponse.json({
          reply: formatRequestCreatedReply(created),
          request_created: {
            id: created.id,
            reference_code: created.reference_code,
            auto_accepted: created.auto_accepted,
          },
        });
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : 'No se pudo crear el pedido';
        return NextResponse.json({
          reply: `## No pude enviar el pedido\n\n${errMsg}. Puedes completarlo en [Pedir trabajo](/pedir).`,
        });
      }
    }

    if (isSiteGuideQuestion(message) && assistantMode !== 'consultor') {
      await logConsultorIfNeeded(session.user.id, assistantMode, guidedOrder);
      return NextResponse.json({
        reply: formatSiteGuideReply(message, history),
      });
    }

    const requestId =
      typeof body.requestId === 'string' ? body.requestId : undefined;

    const clientContext = await buildClientLearningContext(
      session.user.id,
      message,
      history
    );

    const contextOpts = {
      scenarioId,
      requestId,
      userId: session.user.id,
      userEmail: session.user.email ?? undefined,
      history,
      clientContext,
    };

    const { context, events } = await buildTrackingAssistantContext(message, contextOpts);

    const learningContext = buildConsultantLearningContext(message, {
      clientContext,
      history,
    });
    const orchestratorBlock = await buildOrchestratorContextForChat(message);
    const fullContext =
      assistantMode === 'consultor'
        ? `${orchestratorBlock}\n\n---\n\n${learningContext}\n\n---\n\n${context}`
        : `${orchestratorBlock}\n\n---\n\n${context}`;

    if (assistantMode === 'consultor' && message) {
      const userEmail = session.user.email;
      if (userEmail && wantsUserOrdersQuery(message)) {
        const orders = await loadUserOrdersForAssistant(session.user.id, userEmail);
        await logConsultorIfNeeded(session.user.id, assistantMode, guidedOrder);
        return NextResponse.json({ reply: formatUserOrdersReply(orders) });
      }

      if (lastAssistantOfferedNewRequestConfirm(history)) {
        if (isNewRequestFlowConfirm(message)) {
          await logConsultorIfNeeded(session.user.id, assistantMode, guidedOrder);
          return NextResponse.json({
            reply: formatNewRequestAcceptedReply(),
            start_guided_request: true,
          });
        }
        if (isNewRequestFlowDecline(message)) {
          await logConsultorIfNeeded(session.user.id, assistantMode, guidedOrder);
          return NextResponse.json({ reply: formatNewRequestDeclinedReply() });
        }
      }

      if (isNewRequestIntent(message) && !lastAssistantOfferedNewRequestConfirm(history)) {
        await logConsultorIfNeeded(session.user.id, assistantMode, guidedOrder);
        return NextResponse.json({ reply: formatNewRequestConfirmPrompt() });
      }

      const llmReply = await invokeSergioAnalyticsLLM({
        message,
        context: fullContext,
        history,
      });
      await logConsultorIfNeeded(session.user.id, assistantMode, guidedOrder);
      return NextResponse.json({
        reply:
          llmReply ??
          generateConsultorFallbackReply(message, { scenarioId, history }),
      });
    }

    try {
      const res = await fetch(`${AI_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          module: 'tracking_assistant',
          context: fullContext,
          history,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        await logConsultorIfNeeded(session.user.id, assistantMode, guidedOrder);
        return NextResponse.json({
          reply: data.reply,
        });
      }
    } catch {
      // fallback below
    }

    const trackingLlm = await invokeSergioAnalyticsLLM({
      message,
      context: fullContext,
      history,
    });
    if (trackingLlm) {
      await logConsultorIfNeeded(session.user.id, assistantMode, guidedOrder);
      return NextResponse.json({ reply: trackingLlm });
    }

    const reply = await generateTrackingFallbackReply(message, fullContext, events, {
      requestId,
      userId: session.user.id,
      userEmail: session.user.email ?? undefined,
    });

    await logConsultorIfNeeded(session.user.id, assistantMode, guidedOrder);
    return NextResponse.json({ reply });
  } catch (err) {
    console.error('[tracking-assistant/chat]', err);
    return NextResponse.json({ error: 'Error processing chat' }, { status: 500 });
  }
}

export async function GET() {
  const session = await requireApiSession();
  if (session instanceof NextResponse) return session;

  return NextResponse.json({
    limit: null,
    scope: 'consultor',
    unlimited: true,
  });
}
