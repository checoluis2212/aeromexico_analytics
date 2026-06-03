'use client';

import { Clock } from 'lucide-react';
import { slas } from '@/lib/constants';
import { cn } from '@/lib/utils';

const tierStyle: Record<string, string> = {
  Urgente: 'border-destructive/55 bg-destructive/15 shadow-sm shadow-destructive/10',
  Importante: 'border-signal/55 bg-signal/15 shadow-sm shadow-signal/10',
  Normal: 'border-primary/55 bg-primary/15 shadow-sm shadow-primary/10',
  'Sin prisa': 'border-radar/55 bg-radar/15 shadow-sm shadow-radar/10',
};

const tierText: Record<string, string> = {
  Urgente: 'text-destructive',
  Importante: 'text-signal',
  Normal: 'text-primary',
  'Sin prisa': 'text-radar',
};

/** Orden visual: fila 2 = verde (Sin prisa) izquierda, cyan (Normal) derecha */
const displayOrder = [0, 1, 3, 2] as const;

export function ResponseTimeCards() {
  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <p className="text-center text-sm text-muted-foreground leading-relaxed">
        Tiempos orientativos — suelo ir antes del máximo. Al aceptar tu pedido te confirmo fecha real.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {displayOrder.map((index) => {
          const sla = slas[index];
          const accent = tierText[sla.priority] ?? 'text-foreground';
          return (
            <div
              key={sla.priority}
              className={cn(
                'rounded-xl border p-4 transition-colors hover:border-primary/25',
                tierStyle[sla.priority]
              )}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className={cn('text-sm font-semibold', accent)}>{sla.priority}</span>
                <span className="text-[10px] uppercase tracking-wide text-muted-foreground/80">
                  aprox.
                </span>
              </div>

              <p className="text-xs text-foreground/70 leading-relaxed mb-3">{sla.description}</p>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                <span className="inline-flex items-center gap-1 text-muted-foreground whitespace-nowrap">
                  <Clock className={cn('h-3 w-3 shrink-0', accent)} />
                  Respuesta{' '}
                  <span className={cn('font-semibold tabular-nums', accent)}>máx. {sla.responseMax}</span>
                </span>
                <span className="text-muted-foreground/40 hidden sm:inline">·</span>
                <span className="text-muted-foreground whitespace-nowrap">
                  Entrega{' '}
                  <span className={cn('font-semibold tabular-nums', accent)}>máx. {sla.deliveryMax}</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
