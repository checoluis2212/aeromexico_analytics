'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RequestStatusTracker } from '@/components/my-requests/request-status-tracker';
import { CommentThread, type Comment } from '@/components/my-requests/comment-thread';
import { mapDeliveryStatusForUser } from '@/lib/integrations/external-sync';
import { priorityLabels, requestTypeLabels, siteConfig } from '@/lib/constants';
import { DELIVERY_STATUSES, type DeliveryStatus } from '@/types/command-center';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ArrowLeft, ExternalLink, Loader2, User, Calendar, Building2 } from 'lucide-react';
import { toast } from 'sonner';

export interface RequestDetail {
  id: string;
  title: string;
  description: string;
  type: string;
  priority: string;
  status: string;
  delivery_status: string | null;
  company: string | null;
  requester_name: string;
  requester_email: string;
  created_at: string;
  updated_at: string;
  external_url: string | null;
  external_provider: string | null;
}

interface RequestDetailPanelProps {
  request: RequestDetail;
  comments: Comment[];
  backHref: string;
  currentUserId?: string;
  isInternal?: boolean;
}

export function RequestDetailPanel({
  request,
  comments,
  backHref,
  currentUserId,
  isInternal = false,
}: RequestDetailPanelProps) {
  const router = useRouter();
  const status = request.delivery_status ?? request.status;
  const [deliveryStatus, setDeliveryStatus] = useState(status);
  const [saving, setSaving] = useState(false);

  async function updateStatus(next: DeliveryStatus) {
    setSaving(true);
    try {
      const res = await fetch(`/api/requests/${request.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ delivery_status: next }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setDeliveryStatus(next);
      toast.success('Estado actualizado — el usuario fue notificado');
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al actualizar');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href={backHref}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Link>
      </Button>

      {/* Header card */}
      <Card className="bg-card/40 border-border/60 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-primary/60 via-primary to-radar/60" />
        <CardHeader className="pb-2">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="text-lg leading-snug">{request.title}</CardTitle>
              <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-3 flex-wrap">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(request.created_at), "d MMM yyyy", { locale: es })}
                </span>
                {request.company && (
                  <span className="flex items-center gap-1">
                    <Building2 className="h-3 w-3" />
                    {request.company}
                  </span>
                )}
              </p>
            </div>
            <Badge className="shrink-0">{mapDeliveryStatusForUser(deliveryStatus)}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <RequestStatusTracker status={deliveryStatus} />

          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{priorityLabels[request.priority]}</Badge>
            <Badge variant="secondary">{requestTypeLabels[request.type] ?? request.type}</Badge>
          </div>

          <p className="text-sm leading-relaxed text-muted-foreground">{request.description}</p>

          {isInternal && (
            <div className="flex flex-wrap items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border/40">
              <User className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="text-sm min-w-0">
                <p className="font-medium">{request.requester_name}</p>
                <p className="text-xs text-muted-foreground">{request.requester_email}</p>
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <Select
                  value={deliveryStatus}
                  onValueChange={(v) => updateStatus(v as DeliveryStatus)}
                  disabled={saving}
                >
                  <SelectTrigger className="h-8 w-44 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DELIVERY_STATUSES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              </div>
            </div>
          )}

          {request.external_url && (
            <Button variant="outline" size="sm" asChild>
              <a href={request.external_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Ver en {request.external_provider === 'jira' ? 'Jira' : 'Trello'}
              </a>
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Comments */}
      <Card className="bg-card/40 border-border/60">
        <CardContent className="pt-6">
          <CommentThread
            requestId={request.id}
            initialComments={comments}
            currentUserId={currentUserId}
            canPostInternal={isInternal}
          />
        </CardContent>
      </Card>

      {!isInternal && (
        <p className="text-center text-xs text-muted-foreground pb-4">
          {siteConfig.author} te notificará cuando haya cambios en este pedido.
        </p>
      )}
    </div>
  );
}
