'use client';

import { cn } from '@/lib/utils';
import type { SergioInboxStats, SergioQueue } from '@/lib/requests/inbox-queue';
import { AlertTriangle, CalendarClock, Inbox, Sparkles } from 'lucide-react';

type Props = {
  stats: SergioInboxStats;
  activeQueue: string;
  onSelectQueue: (queue: SergioQueue) => void;
};

type SummaryCard = {
  key: string;
  statKey: keyof Pick<SergioInboxStats, 'needsAccept' | 'active' | 'overdue' | 'urgentNeedsAccept'>;
  label: string;
  icon: typeof Sparkles;
  accent: string;
  ring: string;
  highlight: (s: SergioInboxStats) => boolean;
  queueOnClick?: SergioQueue;
};

const cards: SummaryCard[] = [
  {
    key: 'needs_accept' as const,
    statKey: 'needsAccept' as const,
    label: 'Por aceptar',
    icon: Sparkles,
    accent: 'text-signal',
    ring: 'ring-signal/40',
    highlight: (s: SergioInboxStats) => s.needsAccept > 0,
  },
  {
    key: 'active' as const,
    statKey: 'active' as const,
    label: 'En curso',
    icon: Inbox,
    accent: 'text-primary',
    ring: 'ring-primary/40',
    highlight: () => false,
  },
  {
    key: 'overdue' as const,
    statKey: 'overdue' as const,
    label: 'Vencidos',
    icon: CalendarClock,
    accent: 'text-destructive',
    ring: 'ring-destructive/40',
    highlight: (s: SergioInboxStats) => s.overdue > 0,
    queueOnClick: 'active' as const,
  },
  {
    key: 'urgent' as const,
    statKey: 'urgentNeedsAccept' as const,
    label: 'Urgentes sin contestar',
    icon: AlertTriangle,
    accent: 'text-destructive',
    ring: 'ring-destructive/40',
    highlight: (s: SergioInboxStats) => s.urgentNeedsAccept > 0,
    queueOnClick: 'needs_accept' as const,
  },
];

export function SergioInboxSummary({ stats, activeQueue, onSelectQueue }: Props) {
  if (stats.needsAccept + stats.active + stats.rejected + stats.done === 0) return null;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map(({ key, statKey, label, icon: Icon, accent, ring, highlight, queueOnClick }) => {
        const targetQueue: SergioQueue = queueOnClick ?? (key as SergioQueue);
        const isActive = activeQueue === targetQueue;
        const value = stats[statKey];
        const hot = highlight(stats);

        return (
          <button
            key={key}
            type="button"
            onClick={() => onSelectQueue(targetQueue)}
            className={cn(
              'glass-card premium-border rounded-xl px-4 py-3 flex items-center gap-3 text-left transition-all',
              'hover:border-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
              isActive && `ring-2 ${ring}`,
              hot && !isActive && 'border-signal/30'
            )}
          >
            <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary/60', accent)}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className={cn('text-xl font-bold tabular-nums leading-none', hot && value > 0 && accent)}>
                {value}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">{label}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
