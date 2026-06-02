'use client';

import { cn } from '@/lib/utils';
import { requestPriorities } from '@/lib/constants';

const priorityStyles: Record<string, string> = {
  p0_critical: 'border-destructive/40 bg-destructive/10 text-destructive data-[active=true]:bg-destructive/20',
  p1_high: 'border-signal/40 bg-signal/10 text-signal data-[active=true]:bg-signal/20',
  p2_medium: 'border-primary/40 bg-primary/10 text-primary data-[active=true]:bg-primary/20',
  p3_low: 'border-border/60 bg-secondary/40 text-muted-foreground data-[active=true]:bg-secondary/60',
};

const shortLabels: Record<string, string> = {
  p0_critical: 'Urgente',
  p1_high: 'Importante',
  p2_medium: 'Normal',
  p3_low: 'Sin prisa',
};

interface PriorityChipsProps {
  value: string;
  onChange: (value: string) => void;
}

export function PriorityChips({ value, onChange }: PriorityChipsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1.5">
      {requestPriorities.map((p) => (
        <button
          key={p.value}
          type="button"
          data-active={value === p.value}
          onClick={() => onChange(p.value)}
          className={cn(
            'rounded-lg border px-3 py-2.5 text-xs font-medium transition-all text-left',
            'hover:scale-[1.02] active:scale-[0.98]',
            priorityStyles[p.value]
          )}
        >
          {shortLabels[p.value]}
        </button>
      ))}
    </div>
  );
}
