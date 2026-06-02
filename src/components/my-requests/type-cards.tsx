'use client';

import { cn } from '@/lib/utils';
import { requestTypes } from '@/lib/constants';

interface TypeCardsProps {
  value: string;
  onChange: (value: string) => void;
}

export function TypeCards({ value, onChange }: TypeCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1.5">
      {requestTypes.map((t) => (
        <button
          key={t.value}
          type="button"
          data-active={value === t.value}
          onClick={() => onChange(t.value)}
          className={cn(
            'rounded-xl border px-3 py-3 text-left transition-all',
            'hover:border-primary/30 hover:bg-primary/5',
            value === t.value
              ? 'border-primary/50 bg-primary/10 ring-1 ring-primary/20'
              : 'border-border/50 bg-card/30'
          )}
        >
          <p className="text-sm font-medium">{t.label}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{t.description}</p>
        </button>
      ))}
    </div>
  );
}
