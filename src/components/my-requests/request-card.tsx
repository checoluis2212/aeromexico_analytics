import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { mapDeliveryStatusForUser } from '@/lib/integrations/external-sync';
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
}

const DONE_STATUSES = new Set(['done', 'completed', 'cancelled']);

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
  const statusLabel = mapDeliveryStatusForUser(request.delivery_status ?? request.status);
  const pending = isRequestPending(request);
  const href = detailHref ?? `/mis-pedidos/${request.id}`;

  return (
    <Link href={href} className="block group">
      <Card className={cn(
        'relative overflow-hidden bg-card/50 border-border/60 transition-all duration-200',
        'hover:border-primary/40 hover:shadow-md hover:shadow-primary/5',
        pending && 'border-l-[3px] border-l-primary'
      )}>
        <CardContent className="py-4 pl-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                {request.title}
              </p>
              <p className="text-xs text-muted-foreground mt-1.5">
                {requestTypeLabels[request.type] ?? request.type}
                {request.company ? ` · ${request.company}` : ''}
                {request.requester_name ? ` · ${request.requester_name}` : ''}
              </p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
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
        </CardContent>
      </Card>
    </Link>
  );
}
