'use client';

import Link from 'next/link';
import { Clock, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { slas } from '@/lib/constants';

const priorityToSlaIndex: Record<string, number> = {
  p0_critical: 0,
  p1_high: 1,
  p2_medium: 2,
  p3_low: 3,
};

/** Mismo orden visual que en Cómo trabajo → tiempos de respuesta */
const displayOrder = ['p0_critical', 'p1_high', 'p3_low', 'p2_medium'] as const;

const tierStyle: Record<string, string> = {
  p0_critical: 'border-destructive/55 bg-destructive/15 shadow-sm shadow-destructive/10',
  p1_high: 'border-signal/55 bg-signal/15 shadow-sm shadow-signal/10',
  p2_medium: 'border-primary/55 bg-primary/15 shadow-sm shadow-primary/10',
  p3_low: 'border-radar/55 bg-radar/15 shadow-sm shadow-radar/10',
};

const tierActive: Record<string, string> = {
  p0_critical:
    'border-2 border-destructive ring-2 ring-destructive/50 ring-offset-2 ring-offset-background shadow-md shadow-destructive/20',
  p1_high:
    'border-2 border-signal ring-2 ring-signal/50 ring-offset-2 ring-offset-background shadow-md shadow-signal/20',
  p2_medium:
    'border-2 border-primary ring-2 ring-primary/50 ring-offset-2 ring-offset-background shadow-md shadow-primary/20',
  p3_low:
    'border-2 border-radar ring-2 ring-radar/50 ring-offset-2 ring-offset-background shadow-md shadow-radar/20',
};

const tierText: Record<string, string> = {
  p0_critical: 'text-destructive',
  p1_high: 'text-signal',
  p2_medium: 'text-primary',
  p3_low: 'text-radar',
};

interface PriorityChipsProps {
  value: string;
  onChange: (value: string) => void;
}

export function PriorityChips({ value, onChange }: PriorityChipsProps) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {displayOrder.map((priorityKey) => {
          const sla = slas[priorityToSlaIndex[priorityKey]];
          const accent = tierText[priorityKey] ?? 'text-foreground';
          const active = value === priorityKey;
          return (
            <button
              key={priorityKey}
              type="button"
              data-active={active}
              onClick={() => onChange(priorityKey)}
              className={cn(
                'rounded-xl border p-4 text-left transition-all',
                active ? tierActive[priorityKey] : tierStyle[priorityKey]
              )}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className={cn('text-sm font-semibold', accent)}>{sla.priority}</span>
                {active ? null : (
                  <span className="text-[10px] text-muted-foreground/80">aprox.</span>
                )}
              </div>
              <p className="text-xs text-foreground/70 leading-relaxed mb-2">{sla.description}</p>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1 whitespace-nowrap">
                  <Clock className={cn('h-3 w-3', accent)} />
                  Resp. <span className={cn('font-semibold tabular-nums', accent)}>máx. {sla.responseMax}</span>
                </span>
                <span className="text-muted-foreground/40">·</span>
                <span className="whitespace-nowrap">
                  Entrega{' '}
                  <span className={cn('font-semibold tabular-nums', accent)}>máx. {sla.deliveryMax}</span>
                </span>
              </div>
            </button>
          );
        })}
      </div>
      <p className="text-[11px] text-muted-foreground leading-relaxed">
        Tiempos orientativos — al aceptar el pedido te confirmo fecha.{' '}
        <Link
          href="/working-with-me#tiempos-respuesta"
          className="inline-flex items-center gap-0.5 text-primary hover:underline"
        >
          Ver tiempos
          <ArrowRight className="h-3 w-3" />
        </Link>
      </p>
    </div>
  );
}
