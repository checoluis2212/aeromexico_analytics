'use client';

import { useMemo, useState } from 'react';
import { RequestCard, type MyRequestRow } from '@/components/my-requests/request-card';
import { RequestFilters } from '@/components/my-requests/request-filters';
import { SergioInboxSummary } from '@/components/command-center/sergio-inbox-summary';
import { Button } from '@/components/ui/button';
import {
  defaultFilters,
  extractAreas,
  extractRequesters,
  filterRequests,
  type RequestFilterState,
} from '@/lib/requests/filters';
import {
  computeSergioInboxStats,
  SERGIO_QUEUE_META,
  sortForSergioQueue,
  getSergioQueue,
  type SergioQueue,
} from '@/lib/requests/inbox-queue';
import { exportRequestsCsv } from '@/lib/requests/export-csv';
import { Download, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type Props = {
  requests: MyRequestRow[];
  detailBasePath?: string;
};

const QUEUE_ORDER: SergioQueue[] = ['needs_accept', 'active', 'rejected', 'done'];

function defaultQueue(stats: ReturnType<typeof computeSergioInboxStats>): SergioQueue {
  if (stats.needsAccept > 0) return 'needs_accept';
  if (stats.active > 0) return 'active';
  return 'needs_accept';
}

export function SergioInbox({ requests, detailBasePath = '/command-center/pedidos' }: Props) {
  const stats = useMemo(() => computeSergioInboxStats(requests), [requests]);
  const [queue, setQueue] = useState<SergioQueue>(() => defaultQueue(stats));
  const [filters, setFilters] = useState<RequestFilterState>(defaultFilters);

  const users = useMemo(() => extractRequesters(requests), [requests]);
  const areas = useMemo(() => extractAreas(requests), [requests]);

  const filtered = useMemo(() => {
    const base = filterRequests(requests, { ...filters, status: 'all' });
    return base
      .filter((r) => getSergioQueue(r) === queue)
      .sort((a, b) => sortForSergioQueue(a, b, queue));
  }, [requests, filters, queue]);

  const queueCounts = useMemo(() => {
    const counts: Record<SergioQueue, number> = {
      needs_accept: 0,
      active: 0,
      rejected: 0,
      done: 0,
    };
    for (const r of requests) {
      counts[getSergioQueue(r)]++;
    }
    return counts;
  }, [requests]);

  const meta = SERGIO_QUEUE_META[queue];

  return (
    <div className="space-y-5">
      <SergioInboxSummary stats={stats} activeQueue={queue} onSelectQueue={setQueue} />

      {stats.needsAccept > 0 && queue === 'needs_accept' && stats.waitingTooLong > 0 && (
        <div className="flex items-start gap-2.5 rounded-lg border border-signal/30 bg-signal/5 px-4 py-3 text-sm text-muted-foreground">
          <AlertCircle className="h-4 w-4 text-signal shrink-0 mt-0.5" />
          <p>
            <span className="font-medium text-signal">{stats.waitingTooLong}</span>
            {' '}
            {stats.waitingTooLong === 1 ? 'lleva' : 'llevan'} más de 24 h esperando tu respuesta.
            Empieza por los urgentes.
          </p>
        </div>
      )}

      {stats.overdue > 0 && queue === 'active' && (
        <div className="flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-muted-foreground">
          <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
          <p>
            <span className="font-medium text-destructive">{stats.overdue}</span>
            {' '}
            {stats.overdue === 1 ? 'ya venció' : 'ya vencieron'} su fecha comprometida. Habla con el solicitante y ajusten la fecha si hace falta.
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {QUEUE_ORDER.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => setQueue(q)}
            className={cn(
              'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
              queue === q
                ? 'border-primary/50 bg-primary/10 text-primary'
                : 'border-border/50 text-muted-foreground hover:border-primary/30 hover:text-foreground'
            )}
          >
            {SERGIO_QUEUE_META[q].label}
            <span className="tabular-nums opacity-80">({queueCounts[q]})</span>
          </button>
        ))}
      </div>

      <div>
        <h2 className="text-sm font-semibold">{meta.label}</h2>
        <p className="text-xs text-muted-foreground mt-0.5">{meta.description}</p>
      </div>

      <RequestFilters
        filters={filters}
        onChange={setFilters}
        users={users}
        areas={areas}
        showUserFilter
        hideStatusFilter
      />

      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          {filtered.length} en esta cola · {requests.length} total
        </p>
        {filtered.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              exportRequestsCsv(filtered, `bandeja-${queue}-${new Date().toISOString().slice(0, 10)}.csv`)
            }
          >
            <Download className="mr-2 h-4 w-4" />
            Exportar CSV
          </Button>
        )}
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground py-10 text-center rounded-xl border border-dashed border-border/50">
          {meta.empty}
        </p>
      ) : (
        <div className="grid gap-3">
          {filtered.map((r) => (
            <RequestCard
              key={r.id}
              request={r}
              detailHref={`${detailBasePath}/${r.id}`}
              mode="sergio"
            />
          ))}
        </div>
      )}
    </div>
  );
}
