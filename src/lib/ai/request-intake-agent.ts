import { adviseCapacity } from '@/lib/ai/capacity-advisor';
import type { CapacityAdvice } from '@/lib/request-acceptance';
import type { SergioCapacity } from '@/lib/availability-config';

export type IntakeDecision = 'auto_accept' | 'escalate_to_sergio';

export type RequestIntakeResult = {
  decision: IntakeDecision;
  advice: CapacityAdvice;
  auto_accept: boolean;
  ack_message: string;
  sergio_message: string;
  confidence: CapacityAdvice['confidence'];
  reason: string[];
};

type RequestRow = {
  id: string;
  title: string;
  type: string;
  priority: string;
  description?: string | null;
  company?: string | null;
};

type OpenRequest = {
  id: string;
  priority: string;
  type: string;
  sergio_decision: string | null;
  delivery_status: string | null;
};

function agentEnabled(): boolean {
  return process.env.REQUEST_AGENT_ENABLED !== 'false';
}

function autoAcceptEnabled(): boolean {
  return process.env.REQUEST_AGENT_AUTO_ACCEPT !== 'false';
}

function buildAckMessage(request: RequestRow, decision: IntakeDecision, dueDate?: string): string {
  if (decision === 'auto_accept' && dueDate) {
    return `Recibimos tu pedido "${request.title}". Lo tomamos y la fecha orientativa de entrega es ${dueDate}. Si algo cambia, te avisamos aquí.`;
  }
  if (request.priority === 'p0_critical') {
    return `Recibimos tu pedido urgente "${request.title}". Sergio lo revisa de inmediato y te confirma en breve.`;
  }
  return `Recibimos tu pedido "${request.title}". Sergio (o el equipo) lo revisará y te confirmará si lo tomamos y para cuándo.`;
}

export async function triageNewRequest(input: {
  request: RequestRow;
  openRequests: OpenRequest[];
  capacity: SergioCapacity;
  skipAutoAccept?: boolean;
}): Promise<RequestIntakeResult> {
  const { request, openRequests, capacity, skipAutoAccept } = input;

  const advice = await adviseCapacity({
    request,
    openRequests,
    capacity,
  });

  const reason: string[] = [...advice.reasoning];

  if (!agentEnabled()) {
    return {
      decision: 'escalate_to_sergio',
      advice,
      auto_accept: false,
      ack_message: buildAckMessage(request, 'escalate_to_sergio'),
      sergio_message: `Nuevo pedido — agente desactivado. ${advice.summary}`,
      confidence: advice.confidence,
      reason: ['Agente desactivado por configuración.', ...reason],
    };
  }

  let decision: IntakeDecision = 'escalate_to_sergio';
  let auto_accept = false;

  const canTryAuto =
    !skipAutoAccept &&
    autoAcceptEnabled() &&
    request.priority !== 'p0_critical' &&
    capacity !== 'full' &&
    capacity !== 'oof' &&
    advice.recommendation === 'accept' &&
    (advice.confidence === 'high' ||
      (advice.confidence === 'medium' && capacity === 'available'));

  if (canTryAuto) {
    decision = 'auto_accept';
    auto_accept = true;
    reason.push('Criterios de auto-aceptación cumplidos.');
  } else {
    if (request.priority === 'p0_critical') {
      reason.push('Urgente — siempre pasa por Sergio.');
    } else if (capacity === 'oof') {
      reason.push('Fuera de oficina (OOF) — escala a Sergio sin auto-aceptación.');
    } else if (capacity === 'full') {
      reason.push('Capacidad llena — escala a Sergio.');
    } else if (advice.recommendation !== 'accept') {
      reason.push(`Recomendación: ${advice.recommendation} — escala a Sergio.`);
    } else if (!autoAcceptEnabled()) {
      reason.push('Auto-aceptación desactivada.');
    } else if (skipAutoAccept) {
      reason.push('Registro manual — sin auto-aceptación.');
    }
  }

  const dueLabel = advice.suggested_due_date;

  return {
    decision,
    advice,
    auto_accept,
    ack_message: buildAckMessage(request, decision, dueLabel),
    sergio_message:
      decision === 'auto_accept'
        ? `Agente auto-aceptó con fecha ${dueLabel}. Revisa si hace falta ajustar.`
        : `Pendiente de tu respuesta. ${advice.summary}`,
    confidence: advice.confidence,
    reason,
  };
}
