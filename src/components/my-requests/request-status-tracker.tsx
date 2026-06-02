'use client';

import { cn } from '@/lib/utils';
import { mapDeliveryStatusForUser } from '@/lib/integrations/external-sync';
import { Check } from 'lucide-react';

const STEPS = [
  { key: 'backlog', label: 'Recibido' },
  { key: 'discovery', label: 'Análisis' },
  { key: 'development', label: 'En progreso' },
  { key: 'analytics_qa', label: 'Revisión' },
  { key: 'done', label: 'Listo' },
] as const;

const STATUS_INDEX: Record<string, number> = {
  backlog: 0,
  discovery: 1,
  requirements: 1,
  ready_for_development: 1,
  development: 2,
  analytics_qa: 3,
  ready_for_release: 3,
  done: 4,
  completed: 4,
  blocked: 2,
  submitted: 0,
  in_review: 1,
  in_progress: 2,
  cancelled: 4,
};

export function RequestStatusTracker({ status }: { status: string }) {
  const current = STATUS_INDEX[status] ?? 0;
  const isBlocked = status === 'blocked';

  return (
    <div className="w-full">
      {isBlocked && (
        <p className="text-xs text-destructive mb-3 font-medium">En pausa — te avisamos cuando retome</p>
      )}
      <div className="flex items-center justify-between gap-1">
        {STEPS.map((step, i) => {
          const done = i < current || (i === current && status === 'done');
          const active = i === current && status !== 'done';
          return (
            <div key={step.key} className="flex flex-1 flex-col items-center gap-1.5 min-w-0">
              <div
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-full border-2 text-[10px] font-bold transition-colors',
                  done && 'bg-radar border-radar text-background',
                  active && !isBlocked && 'border-primary bg-primary/20 text-primary',
                  !done && !active && 'border-border/60 text-muted-foreground'
                )}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </div>
              <span className={cn(
                'text-[9px] text-center leading-tight truncate w-full',
                active ? 'text-primary font-medium' : 'text-muted-foreground'
              )}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
      <p className="text-center text-xs text-muted-foreground mt-3">
        {mapDeliveryStatusForUser(status)}
      </p>
    </div>
  );
}
