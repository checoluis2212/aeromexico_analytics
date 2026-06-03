export type SergioDecision = 'pending' | 'accepted' | 'rejected';

export type RequestAcceptanceFields = {
  sergio_decision: SergioDecision;
  committed_due_date: string | null;
  sergio_notes: string | null;
  sergio_decided_at: string | null;
  ai_capacity_advice?: CapacityAdvice | null;
};

export type CapacityAdvice = {
  recommendation: 'accept' | 'defer' | 'reject';
  confidence: 'high' | 'medium' | 'low';
  suggested_due_date: string;
  summary: string;
  reasoning: string[];
  workload: {
    openTotal: number;
    urgentOpen: number;
    capacity: string;
  };
  source: 'rules' | 'openai';
};

export const DECISION_LABELS: Record<SergioDecision, string> = {
  pending: 'Pendiente de tu respuesta',
  accepted: 'Aceptado',
  rejected: 'No disponible por ahora',
};

export const DECISION_CLIENT_LABELS: Record<SergioDecision, string> = {
  pending: 'Lo estoy revisando',
  accepted: 'Lo tomé — en cola',
  rejected: 'No puedo tomarlo ahora',
};

export function publicRequestLabel(
  deliveryStatus: string | null,
  decision: SergioDecision | null | undefined
): string {
  const d = decision ?? 'pending';
  if (d === 'pending') return DECISION_CLIENT_LABELS.pending;
  if (d === 'rejected') return DECISION_CLIENT_LABELS.rejected;
  return DECISION_CLIENT_LABELS.accepted;
}
