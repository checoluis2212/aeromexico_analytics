import type { SergioDecision } from '@/lib/request-acceptance';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export function acceptanceMessage(
  title: string,
  decision: SergioDecision,
  committedDueDate: string | null,
  notes: string | null
): { title: string; message: string } {
  if (decision === 'accepted') {
    const dateLabel = committedDueDate
      ? format(new Date(committedDueDate), "d 'de' MMMM yyyy", { locale: es })
      : 'próximamente';
    return {
      title: `Pedido aceptado: ${title}`,
      message: `Sergio aceptó tu pedido. Fecha comprometida: ${dateLabel}.${notes ? ` Nota: ${notes}` : ''}`,
    };
  }

  return {
    title: `Pedido no disponible: ${title}`,
    message: `Sergio no puede tomar este pedido en este momento.${notes ? ` Motivo: ${notes}` : ' Te contactará si cambia la situación.'}`,
  };
}
