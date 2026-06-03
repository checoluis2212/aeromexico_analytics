'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ExternalLink, Loader2, PieChart, Trash2, Video } from 'lucide-react';
import { toast } from 'sonner';
import type {
  GtmDebugVideoLibraryItem,
  LookerDashboardLibraryItem,
  RequestDelivery,
  RequestDeliveryKind,
} from '@/lib/delivery/types';
import { DELIVERY_KIND_LABELS } from '@/lib/delivery/types';

type Props = {
  requestId: string;
  requestType: string;
  deliveries: RequestDelivery[];
  isInternal?: boolean;
  lookerLibrary?: LookerDashboardLibraryItem[];
  gtmLibrary?: GtmDebugVideoLibraryItem[];
};

export function RequestDeliveriesSection({
  requestId,
  requestType,
  deliveries: initial,
  isInternal = false,
  lookerLibrary = [],
  gtmLibrary = [],
}: Props) {
  const router = useRouter();
  const [deliveries, setDeliveries] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [lookerPick, setLookerPick] = useState('');
  const [gtmPick, setGtmPick] = useState('');

  const lookerItems = deliveries.filter((d) => d.kind === 'looker_dashboard');
  const gtmItems = deliveries.filter((d) => d.kind === 'gtm_debug_video');
  const showLooker =
    !isInternal ||
    ['dashboard', 'reporting', 'funnel'].includes(requestType) ||
    lookerItems.length > 0;
  const showGtm =
    !isInternal ||
    ['tracking', 'qa', 'funnel'].includes(requestType) ||
    gtmItems.length > 0;

  if (isInternal && !showLooker && !showGtm && deliveries.length === 0) return null;

  async function attachFromLibrary(kind: RequestDeliveryKind, item: { title: string; url: string; lookerId?: string; gtmId?: string }) {
    setSaving(true);
    try {
      const res = await fetch(`/api/requests/${requestId}/deliveries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind,
          title: item.title,
          url: item.url,
          library_looker_id: item.lookerId ?? null,
          library_gtm_video_id: item.gtmId ?? null,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      const row = await res.json();
      setDeliveries((prev) => [row, ...prev]);
      toast.success('Entrega añadida al pedido');
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error');
    } finally {
      setSaving(false);
    }
  }

  async function removeDelivery(deliveryId: string) {
    setSaving(true);
    try {
      const res = await fetch(
        `/api/requests/${requestId}/deliveries?deliveryId=${deliveryId}`,
        { method: 'DELETE' }
      );
      if (!res.ok) throw new Error((await res.json()).error);
      setDeliveries((prev) => prev.filter((d) => d.id !== deliveryId));
      toast.success('Entrega quitada');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error');
    } finally {
      setSaving(false);
    }
  }

  function renderList(items: RequestDelivery[], icon: React.ReactNode) {
    if (items.length === 0) {
      return (
        <p className="text-sm text-muted-foreground py-2">
          {isInternal
            ? 'Aún sin enlaces en este pedido.'
            : 'Aún no hay archivos. Cuando Sergio termine, aparecerán aquí los enlaces y videos — quedan guardados en tu pedido.'}
        </p>
      );
    }
    return (
      <ul className="space-y-2">
        {items.map((d) => (
          <li
            key={d.id}
            className="flex items-start gap-3 rounded-lg border border-border/50 bg-secondary/20 px-3 py-2.5"
          >
            <span className="mt-0.5 text-primary shrink-0">{icon}</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{d.title}</p>
              {d.notes && (
                <p className="text-xs text-muted-foreground mt-0.5">{d.notes}</p>
              )}
              <a
                href={d.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary mt-1.5 hover:underline"
              >
                {d.kind === 'gtm_debug_video' ? 'Ver video testigo' : 'Abrir dashboard'}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            {isInternal && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                disabled={saving}
                onClick={() => removeDelivery(d.id)}
                aria-label="Quitar entrega"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <Card className="bg-card/40 border-border/60">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">
          {isInternal ? 'Entregables' : 'Archivo de este pedido'}
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          {isInternal ? (
            'Dashboards Looker y videos GTM Preview — vincula al pedido para que el cliente los vea en su portal.'
          ) : (
            <>
              Aquí queda guardado lo que Sergio te entrega: dashboards Looker y videos de prueba GTM.
              También en el menú{' '}
              <Link href="/mis-pedidos/archivo" className="text-primary hover:underline">
                Mis entregas
              </Link>
              .
            </>
          )}
        </p>
        {!isInternal && (
          <Button variant="link" size="sm" className="h-auto p-0 text-xs text-primary" asChild>
            <Link href="/mis-pedidos/archivo">Ver todo mi archivo →</Link>
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-5">
        {showLooker && (
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <PieChart className="h-3.5 w-3.5 text-primary" />
              {DELIVERY_KIND_LABELS.looker_dashboard}
            </p>
            {isInternal && lookerLibrary.length > 0 && (
              <div className="flex flex-wrap gap-2 items-end">
                <div className="flex-1 min-w-[200px] space-y-1">
                  <Label className="text-xs">Desde biblioteca Looker</Label>
                  <Select value={lookerPick} onValueChange={(v) => setLookerPick(v ?? '')}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Elegir dashboard…" />
                    </SelectTrigger>
                    <SelectContent>
                      {lookerLibrary.filter((l) => l.is_active).map((l) => (
                        <SelectItem key={l.id} value={l.id}>
                          {l.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!lookerPick || saving}
                  onClick={() => {
                    const item = lookerLibrary.find((l) => l.id === lookerPick);
                    if (!item) return;
                    void attachFromLibrary('looker_dashboard', {
                      title: item.title,
                      url: item.dashboard_url,
                      lookerId: item.id,
                    });
                    setLookerPick('');
                  }}
                >
                  Añadir
                </Button>
                <Button size="sm" variant="ghost" asChild>
                  <Link href="/command-center/looker-dashboards">Biblioteca →</Link>
                </Button>
              </div>
            )}
            {renderList(lookerItems, <PieChart className="h-4 w-4" />)}
          </div>
        )}

        {showGtm && (
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Video className="h-3.5 w-3.5 text-radar" />
              {DELIVERY_KIND_LABELS.gtm_debug_video}
            </p>
            {isInternal && gtmLibrary.length > 0 && (
              <div className="flex flex-wrap gap-2 items-end">
                <div className="flex-1 min-w-[200px] space-y-1">
                  <Label className="text-xs">Desde biblioteca GTM Debug</Label>
                  <Select value={gtmPick} onValueChange={(v) => setGtmPick(v ?? '')}>
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Elegir video…" />
                    </SelectTrigger>
                    <SelectContent>
                      {gtmLibrary.filter((l) => l.is_active).map((l) => (
                        <SelectItem key={l.id} value={l.id}>
                          {l.title}
                          {l.event_name ? ` · ${l.event_name}` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!gtmPick || saving}
                  onClick={() => {
                    const item = gtmLibrary.find((l) => l.id === gtmPick);
                    if (!item) return;
                    void attachFromLibrary('gtm_debug_video', {
                      title: item.title,
                      url: item.video_url,
                      gtmId: item.id,
                    });
                    setGtmPick('');
                  }}
                >
                  Añadir
                </Button>
                <Button size="sm" variant="ghost" asChild>
                  <Link href="/command-center/gtm-videos">Biblioteca →</Link>
                </Button>
              </div>
            )}
            {renderList(gtmItems, <Video className="h-4 w-4" />)}
          </div>
        )}

        {isInternal && saving && (
          <p className="text-xs text-muted-foreground flex items-center gap-2">
            <Loader2 className="h-3 w-3 animate-spin" />
            Guardando…
          </p>
        )}
      </CardContent>
    </Card>
  );
}
