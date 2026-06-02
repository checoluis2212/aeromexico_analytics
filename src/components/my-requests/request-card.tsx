import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { publicRequestLabel } from '@/lib/request-acceptance';
import { priorityLabels, requestTypeLabels } from '@/lib/constants';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { ExternalLink, Clock, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MyRequestRow {
  id: string;
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
}: {
  request: MyRequestRow;
  detailHref?: string;
}) {
  const decision = (request.sergio_decision ?? 'pending') as 'pending' | 'accepted' | 'rejected';
  const statusLabel = publicRequestLabel(request.delivery_status ?? request.status, decision);
  const pending = isRequestPending(request) && decision !== 'rejected';
  const href = detailHref ?? `/mis-pedidos/${request.id}`;

  return (
    <Link href={href} className="block group">
      <Card className={cn(
        'relative overflow-hidden glass-card transition-all duration-200',
        'hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5',
        pending && 'border-l-[3px] border-l-primary'
      )}>
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
                  <div className="flex items-center gap-2">
                    <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', priorityDot[request.priority] ?? 'bg-muted-foreground')} />
                    <p className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
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
                  {decision === 'pending' && (
                    <Badge variant="outline" className="text-[9px] border-signal/40 text-signal">
                      Por aceptar
                    </Badge>
                  )}
                  <Badge variant={pending ? 'default' : 'secondary'} className="text-[10px]">
                    {statusLabel}
                  </Badge>
                  <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
              <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDistanceToNow(new Date(request.created_at), { addSuffix: true, locale: es })}
                </span>
                <span className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] font-normal">
                    {priorityLabels[request.priority] ?? request.priority}
                  </Badge>
                  {request.external_url && (
                    <ExternalLink className="h-3 w-3 text-primary" />
                  )}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
