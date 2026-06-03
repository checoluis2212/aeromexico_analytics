import { NextRequest, NextResponse } from 'next/server';
import { requireInternalAccess } from '@/lib/auth/require-api-session';
import { runAdminAgentTurn } from '@/lib/ai/admin-agent/run-agent';
import { executeAdminPendingAction } from '@/lib/ai/admin-agent/tools';
import {
  isAdminCancel,
  isAdminConfirm,
} from '@/lib/ai/admin-agent/intents';
import type { AdminPendingAction } from '@/lib/ai/admin-agent/types';
import type { ChatTurn } from '@/lib/ai/assistant-agent-skills';
import { validateAdminAgentChatBody } from '@/lib/ai/agent-scope';
import { logAdminAgentChatUsage } from '@/lib/rate-limit/assistant-chat';

const MAX_MESSAGE_LENGTH = 2000;

function parsePendingAction(raw: unknown): AdminPendingAction | null {
  if (!raw || typeof raw !== 'object') return null;
  const a = raw as AdminPendingAction;
  if (
    !a.type ||
    !['accept_request', 'reject_request', 'set_capacity', 'add_comment'].includes(a.type)
  ) {
    return null;
  }
  if (!a.summary || typeof a.summary !== 'string') return null;
  return a;
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireInternalAccess();
    if (session instanceof NextResponse) return session;

    const body = (await request.json()) as Record<string, unknown>;
    const scopeError = validateAdminAgentChatBody(body);
    if (scopeError) {
      return NextResponse.json(
        { error: scopeError.message, scope: 'admin_agent' },
        { status: 400 }
      );
    }

    const message = typeof body.message === 'string' ? body.message.trim() : '';
    const history = (Array.isArray(body.history) ? body.history : []).slice(
      -10
    ) as ChatTurn[];
    const action = body.action as string | undefined;
    const pendingFromClient = parsePendingAction(body.pending_action);

    if (!message && action !== 'confirm_action' && action !== 'cancel_action') {
      return NextResponse.json({ error: 'Mensaje vacío' }, { status: 400 });
    }
    if (message.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        { error: `Máximo ${MAX_MESSAGE_LENGTH} caracteres` },
        { status: 400 }
      );
    }

    const userLabel =
      session.profile?.email?.split('@')[0] ??
      session.user.email?.split('@')[0] ??
      'Sergio';

    if (action === 'cancel_action') {
      return NextResponse.json({
        reply: 'Acción cancelada. ¿Qué más revisamos?',
        pending_action: null,
      });
    }

    if (action === 'confirm_action' && pendingFromClient) {
      const result = await executeAdminPendingAction(
        pendingFromClient,
        session.user.id,
        userLabel
      );
      if (!result.ok) {
        return NextResponse.json({
          reply: `No pude completar la acción: **${result.error}**. Revisa el pedido en la bandeja.`,
          pending_action: null,
        });
      }
      return NextResponse.json({
        reply: result.markdown,
        pending_action: null,
      });
    }

    if (pendingFromClient && message) {
      if (isAdminConfirm(message)) {
        const result = await executeAdminPendingAction(
          pendingFromClient,
          session.user.id,
          userLabel
        );
        if (!result.ok) {
          return NextResponse.json({
            reply: `No pude completar la acción: **${result.error}**.`,
            pending_action: null,
          });
        }
        return NextResponse.json({
          reply: result.markdown,
          pending_action: null,
        });
      }
      if (isAdminCancel(message)) {
        return NextResponse.json({
          reply: 'De acuerdo, no aplico ese cambio. ¿Seguimos con otra cosa?',
          pending_action: null,
        });
      }
    }

    const result = await runAdminAgentTurn({ message, history });
    await logAdminAgentChatUsage(session.user.id);
    return NextResponse.json({
      reply: result.reply,
      pending_action: result.pending_action ?? null,
      tool_used: result.tool_used ?? null,
      scope: 'admin_agent',
    });
  } catch (err) {
    console.error('[admin-agent/chat]', err);
    return NextResponse.json({ error: 'Error procesando el chat' }, { status: 500 });
  }
}
