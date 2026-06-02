'use client';

import { cn } from '@/lib/utils';
import { isRequestPending, type MyRequestRow } from '@/components/my-requests/request-card';
import { Clock, Loader2, CheckCircle2, Inbox } from 'lucide-react';

interface RequestSummaryProps {
  requests: MyRequestRow[];
  className?: string;
}

const items = [
  { key: 'total', label: 'Total', icon: Inbox, color: 'text-foreground' },
  { key: 'pending', label: 'Activos', icon: Loader2, color: 'text-primary' },
  { key: 'waiting', label: 'En cola', icon: Clock, color: 'text-signal' },
  { key: 'done', label: 'Listos', icon: CheckCircle2, color: 'text-radar' },
] as const;

function computeStats(requests: MyRequestRow[]) {
  let pending = 0;
  let waiting = 0;
  let done = 0;
  for (const r of requests) {
    const s = r.delivery_status ?? r.status;
    if (s === 'backlog' || s === 'submitted') waiting++;
    else if (isRequestPending(r)) pending++;
    else done++;
  }
  return { total: requests.length, pending, waiting, done };
}

export function RequestSummary({ requests, className }: RequestSummaryProps) {
  const stats = computeStats(requests);
  const values: Record<string, number> = stats;

  if (requests.length === 0) return null;

  return (
    <div className={cn('grid grid-cols-2 sm:grid-cols-4 gap-3', className)}>
      {items.map(({ key, label, icon: Icon, color }) => (
        <div
          key={key}
          className="glass-card premium-border rounded-xl px-4 py-3 flex items-center gap-3"
        >
          <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary/60', color)}>
            <Icon className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xl font-bold tabular-nums leading-none">{values[key]}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
