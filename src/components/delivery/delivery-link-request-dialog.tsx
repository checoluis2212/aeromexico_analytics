'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Link2 } from 'lucide-react';
import { toast } from 'sonner';
import type { RequestDeliveryKind } from '@/lib/delivery/types';

export type LinkableRequest = {
  id: string;
  reference_code: string | null;
  title: string;
  type: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kind: RequestDeliveryKind;
  title: string;
  url: string;
  libraryLookerId?: string | null;
  libraryGtmVideoId?: string | null;
  requests: LinkableRequest[];
  notes?: string;
};

export function DeliveryLinkRequestDialog({
  open,
  onOpenChange,
  kind,
  title,
  url,
  libraryLookerId,
  libraryGtmVideoId,
  requests,
  notes: initialNotes,
}: Props) {
  const [requestId, setRequestId] = useState('');
  const [notes, setNotes] = useState(initialNotes ?? '');
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('');

  const filtered = requests.filter((r) => {
    const q = filter.toLowerCase();
    if (!q) return true;
    return (
      r.title.toLowerCase().includes(q) ||
      (r.reference_code?.toLowerCase().includes(q) ?? false)
    );
  });

  async function handleLink() {
    if (!requestId) {
      toast.error('Elige un pedido');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/requests/${requestId}/deliveries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind,
          title,
          url,
          notes: notes.trim() || null,
          library_looker_id: libraryLookerId ?? null,
          library_gtm_video_id: libraryGtmVideoId ?? null,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? 'Error al vincular');
      toast.success('Vinculado al pedido');
      onOpenChange(false);
      setRequestId('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Vincular a un pedido</DialogTitle>
          <DialogDescription className="line-clamp-2">{title}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="delivery-filter">Buscar pedido</Label>
            <Input
              id="delivery-filter"
              placeholder="Referencia o título…"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
          <div className="max-h-48 overflow-y-auto rounded-lg border border-border/50 divide-y divide-border/40">
            {filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground p-4 text-center">
                No hay pedidos que coincidan.
              </p>
            ) : (
              filtered.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRequestId(r.id)}
                  className={`w-full text-left px-3 py-2.5 text-sm transition-colors hover:bg-secondary/40 ${
                    requestId === r.id ? 'bg-primary/10 text-primary' : ''
                  }`}
                >
                  {r.reference_code && (
                    <span className="font-mono text-[10px] text-primary block">{r.reference_code}</span>
                  )}
                  <span className="font-medium line-clamp-1">{r.title}</span>
                </button>
              ))
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="delivery-notes">Nota para el cliente (opcional)</Label>
            <Input
              id="delivery-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej. Versión validada en Preview…"
            />
          </div>
          <Button className="w-full glow-aero" disabled={saving || !requestId} onClick={handleLink}>
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Link2 className="mr-2 h-4 w-4" />
                Vincular entrega
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
