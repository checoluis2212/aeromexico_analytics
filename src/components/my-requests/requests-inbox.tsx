'use client';

import { useMemo, useState } from 'react';
import { RequestCard, isRequestPending, type MyRequestRow } from '@/components/my-requests/request-card';
import { RequestFilters } from '@/components/my-requests/request-filters';
import { Button } from '@/components/ui/button';
import {
  defaultFilters,
  extractAreas,
  extractRequesters,
  filterRequests,
  type RequestFilterState,
} from '@/lib/requests/filters';
import { exportRequestsCsv } from '@/lib/requests/export-csv';
import { Download } from 'lucide-react';
import { RequestSummary } from '@/components/my-requests/request-summary';

interface RequestsInboxProps {
  requests: MyRequestRow[];
  showUserFilter?: boolean;
  showExport?: boolean;
  detailBasePath?: string;
  emptyMessage?: string;
}

export function RequestsInbox({
  requests,
  showUserFilter = false,
  showExport = false,
  detailBasePath = '/mis-pedidos',
  emptyMessage = 'No hay pedidos con estos filtros.',
}: RequestsInboxProps) {
  const [filters, setFilters] = useState<RequestFilterState>(defaultFilters);

  const users = useMemo(() => extractRequesters(requests), [requests]);
  const areas = useMemo(() => extractAreas(requests), [requests]);
  const filtered = useMemo(() => filterRequests(requests, filters), [requests, filters]);

  const pending = filtered.filter(isRequestPending);
  const done = filtered.filter((r) => !isRequestPending(r));

  return (
    <div className="space-y-5">
      <RequestSummary requests={requests} />

      <RequestFilters
        filters={filters}
        onChange={setFilters}
        users={users}
        areas={areas}
        showUserFilter={showUserFilter}
      />

      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          {filtered.length} de {requests.length} pedidos
        </p>
        {showExport && filtered.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportRequestsCsv(filtered, `pedidos-${new Date().toISOString().slice(0, 10)}.csv`)}
          >
            <Download className="mr-2 h-4 w-4" />
            Exportar CSV
          </Button>
        )}
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">{emptyMessage}</p>
      ) : (
        <div className="space-y-8">
          {pending.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold mb-3">Pendientes ({pending.length})</h2>
              <div className="grid gap-3">
                {pending.map((r) => (
                  <RequestCard key={r.id} request={r} detailHref={`${detailBasePath}/${r.id}`} />
                ))}
              </div>
            </div>
          )}
          {done.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold mb-3 text-muted-foreground">
                Completados ({done.length})
              </h2>
              <div className="grid gap-3 opacity-80">
                {done.map((r) => (
                  <RequestCard key={r.id} request={r} detailHref={`${detailBasePath}/${r.id}`} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
