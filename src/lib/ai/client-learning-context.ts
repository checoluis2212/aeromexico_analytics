/**
 * Contexto del cliente desde Supabase — solo importar en Server (API routes).
 */

import { createClient } from '@/lib/supabase/server';
import { requestTypeLabels } from '@/lib/constants';
import type { ChatTurn } from '@/lib/ai/assistant-agent-skills';
import { inferClientSignals, experienceHint } from '@/lib/ai/client-signals';

export type { ChatTurn } from '@/lib/ai/assistant-agent-skills';

export async function buildClientLearningContext(
  userId: string,
  message: string,
  history: ChatTurn[] = []
): Promise<string> {
  const signals = inferClientSignals(message, history);

  try {
    const supabase = await createClient();

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, email, company, department, team, job_title')
      .eq('id', userId)
      .maybeSingle();

    const email = profile?.email;
    const requestsQuery = supabase
      .from('requests')
      .select('title, type, company, status, delivery_status, created_at, reference_code')
      .order('created_at', { ascending: false })
      .limit(6);

    const { data: requestRows } = email
      ? await requestsQuery.or(`user_id.eq.${userId},requester_email.eq.${email}`)
      : await requestsQuery.eq('user_id', userId);
    const rows = requestRows ?? [];
    const openStatuses = new Set(['submitted', 'in_review', 'in_progress', 'blocked']);
    const openCount = rows.filter((r) => openStatuses.has(r.status)).length;

    const name = profile?.full_name?.split(' ')[0] ?? null;
    const area =
      signals.preferredArea ??
      profile?.department ??
      profile?.company ??
      rows[0]?.company ??
      null;

    const recentRequests =
      rows.length > 0
        ? rows
            .slice(0, 4)
            .map((r) => {
              const type = requestTypeLabels[r.type as keyof typeof requestTypeLabels] ?? r.type;
              const ref = r.reference_code ? `${r.reference_code} · ` : '';
              return `- ${ref}"${r.title}" (${type}, ${r.status})`;
            })
            .join('\n')
        : '- Sin pedidos previos registrados';

    const topicLine =
      signals.recurringTopics.length > 0
        ? signals.recurringTopics.join(', ')
        : 'aún no definido en la conversación';

    return [
      'PERFIL DEL CLIENTE (úsalo para personalizar — no lo recites textual):',
      name ? `- Nombre: ${name}` : '- Nombre: no disponible',
      area ? `- Área / foco probable: ${area}` : '',
      profile?.job_title ? `- Puesto: ${profile.job_title}` : '',
      profile?.team ? `- Equipo: ${profile.team}` : '',
      `- Pedidos abiertos: ${openCount}`,
      `- Temas que ha tocado en el chat: ${topicLine}`,
      experienceHint(signals.experienceLevel, signals.needsSimpleLanguage),
      `Pedidos recientes:\n${recentRequests}`,
      `CÓMO "APRENDER" DEL CLIENTE EN ESTA CHARLA:
- Recuerda lo que ya preguntó en el historial; no repitas intro genérica.
- Si volvió a un tema, profundiza un paso (no reinicies desde cero).
- Adapta ejemplos a su área (${area ?? 'stakeholder Aeroméxico'}).
- Si suena perdido, baja el ritmo y confirma con una pregunta corta al final.`,
    ]
      .filter(Boolean)
      .join('\n');
  } catch {
    return [
      'PERFIL DEL CLIENTE (parcial — sin datos de cuenta):',
      experienceHint(signals.experienceLevel, signals.needsSimpleLanguage),
      signals.preferredArea ? `- Área detectada en chat: ${signals.preferredArea}` : '',
      `- Temas en conversación: ${signals.recurringTopics.join(', ') || 'general'}`,
    ]
      .filter(Boolean)
      .join('\n');
  }
}
