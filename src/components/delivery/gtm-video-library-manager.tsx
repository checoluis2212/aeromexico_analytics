'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ExternalLink, Link2, Loader2, Plus, Video } from 'lucide-react';
import { toast } from 'sonner';
import type { GtmDebugVideoLibraryItem } from '@/lib/delivery/types';
import {
  DeliveryLinkRequestDialog,
  type LinkableRequest,
} from '@/components/delivery/delivery-link-request-dialog';

type Props = {
  initialItems: GtmDebugVideoLibraryItem[];
  trackingRequests: LinkableRequest[];
};

export function GtmVideoLibraryManager({ initialItems, trackingRequests }: Props) {
  const [items, setItems] = useState(initialItems);
  const [saving, setSaving] = useState(false);
  const [linkItem, setLinkItem] = useState<GtmDebugVideoLibraryItem | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [eventName, setEventName] = useState('');
  const [description, setDescription] = useState('');

  async function createItem() {
    if (!title.trim() || !videoUrl.trim()) {
      toast.error('Título y URL del video requeridos');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/command-center/gtm-videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          video_url: videoUrl,
          event_name: eventName,
          description,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      const row = await res.json();
      setItems((prev) => [row, ...prev]);
      setTitle('');
      setVideoUrl('');
      setEventName('');
      setDescription('');
      setFormOpen(false);
      toast.success('Video guardado en biblioteca');
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
          Graba o enlaza videos del GTM Preview / Tag Assistant como testigo de que el evento
          dispara correctamente, y vincúlalos a pedidos de tracking.
        </p>
        <Button size="sm" className="glow-aero gap-1.5" onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4" />
          Nuevo video
        </Button>
        <Dialog open={formOpen} onOpenChange={setFormOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Video GTM Debug / Preview</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1">
                <Label>Título</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej. purchase — Preview container"
                />
              </div>
              <div className="space-y-1">
                <Label>Evento (opcional)</Label>
                <Input
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  placeholder="purchase"
                />
              </div>
              <div className="space-y-1">
                <Label>URL del video</Label>
                <Input
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="Loom, Drive, YouTube…"
                />
              </div>
              <div className="space-y-1">
                <Label>Notas (opcional)</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Container, entorno Preview, fecha de grabación…"
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
                <Video className="h-5 w-5 text-radar shrink-0" />
                <div className="min-w-0">
                  <CardTitle className="text-base leading-snug">{item.title}</CardTitle>
                  {item.event_name && (
                    <p className="text-[11px] font-mono text-primary mt-0.5">{item.event_name}</p>
                  )}
                  {item.description && (
                    <CardDescription className="line-clamp-2 mt-1">{item.description}</CardDescription>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" asChild>
                <a href={item.video_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                  Ver video
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
          Aún no hay videos en la biblioteca.
        </p>
      )}

      {linkItem && (
        <DeliveryLinkRequestDialog
          open={Boolean(linkItem)}
          onOpenChange={(o) => !o && setLinkItem(null)}
          kind="gtm_debug_video"
          title={linkItem.title}
          url={linkItem.video_url}
          libraryGtmVideoId={linkItem.id}
          requests={trackingRequests}
          notes={linkItem.event_name ? `Evento: ${linkItem.event_name}` : undefined}
        />
      )}
    </>
  );
}
