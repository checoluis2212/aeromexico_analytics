/** Copy compartido — seguimiento IA en Mis pedidos */

export const MIS_PEDIDOS_AI = {
  shortLabel: 'Seguimiento IA',
  tableLabel: 'Preguntar',
  compactLabel: '¿En qué va?',
  valueProp: 'Estado, plazos y qué sigue — al instante, con datos reales del pedido.',
  valuePropShort: 'Estado y plazos al instante',
  trustLine: 'Respuesta al momento · Datos del sistema · Sin inventar fechas',
  bannerTitle: '¿No quieres esperar a que te conteste por correo?',
  bannerBody:
    'Pregúntame sobre tu pedido: en qué va, qué significa el estado y si te falta hacer algo. Uso la misma info que ves aquí.',
  emptyHint:
    'Aún no tienes pedidos. Cuando quieras pedir algo nuevo, usa Pedido con IA — te guío paso a paso.',
  detailExamples: [
    '¿En qué va mi pedido?',
    '¿Qué significa este estado?',
    '¿Necesito hacer algo yo?',
  ] as const,
} as const;

export function countOrdersNeedingAttention(requests: {
  sergio_decision?: string | null;
  delivery_status?: string | null;
  status: string;
}[]): { pendingReview: number; active: number } {
  const DONE = new Set(['done', 'completed', 'cancelled']);
  let pendingReview = 0;
  let active = 0;
  for (const r of requests) {
    const decision = r.sergio_decision ?? 'pending';
    const s = r.delivery_status ?? r.status;
    if (decision === 'pending') pendingReview++;
    else if (decision !== 'rejected' && !DONE.has(s)) active++;
  }
  return { pendingReview, active };
}
