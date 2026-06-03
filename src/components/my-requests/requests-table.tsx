'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { priorityLabels, requestTypeLabels } from '@/lib/constants';
import { clientRequestLabel } from '@/lib/requests/client-board';
import { isRequestPending, type MyRequestRow } from '@/components/my-requests/request-card';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronRight } from 'lucide-react';
import { MisPedidosAiEntry } from '@/components/my-requests/mis-pedidos-ai-entry';

const priorityDot: Record<string, string> = {
  p0_critical: 'bg-destructive',
  p1_high: 'bg-signal',
  p2_medium: 'bg-primary',
  p3_low: 'bg-muted-foreground/50',
};

interface RequestsTableProps {
  requests: MyRequestRow[];
  detailBasePath?: string;
  showAiActions?: boolean;
}

export function RequestsTable({
  requests,
  detailBasePath = '/mis-pedidos',
  showAiActions = false,
}: RequestsTableProps) {
  return (
    <div className="glass-card premium-border rounded-xl overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-border/40 hover:bg-transparent">
            <TableHead className="text-[11px] uppercase tracking-wide text-muted-foreground pl-4">
              Referencia
            </TableHead>
            <TableHead className="text-[11px] uppercase tracking-wide text-muted-foreground min-w-[200px]">
              Pedido
            </TableHead>
            <TableHead className="text-[11px] uppercase tracking-wide text-muted-foreground hidden sm:table-cell">
              Tipo
            </TableHead>
            <TableHead className="text-[11px] uppercase tracking-wide text-muted-foreground hidden md:table-cell">
              Área
            </TableHead>
            <TableHead className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Prioridad
            </TableHead>
            <TableHead className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Estado
            </TableHead>
            <TableHead className="text-[11px] uppercase tracking-wide text-muted-foreground hidden lg:table-cell">
              Fecha
            </TableHead>
            <TableHead className="text-[11px] uppercase tracking-wide text-muted-foreground w-[72px]">
              IA
            </TableHead>
            <TableHead className="w-8" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((r) => {
            const decision = (r.sergio_decision ?? 'pending') as 'pending' | 'accepted' | 'rejected';
            const pending = isRequestPending(r) && decision !== 'rejected';
            const statusLabel = clientRequestLabel(r.delivery_status ?? r.status, decision);
            const href = `${detailBasePath}/${r.id}`;

            return (
              <TableRow
                key={r.id}
                className={cn(
                  'border-border/30 group cursor-pointer',
                  !pending && 'opacity-75'
                )}
              >
                <TableCell className="pl-4 font-mono text-[11px] text-primary/90">
                  <Link href={href} className="hover:underline">
                    {r.reference_code ?? '—'}
                  </Link>
                </TableCell>
                <TableCell className="max-w-[280px]">
                  <Link href={href} className="block min-w-0">
                    <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                      {r.title}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 sm:hidden truncate">
                      {requestTypeLabels[r.type] ?? r.type}
                      {r.company ? ` · ${r.company}` : ''}
                    </p>
                  </Link>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground hidden sm:table-cell">
                  {requestTypeLabels[r.type] ?? r.type}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground hidden md:table-cell">
                  {r.company ?? '—'}
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-1.5 text-xs">
                    <span
                      className={cn(
                        'h-1.5 w-1.5 rounded-full shrink-0',
                        priorityDot[r.priority] ?? 'bg-muted-foreground'
                      )}
                    />
                    {priorityLabels[r.priority] ?? r.priority}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={pending ? 'default' : 'secondary'}
                    className="text-[10px] font-normal max-w-[140px] sm:max-w-[200px] truncate"
                    title={statusLabel}
                  >
                    {statusLabel}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground hidden lg:table-cell">
                  <span title={format(new Date(r.created_at), "d MMM yyyy HH:mm", { locale: es })}>
                    {formatDistanceToNow(new Date(r.created_at), { addSuffix: true, locale: es })}
                  </span>
                </TableCell>
                <TableCell>
                  {showAiActions && pending && (
                    <MisPedidosAiEntry variant="table" requestId={r.id} />
                  )}
                </TableCell>
                <TableCell className="pr-4">
                  <Link href={href} className="text-muted-foreground group-hover:text-primary transition-colors">
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
