'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ExternalLink, Link2, Loader2, PieChart, Plus } from 'lucide-react';
import { toast } from 'sonner';
import type { LookerDashboardLibraryItem } from '@/lib/delivery/types';
import {
  DeliveryLinkRequestDialog,
  type LinkableRequest,
} from '@/components/delivery/delivery-link-request-dialog';

type Props = {
  initialItems: LookerDashboardLibraryItem[];
  dashboardRequests: LinkableRequest[];
};

export function LookerLibraryManager({ initialItems, dashboardRequests }: Props) {
  const [items, setItems] = useState(initialItems);
  const [saving, setSaving] = useState(false);
  const [linkItem, setLinkItem] = useState<LookerDashboardLibraryItem | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [dashboardUrl, setDashboardUrl] = useState('');
  const [description, setDescription] = useState('');

  async function createItem() {
    if (!title.trim() || !dashboardUrl.trim()) {
      toast.error('Título y URL del dashboard requeridos');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/command-center/looker-dashboards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, dashboard_url: dashboardUrl, description }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      const row = await res.json();
      setItems((prev) => [row, ...prev]);
      setTitle('');
      setDashboardUrl('');
      setDescription('');
      setFormOpen(false);
      toast.success('Dashboard guardado en biblioteca');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <p className="text-sm text-muted-foreground max-w-xl">
          Guarda enlaces de Looker Studio y vincúlalos a pedidos de tipo dashboard o reporte.
        </p>
        <Button size="sm" className="glow-aero gap-1.5" onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4" />
          Nuevo dashboard
        </Button>
        <Dialog open={formOpen} onOpenChange={setFormOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Dashboard Looker Studio</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1">
                <Label>Título</Label>
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej. Embudo Growth Q2" />
              </div>
              <div className="space-y-1">
                <Label>URL del reporte</Label>
                <Input
                  value={dashboardUrl}
                  onChange={(e) => setDashboardUrl(e.target.value)}
                  placeholder="https://lookerstudio.google.com/..."
                />
              </div>
              <div className="space-y-1">
                <Label>Descripción (opcional)</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                />
              </div>
              <Button className="w-full" disabled={saving} onClick={createItem}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Guardar'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.filter((i) => i.is_active).map((item) => (
          <Card key={item.id} className="bg-card/30 border-border/40">
            <CardHeader className="pb-2">
              <div className="flex items-start gap-2">
                <PieChart className="h-5 w-5 text-primary shrink-0" />
                <div className="min-w-0">
                  <CardTitle className="text-base leading-snug">{item.title}</CardTitle>
                  {item.description && (
                    <CardDescription className="line-clamp-2 mt-1">{item.description}</CardDescription>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" asChild>
                <a href={item.dashboard_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                  Abrir
                </a>
              </Button>
              <Button size="sm" onClick={() => setLinkItem(item)}>
                <Link2 className="mr-1.5 h-3.5 w-3.5" />
                Vincular a pedido
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {items.filter((i) => i.is_active).length === 0 && (
        <p className="text-center text-muted-foreground py-12 text-sm">
          Aún no hay dashboards en la biblioteca.
        </p>
      )}

      {linkItem && (
        <DeliveryLinkRequestDialog
          open={Boolean(linkItem)}
          onOpenChange={(o) => !o && setLinkItem(null)}
          kind="looker_dashboard"
          title={linkItem.title}
          url={linkItem.dashboard_url}
          libraryLookerId={linkItem.id}
          requests={dashboardRequests}
        />
      )}
    </>
  );
}
