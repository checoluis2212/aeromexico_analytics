import { addBusinessDays, format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { CapacityAdvice } from '@/lib/request-acceptance';
import type { SergioCapacity } from '@/lib/availability-config';

const EFFORT_DAYS: Record<string, number> = {
  tracking: 1,
  dashboard: 5,
  funnel: 7,
  qa: 2,
  reporting: 5,
  investigation: 3,
};

const PRIORITY_DAYS: Record<string, number> = {
  p0_critical: 1,
  p1_high: 3,
  p2_medium: 7,
  p3_low: 14,
};

type OpenRequest = {
  id: string;
  priority: string;
  type: string;
  sergio_decision: string | null;
  delivery_status: string | null;
};

type IncomingRequest = {
  id: string;
  title: string;
  type: string;
  priority: string;
  description?: string | null;
  company?: string | null;
};

function businessDaysFromNow(days: number): string {
  const d = addBusinessDays(new Date(), Math.max(1, days));
  return format(d, 'yyyy-MM-dd');
}

function formatDateEs(iso: string): string {
  return format(new Date(iso), "d MMM yyyy", { locale: es });
}

export function adviseCapacityRuleBased(input: {
  request: IncomingRequest;
  openRequests: OpenRequest[];
  capacity: SergioCapacity;
}): CapacityAdvice {
  const { request, openRequests, capacity } = input;
  const active = openRequests.filter(
    (r) =>
      r.id !== request.id &&
      r.sergio_decision !== 'rejected' &&
      !['done', 'cancelled', 'completed'].includes(r.delivery_status ?? '')
  );
  const urgentOpen = active.filter((r) =>
    ['p0_critical', 'p1_high'].includes(r.priority)
  ).length;
  const openTotal = active.length;
  const effort = EFFORT_DAYS[request.type] ?? 4;
  const slaDays = PRIORITY_DAYS[request.priority] ?? 7;

  let buffer = effort;
  if (capacity === 'limited') buffer += 3;
  if (capacity === 'full') buffer += 7;
  if (capacity === 'oof') buffer += 14;
  buffer += Math.min(openTotal * 0.5, 10);

  const suggestedDays = Math.max(slaDays, Math.ceil(buffer));
  const suggested_due_date = businessDaysFromNow(suggestedDays);

  const reasoning: string[] = [
    `Tienes ${openTotal} pedido(s) activo(s) (${urgentOpen} urgentes).`,
    `Semáforo de capacidad: ${
      capacity === 'available'
        ? 'disponible'
        : capacity === 'limited'
          ? 'limitada'
          : capacity === 'oof'
            ? 'fuera de oficina (OOF)'
            : 'llena'
    }.`,
    `Estimación para este tipo (${request.type}): ~${effort} días hábiles.`,
  ];

  let recommendation: CapacityAdvice['recommendation'] = 'accept';
  let confidence: CapacityAdvice['confidence'] = 'high';

  if (capacity === 'oof') {
    recommendation = request.priority === 'p0_critical' ? 'defer' : 'reject';
    confidence = 'high';
    reasoning.push('Sergio está fuera de oficina — no auto-aceptar; solo P0 podría revisarse manualmente.');
  } else if (capacity === 'full' && request.priority === 'p3_low') {
    recommendation = 'reject';
    confidence = 'high';
    reasoning.push('Capacidad llena y prioridad baja — considera rechazar o encolar a más de 2 semanas.');
  } else if (capacity === 'full' && !['p0_critical', 'p1_high'].includes(request.priority)) {
    recommendation = 'defer';
    confidence = 'medium';
    reasoning.push('Capacidad llena — solo urgencias o P0/P1 deberían entrar ya.');
  } else if (openTotal >= 8 || urgentOpen >= 3) {
    recommendation = 'defer';
    confidence = 'medium';
    reasoning.push('Cola alta — propón fecha realista y avisa al solicitante.');
  } else if (capacity === 'available' && openTotal <= 3) {
    recommendation = 'accept';
    confidence = 'high';
    reasoning.push('Buen momento para aceptar con la fecha sugerida.');
  }

  const action =
    recommendation === 'accept'
      ? 'Puedes aceptarlo'
      : recommendation === 'defer'
        ? 'Acepta con fecha lejana o negocia alcance'
        : 'Mejor rechazar por ahora';

  return {
    recommendation,
    confidence,
    suggested_due_date,
    summary: `${action} — fecha sugerida: ${formatDateEs(suggested_due_date)}.`,
    reasoning,
    workload: { openTotal, urgentOpen, capacity },
    source: 'rules',
  };
}

export async function adviseCapacity(input: {
  request: IncomingRequest;
  openRequests: OpenRequest[];
  capacity: SergioCapacity;
}): Promise<CapacityAdvice> {
  const rules = adviseCapacityRuleBased(input);
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return rules;

  try {
    const prompt = `Eres el asistente de capacidad de Sergio Burgos, Analytics Metrics Specialist en Aeroméxico.
Analiza si puede aceptar este pedido y cuándo podría entregarlo.

Pedido nuevo:
- Título: ${input.request.title}
- Tipo: ${input.request.type}
- Prioridad: ${input.request.priority}
- Área: ${input.request.company ?? 'N/A'}
- Descripción: ${input.request.description?.slice(0, 400) ?? 'N/A'}

Contexto operativo:
- Pedidos activos: ${rules.workload.openTotal}
- Urgentes abiertos: ${rules.workload.urgentOpen}
- Semáforo Sergio: ${input.capacity}
- Análisis por reglas: ${rules.summary}

Responde SOLO JSON válido:
{
  "recommendation": "accept" | "defer" | "reject",
  "confidence": "high" | "medium" | "low",
  "suggested_due_date": "YYYY-MM-DD",
  "summary": "1-2 frases en español para Sergio",
  "reasoning": ["punto 1", "punto 2", "punto 3"]
}`;

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      }),
    });

    if (!res.ok) return rules;

    const json = await res.json();
    const content = json.choices?.[0]?.message?.content;
    if (!content) return rules;

    const parsed = JSON.parse(content) as Omit<CapacityAdvice, 'workload' | 'source'>;
    return {
      recommendation: parsed.recommendation ?? rules.recommendation,
      confidence: parsed.confidence ?? rules.confidence,
      suggested_due_date: parsed.suggested_due_date ?? rules.suggested_due_date,
      summary: parsed.summary ?? rules.summary,
      reasoning: Array.isArray(parsed.reasoning) ? parsed.reasoning : rules.reasoning,
      workload: rules.workload,
      source: 'openai',
    };
  } catch {
    return rules;
  }
}
