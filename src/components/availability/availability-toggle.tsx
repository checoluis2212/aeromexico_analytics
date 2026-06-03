'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  CAPACITY_CONFIG,
  CAPACITY_ORDER,
  type SergioAvailability,
  type SergioCapacity,
} from '@/lib/availability-config';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { useTrackEvent } from '@/components/analytics/analytics-context';

const OPTIONS: SergioCapacity[] = [...CAPACITY_ORDER];

type Props = {
  initial: SergioAvailability;
};

export function AvailabilityToggle({ initial }: Props) {
  const track = useTrackEvent();
  const [availability, setAvailability] = useState(initial);
  const [note, setNote] = useState(initial.note ?? '');
  const [saving, setSaving] = useState(false);

  async function save(capacity: SergioCapacity) {
    setSaving(true);
    try {
      const res = await fetch('/api/availability', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ capacity, note: note.trim() || null }),
      });
      if (!res.ok) throw new Error('No se pudo guardar');
      const data = (await res.json()) as SergioAvailability;
      setAvailability(data);
      track('cc_semaphore_change', { status: capacity });
      toast.success(`Semáforo → ${CAPACITY_CONFIG[capacity].label}`);
    } catch {
      toast.error('Error al actualizar el semáforo');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl border border-border/50 bg-card/30 p-4 space-y-4">
      <div>
        <p className="text-sm font-semibold">Semáforo de capacidad</p>
        <p className="text-xs text-muted-foreground mt-1">
          Lo ven en Inicio, Cómo trabajo y Pedir a Sergio. Actual:{' '}
          <span className="text-foreground font-medium">
            {CAPACITY_CONFIG[availability.capacity].label}
          </span>
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {OPTIONS.map((key) => {
          const cfg = CAPACITY_CONFIG[key];
          const active = availability.capacity === key;
          return (
            <Button
              key={key}
              type="button"
              size="sm"
              variant={active ? 'default' : 'outline'}
              disabled={saving}
              className={cn(
                'h-9 gap-2',
                active && key === 'available' && 'bg-radar hover:bg-radar/90',
                active && key === 'oof' && 'bg-muted-foreground hover:bg-muted-foreground/90 text-background'
              )}
              onClick={() => save(key)}
            >
              <span
                className={cn('h-2 w-2 rounded-full', cfg.dotClass)}
                aria-hidden
              />
              {cfg.label}
            </Button>
          );
        })}
        {saving && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground self-center" />}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="availability-note" className="text-xs text-muted-foreground">
          Nota opcional (ej. &quot;De vuelta el jueves&quot;)
        </label>
        <Textarea
          id="availability-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          className="text-sm resize-none"
          placeholder={CAPACITY_CONFIG[availability.capacity].hint}
          onBlur={() => {
            if (note.trim() !== (availability.note ?? '')) save(availability.capacity);
          }}
        />
      </div>
    </div>
  );
}
