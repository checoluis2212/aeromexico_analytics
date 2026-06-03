/**
 * Modo Consultor — siempre LLM como Sergio (analytics). Fallback mínimo sin plantillas.
 */

import type { ChatTurn } from '@/lib/ai/assistant-agent-skills';
import { solicitudFormHref } from '@/lib/ai/assistant-modes';
import {
  buildSergioAnalyticsSystemPrompt,
  isWeakLlmFallback,
} from '@/lib/ai/sergio-analytics-prompt';

const AI_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
const pedirLink = solicitudFormHref({ empezar: true });

async function callOpenAI(input: {
  message: string;
  context: string;
  history?: ChatTurn[];
}): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const system = buildSergioAnalyticsSystemPrompt(input.context);
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
        temperature: 0.65,
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

async function callAiService(input: {
  message: string;
  context: string;
  history?: ChatTurn[];
}): Promise<string | null> {
  try {
    const res = await fetch(`${AI_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: input.message,
        module: 'consultor_analytics',
        context: input.context,
        history: input.history?.slice(-10),
      }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { reply?: string };
    const reply = data.reply?.trim();
    return reply && !isWeakLlmFallback(reply) ? reply : null;
  } catch {
    return null;
  }
}

/** Respuesta inteligente como Sergio — OpenAI primero, microservicio después */
export async function invokeSergioAnalyticsLLM(input: {
  message: string;
  context: string;
  history?: ChatTurn[];
}): Promise<string | null> {
  const fromOpenAI = await callOpenAI(input);
  if (fromOpenAI) return fromOpenAI;

  const fromService = await callAiService(input);
  if (fromService) return fromService;

  return null;
}

/** Solo si no hay API key ni servicio — mensaje honesto, sin glosario */
export function generateConsultorFallbackReply(
  message: string,
  _opts?: { scenarioId?: string | null; history?: ChatTurn[] }
): string {
  void message;
  return `Ahora mismo no tengo el motor de respuesta conectado (falta \`OPENAI_API_KEY\` en el servidor o el servicio de IA no está arriba).

Mientras tanto: escribe tu duda de analytics (qué comparas, fechas, canal) y vuelve a intentar en un momento.

Si es urgente ejecutar algo en el equipo, usa [Pedir trabajo](${pedirLink}).`;
}

/** @deprecated El consultor ya no usa atajos locales — siempre LLM */
export function tryConsultorStructuredReply(_message: string): string | null {
  return null;
}

/** @deprecated */
export function isExplicitConceptQuestion(_message: string): boolean {
  return false;
}

/** @deprecated Usar invokeSergioAnalyticsLLM */
export async function callConsultorOpenAI(input: {
  message: string;
  context: string;
  history?: ChatTurn[];
}): Promise<string | null> {
  return invokeSergioAnalyticsLLM(input);
}
