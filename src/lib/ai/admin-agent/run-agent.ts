import type { ChatTurn } from '@/lib/ai/assistant-agent-skills';
import { buildAdminAgentBaseContext, appendToolResult } from '@/lib/ai/admin-agent/context';
import { buildAdminAgentSystemPrompt } from '@/lib/ai/admin-agent/prompt';
import { detectAdminIntent, type AdminReadIntent } from '@/lib/ai/admin-agent/intents';
import {
  getRequestDetailForAdmin,
  getSemaphoreForAdmin,
  listEventsForAdmin,
  listInProgressRequestsForAdmin,
  listRecentRequestersForAdmin,
  listRequestsForAdmin,
} from '@/lib/ai/admin-agent/tools';
import type { AdminPendingAction } from '@/lib/ai/admin-agent/types';
import { isWeakLlmFallback } from '@/lib/ai/sergio-analytics-prompt';

async function callAdminOpenAI(input: {
  message: string;
  context: string;
  history?: ChatTurn[];
}): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const system = buildAdminAgentSystemPrompt(input.context);
  const messages: { role: string; content: string }[] = [{ role: 'system', content: system }];
  for (const h of input.history?.slice(-10) ?? []) {
    if (h.role && h.content) messages.push({ role: h.role, content: h.content });
  }
  messages.push({ role: 'user', content: input.message });

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
        messages,
        temperature: 0.5,
        max_tokens: 900,
      }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const reply = data.choices?.[0]?.message?.content?.trim();
    return reply && !isWeakLlmFallback(reply) ? reply : null;
  } catch {
    return null;
  }
}

async function runReadIntent(read: AdminReadIntent): Promise<string> {
  switch (read.kind) {
    case 'list_pending':
      return (await listRequestsForAdmin({ pendingOnly: true })).markdown;
    case 'list_requests':
      return (await listRequestsForAdmin({ limit: 15 })).markdown;
    case 'list_in_progress':
      return (await listInProgressRequestsForAdmin()).markdown;
    case 'list_requesters':
      return (await listRecentRequestersForAdmin()).markdown;
    case 'get_request':
      return (await getRequestDetailForAdmin(read.ref)).markdown;
    case 'semaphore':
      return (await getSemaphoreForAdmin()).markdown;
    case 'list_events':
      return (await listEventsForAdmin()).markdown;
    default:
      return '';
  }
}

export async function runAdminAgentTurn(input: {
  message: string;
  history?: ChatTurn[];
}): Promise<{
  reply: string;
  pending_action?: AdminPendingAction;
  tool_used?: string;
}> {
  if (/\bmis pedidos\b/i.test(input.message)) {
    return {
      reply:
        'En el **Command Center** no usamos «mis pedidos» del portal: aquí ves la **bandeja de todos los clientes**. Prueba *pedidos pendientes*, *últimas solicitudes* o *¿quién está pidiendo?*.',
    };
  }

  const intent = await detectAdminIntent(input.message);

  if (intent.mode === 'pending') {
    return {
      reply: `Voy a preparar esto — **confirma abajo** antes de aplicarlo:\n\n${intent.pending.summary}`,
      pending_action: intent.pending,
    };
  }

  if (intent.mode === 'read') {
    const toolMarkdown = await runReadIntent(intent.read);
    const base = await buildAdminAgentBaseContext(input.message);
    const context = appendToolResult(base, {
      tool: intent.read.kind,
      markdown: toolMarkdown,
    });
    const llm = await callAdminOpenAI({
      message: input.message,
      context,
      history: input.history,
    });
    return {
      reply:
        llm ??
        toolMarkdown,
      tool_used: intent.read.kind,
    };
  }

  const base = await buildAdminAgentBaseContext(input.message);
  const llm = await callAdminOpenAI({
    message: input.message,
    context: base,
    history: input.history,
  });

  return {
    reply:
      llm ??
      `Puedo listar **solicitudes de todos los clientes**, **pendientes**, **en curso**, **solicitantes**, el **semáforo**, **eventos GA4** o **BigQuery**. ¿Qué revisamos?`,
  };
}
