'use client';

import { useMemo, useState } from 'react';
import { RequestFilters } from '@/components/my-requests/request-filters';
import { RequestsTable } from '@/components/my-requests/requests-table';
import { Button } from '@/components/ui/button';
import {
  defaultFilters,
  extractAreas,
  extractRequesters,
  filterRequests,
  type RequestFilterState,
} from '@/lib/requests/filters';
import { exportRequestsCsv } from '@/lib/requests/export-csv';
import { Download, Sparkles } from 'lucide-react';
import { MisPedidosAiCoachmark } from '@/components/my-requests/mis-pedidos-ai-coachmark';
import { RequestSummary } from '@/components/my-requests/request-summary';
import type { MyRequestRow } from '@/components/my-requests/request-card';

interface RequestsInboxProps {
  requests: MyRequestRow[];
  showUserFilter?: boolean;
  showExport?: boolean;
  detailBasePath?: string;
  emptyMessage?: string;
  showAiActions?: boolean;
}

export function RequestsInbox({
  requests,
  showUserFilter = false,
  showExport = false,
  detailBasePath = '/mis-pedidos',
  emptyMessage = 'No hay pedidos con estos filtros.',
  showAiActions = false,
}: RequestsInboxProps) {
  const [filters, setFilters] = useState<RequestFilterState>(defaultFilters);

  const users = useMemo(() => extractRequesters(requests), [requests]);
  const areas = useMemo(() => extractAreas(requests), [requests]);
  const filtered = useMemo(() => filterRequests(requests, filters), [requests, filters]);

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

      {showAiActions && (
        <>
          <MisPedidosAiCoachmark />
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
          En pedidos activos, la columna <span className="font-medium text-foreground/80">IA</span> abre el copiloto con contexto de ese pedido.
        </p>
        </>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
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
        <RequestsTable
          requests={filtered}
          detailBasePath={detailBasePath}
          showAiActions={showAiActions}
        />
      )}
    </div>
  );
}
