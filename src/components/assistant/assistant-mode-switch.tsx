'use client';

import { GraduationCap, ClipboardList } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AssistantMode } from '@/lib/ai/assistant-modes';
import { ASSISTANT_MODE_LABELS } from '@/lib/ai/assistant-modes';

type Props = {
  value: AssistantMode;
  onChange: (mode: AssistantMode) => void;
  className?: string;
  size?: 'default' | 'compact';
};

const MODES: { id: AssistantMode; icon: typeof GraduationCap }[] = [
  { id: 'consultor', icon: GraduationCap },
  { id: 'solicitud', icon: ClipboardList },
];

export function AssistantModeSwitch({ value, onChange, className, size = 'default' }: Props) {
  const compact = size === 'compact';
  return (
    <div
      className={cn(
        'inline-flex rounded-xl border border-border/60 bg-secondary/30 gap-0.5',
        compact ? 'p-0.5 rounded-lg' : 'p-1 gap-1',
        className
      )}
      role="tablist"
      aria-label="Modo del asistente"
    >
      {MODES.map(({ id, icon: Icon }) => {
        const active = value === id;
        const meta = ASSISTANT_MODE_LABELS[id];
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(id)}
            className={cn(
              'flex items-center gap-1.5 rounded-lg font-medium transition-all',
              compact ? 'px-2 py-1 text-[11px]' : 'gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm',
              active
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
            )}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" />
            <span>{meta.label}</span>
          </button>
        );
      })}
    </div>
  );
}
