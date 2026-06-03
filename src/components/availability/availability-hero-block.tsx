'use client';

import Link from 'next/link';
import { CAPACITY_CONFIG, CAPACITY_ORDER } from '@/lib/availability-config';
import type { SergioAvailability, SergioCapacity } from '@/lib/availability-config';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

const ORDER = CAPACITY_ORDER;

const STATUS_TEXT: Record<SergioCapacity, string> = {
  available: 'text-radar',
  limited: 'text-signal',
  full: 'text-destructive',
  oof: 'text-muted-foreground',
};

type Props = {
  availability: SergioAvailability;
  className?: string;
  centered?: boolean;
};

export function AvailabilityHeroBlock({ availability, className, centered }: Props) {
  const config = CAPACITY_CONFIG[availability.capacity];
  const note = availability.note?.trim() || config.headline;

  return (
    <div
      className={cn(
        'group relative rounded-2xl overflow-hidden',
        'border border-border/50 bg-gradient-to-b from-card/40 to-card/10',
        'shadow-lg shadow-black/10 ring-1 ring-white/5',
        centered && 'mx-auto',
        className
      )}
    >
      <div className={cn('absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent')} />

      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-4">
          <div className="flex flex-col items-center gap-1.5 pt-1 shrink-0" aria-hidden>
            {ORDER.map((key) => {
              const active = key === availability.capacity;
              return (
                <span
                  key={key}
                  className={cn(
                    'rounded-full transition-all duration-300',
                    active ? 'h-3 w-3' : 'h-2 w-2',
                    active ? CAPACITY_CONFIG[key].dotClass : 'bg-muted-foreground/20'
                  )}
                />
              );
            })}
          </div>

          <div className="min-w-0 flex-1 space-y-1">
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Mi cola hoy
            </p>
            <p className={cn('text-base font-semibold leading-tight', STATUS_TEXT[availability.capacity])}>
              {config.label}
            </p>
            <p className="text-sm text-foreground/90 leading-snug">{note}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 border-t border-border/30 bg-background/30">
        <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed">
          Cambia según lo que tenga abierto. Cuando mandes un pedido, te digo si lo tomo y para cuándo.
        </p>
        <Link
          href="/working-with-me#tiempos-respuesta"
          className="shrink-0 inline-flex items-center gap-0.5 text-[11px] font-medium text-primary hover:text-primary/80 transition-colors whitespace-nowrap"
        >
          Ver tiempos
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
