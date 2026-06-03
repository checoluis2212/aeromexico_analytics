import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { publicRequestLabel } from '@/lib/request-acceptance';
import { clientRequestLabel } from '@/lib/requests/client-board';
import {
  deliveryStatusLabel,
  getSergioQueue,
  isOverdueDueDate,
  isWaitingTooLong,
} from '@/lib/requests/inbox-queue';
import { priorityLabels, requestTypeLabels } from '@/lib/constants';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { ExternalLink, Clock, ChevronRight, Calendar, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MisPedidosAiEntry } from '@/components/my-requests/mis-pedidos-ai-entry';

export interface MyRequestRow {
  id: string;
  reference_code?: string | null;
  title: string;
  type: string;
  priority: string;
  status: string;
  delivery_status: string | null;
  company: string | null;
  created_at: string;
  external_url: string | null;
  requester_name?: string;
  requester_email?: string;
  sergio_decision?: string | null;
  committed_due_date?: string | null;
}

const DONE_STATUSES = new Set(['done', 'completed', 'cancelled']);

const priorityDot: Record<string, string> = {
  p0_critical: 'bg-destructive',
  p1_high: 'bg-signal',
  p2_medium: 'bg-primary',
  p3_low: 'bg-muted-foreground/50',
};

function initials(name?: string, email?: string) {
  if (name?.trim()) {
    const parts = name.trim().split(/\s+/);
    return (parts[0][0] + (parts[1]?.[0] ?? '')).toUpperCase();
  }
  return (email?.[0] ?? '?').toUpperCase();
}

export function isRequestPending(r: MyRequestRow) {
  const s = r.delivery_status ?? r.status;
  return !DONE_STATUSES.has(s);
}

export function RequestCard({
  request,
  detailHref,
  mode = 'client',
}: {
  request: MyRequestRow;
  detailHref?: string;
  mode?: 'client' | 'sergio';
}) {
  const decision = (request.sergio_decision ?? 'pending') as 'pending' | 'accepted' | 'rejected';
  const queue = mode === 'sergio' ? getSergioQueue(request) : null;
  const overdue = mode === 'sergio' && decision === 'accepted' && isOverdueDueDate(request.committed_due_date);
  const waitingLong = mode === 'sergio' && decision === 'pending' && isWaitingTooLong(request.created_at);

  const statusLabel =
    mode === 'sergio' && decision === 'accepted'
      ? deliveryStatusLabel(request.delivery_status ?? request.status)
      : mode === 'client'
        ? clientRequestLabel(request.delivery_status ?? request.status, decision)
        : publicRequestLabel(request.delivery_status ?? request.status, decision);

  const pending = isRequestPending(request) && decision !== 'rejected';
  const href = detailHref ?? `/mis-pedidos/${request.id}`;

  const borderAccent =
    mode === 'sergio'
      ? queue === 'needs_accept'
        ? 'border-l-signal'
        : overdue
          ? 'border-l-destructive'
          : queue === 'active'
            ? 'border-l-primary'
            : queue === 'rejected'
              ? 'border-l-muted-foreground/40'
              : 'border-l-radar/50'
      : pending
        ? 'border-l-primary'
        : '';

  return (
    <Card
      className={cn(
        'relative overflow-hidden glass-card transition-all duration-200 group/card',
        'hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5',
        borderAccent && `border-l-[3px] ${borderAccent}`,
        overdue && 'ring-1 ring-destructive/20'
      )}
    >
      <Link href={href} className="block">
        <CardContent className="py-4 pl-4">
          <div className="flex items-start gap-3">
            {(request.requester_name || request.requester_email) && (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold ring-1 ring-primary/20">
                {initials(request.requester_name, request.requester_email)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  {request.reference_code && (
                    <p className="text-[10px] font-mono text-primary/90 mb-1 pl-3.5 tracking-wide">
                      {request.reference_code}
                    </p>
                  )}
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'h-1.5 w-1.5 rounded-full shrink-0',
                        priorityDot[request.priority] ?? 'bg-muted-foreground'
                      )}
                    />
                    <p className="font-medium text-sm line-clamp-2 group-hover/card:text-primary transition-colors">
                      {request.title}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5 pl-3.5">
                    {requestTypeLabels[request.type] ?? request.type}
                    {request.company ? ` · ${request.company}` : ''}
                    {request.requester_name ? ` · ${request.requester_name}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 flex-col items-end">
                  {mode === 'sergio' && decision === 'pending' && (
                    <Badge variant="outline" className="text-[9px] border-signal/40 text-signal">
                      Falta tu respuesta
                    </Badge>
                  )}
                  {mode === 'sergio' && decision === 'rejected' && (
                    <Badge variant="outline" className="text-[9px] border-muted-foreground/40">
                      Rechazado
                    </Badge>
                  )}
                  {mode === 'client' && decision === 'pending' && (
                    <Badge variant="outline" className="text-[9px] border-signal/40 text-signal">
                      Lo reviso
                    </Badge>
                  )}
                  <Badge
                    variant={
                      decision === 'rejected' || !pending ? 'secondary' : 'default'
                    }
                    className="text-[10px]"
                  >
                    {statusLabel}
                  </Badge>
                  <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover/card:opacity-100 transition-opacity" />
                </div>
              </div>

              <div className="mt-3 text-xs text-muted-foreground leading-relaxed">
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3 w-3 shrink-0" />
                  {formatDistanceToNow(new Date(request.created_at), { addSuffix: true, locale: es })}
                </span>
                <span className="mx-1.5 text-border">·</span>
                <span className="font-medium text-foreground/80">
                  {priorityLabels[request.priority] ?? request.priority}
                </span>
                {mode === 'sergio' && request.committed_due_date && decision === 'accepted' && (
                  <>
                    <span className="mx-1.5 text-border">·</span>
                    <span
                      className={cn(
                        'inline-flex items-center gap-1',
                        overdue ? 'text-destructive font-medium' : ''
                      )}
                    >
                      {overdue ? (
                        <AlertTriangle className="h-3 w-3 shrink-0" />
                      ) : (
                        <Calendar className="h-3 w-3 shrink-0" />
                      )}
                      {overdue ? 'Venció' : 'Entrega'}{' '}
                      {format(new Date(request.committed_due_date), 'd MMM', { locale: es })}
                    </span>
                  </>
                )}
                {waitingLong && (
                  <>
                    <span className="mx-1.5 text-border">·</span>
                    <span className="text-signal font-medium">más de 24 h esperando</span>
                  </>
                )}
                {request.external_url && (
                  <>
                    <span className="mx-1.5 text-border">·</span>
                    <ExternalLink className="h-3 w-3 inline text-primary align-text-bottom" />
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Link>
      {mode === 'client' && pending && (
        <div className="px-4 pb-3 -mt-1">
          <MisPedidosAiEntry variant="compact" requestId={request.id} />
        </div>
      )}
    </Card>
  );
}
