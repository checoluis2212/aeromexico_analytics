import { mapDeliveryStatusForUser } from '@/lib/integrations/external-sync';
import type { SergioDecision } from '@/lib/request-acceptance';

/** Etiqueta de estado legible para clientes (lista / detalle) */
export function clientRequestLabel(
  deliveryStatus: string | null,
  decision: SergioDecision | null | undefined
): string {
  const d = decision ?? 'pending';
  if (d === 'pending') return 'Lo estoy revisando';
  if (d === 'rejected') return 'No puedo tomarlo ahora';
  return mapDeliveryStatusForUser(deliveryStatus);
}
