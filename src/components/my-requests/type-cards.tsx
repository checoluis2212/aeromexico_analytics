'use client';

import {
  BarChart3,
  Code2,
  Filter,
  ShieldCheck,
  Database,
  Search,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { requestTypes } from '@/lib/constants';

const typeIcons: Record<string, LucideIcon> = {
  dashboard: BarChart3,
  tracking: Code2,
  funnel: Filter,
  qa: ShieldCheck,
  reporting: Database,
  investigation: Search,
};

interface TypeCardsProps {
  value: string;
  onChange: (value: string) => void;
}

export function TypeCards({ value, onChange }: TypeCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {requestTypes.map((t) => {
        const Icon = typeIcons[t.value] ?? BarChart3;
        const active = value === t.value;
        return (
          <button
            key={t.value}
            type="button"
            data-active={active}
            onClick={() => onChange(t.value)}
            className={cn(
              'rounded-xl border p-4 text-left transition-all',
              active
                ? 'border-2 border-primary ring-2 ring-primary/50 ring-offset-2 ring-offset-background bg-primary/15 shadow-md shadow-primary/20'
                : 'border border-border/55 bg-card/40 hover:border-primary/30'
            )}
          >
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ring-1',
                  active
                    ? 'bg-primary/20 text-primary ring-primary/40'
                    : 'bg-muted/40 text-muted-foreground ring-border/50'
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className={cn('text-sm font-semibold', active && 'text-primary')}>{t.label}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{t.description}</p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
