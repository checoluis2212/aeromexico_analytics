'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { CapacityAdvice } from '@/lib/request-acceptance';
import { DECISION_LABELS, type SergioDecision } from '@/lib/request-acceptance';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Brain, CheckCircle2, Loader2, Sparkles, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type Props = {
  requestId: string;
  decision: SergioDecision;
  committedDueDate: string | null;
  sergioNotes: string | null;
  decidedAt: string | null;
  cachedAdvice?: CapacityAdvice | null;
};

export function RequestAcceptancePanel({
  requestId,
  decision,
  committedDueDate,
  sergioNotes,
  decidedAt,
  cachedAdvice,
}: Props) {
  const router = useRouter();
  const [dueDate, setDueDate] = useState(committedDueDate ?? '');
  const [notes, setNotes] = useState(sergioNotes ?? '');
  const [advice, setAdvice] = useState<CapacityAdvice | null>(cachedAdvice ?? null);
  const [loadingAdvice, setLoadingAdvice] = useState(false);
  const [submitting, setSubmitting] = useState<'accepted' | 'rejected' | null>(null);

  async function loadAdvice() {
    setLoadingAdvice(true);
    try {
      const res = await fetch(`/api/requests/${requestId}/capacity-advice`);
      if (!res.ok) throw new Error('No se pudo analizar');
      const data = (await res.json()) as CapacityAdvice;
      setAdvice(data);
      if (!dueDate && data.suggested_due_date) setDueDate(data.suggested_due_date);
    } catch {
      toast.error('Error al consultar capacidad');
    } finally {
      setLoadingAdvice(false);
    }
  }

  async function submit(dec: 'accepted' | 'rejected') {
    setSubmitting(dec);
    try {
      const res = await fetch(`/api/requests/${requestId}/acceptance`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision: dec,
          committed_due_date: dec === 'accepted' ? dueDate : null,
          sergio_notes: notes.trim() || null,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Error al guardar');
      toast.success(dec === 'accepted' ? 'Pedido aceptado — solicitante notificado' : 'Pedido rechazado');
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error');
    } finally {
      setSubmitting(null);
    }
  }

  if (decision !== 'pending') {
    return (
      <Card className="border-border/60 bg-card/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            {decision === 'accepted' ? (
              <CheckCircle2 className="h-4 w-4 text-radar" />
            ) : (
              <XCircle className="h-4 w-4 text-destructive" />
            )}
            {DECISION_LABELS[decision]}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2 text-muted-foreground">
          {committedDueDate && (
            <p>
              <span className="text-foreground font-medium">Fecha comprometida:</span>{' '}
              {format(new Date(committedDueDate), "d MMM yyyy", { locale: es })}
            </p>
          )}
          {sergioNotes && <p>{sergioNotes}</p>}
          {decidedAt && (
            <p className="text-xs">
              Decidido el {format(new Date(decidedAt), "d MMM yyyy HH:mm", { locale: es })}
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  const recColor = {
    accept: 'text-radar border-radar/30 bg-radar/5',
    defer: 'text-signal border-signal/30 bg-signal/5',
    reject: 'text-destructive border-destructive/30 bg-destructive/5',
  };

  return (
    <Card className="border-primary/25 bg-primary/[0.03]">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          ¿Puedes tomarlo? — tú decides el tiempo
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Revisa el pedido, consulta la IA de capacidad y acepta con fecha o rechaza.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={loadAdvice}
          disabled={loadingAdvice}
          className="gap-2"
        >
          {loadingAdvice ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Brain className="h-3.5 w-3.5" />
          )}
          Analizar capacidad (IA + cola actual)
        </Button>

        {advice && (
          <div className={cn('rounded-lg border p-3 text-sm space-y-2', recColor[advice.recommendation])}>
            <div className="flex items-center justify-between gap-2">
              <p className="font-medium">{advice.summary}</p>
              <Badge variant="outline" className="text-[10px] shrink-0">
                {advice.source === 'openai' ? 'IA' : 'Reglas'} · {advice.confidence}
              </Badge>
            </div>
            <ul className="text-xs space-y-1 opacity-90 list-disc pl-4">
              {advice.reasoning.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
            <p className="text-xs">
              Cola: {advice.workload.openTotal} activos · {advice.workload.urgentOpen} urgentes · semáforo{' '}
              {advice.workload.capacity}
            </p>
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="committed-due">Fecha en la que lo entregas</Label>
            <Input
              id="committed-due"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="sergio-notes">Nota para el solicitante (opcional)</Label>
          <Textarea
            id="sergio-notes"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ej. Empiezo el martes; necesito acceso a GTM de staging"
          />
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          <Button
            type="button"
            className="bg-radar hover:bg-radar/90 gap-2"
            disabled={!!submitting || !dueDate}
            onClick={() => submit('accepted')}
          >
            {submitting === 'accepted' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            Aceptar con esta fecha
          </Button>
          <Button
            type="button"
            variant="outline"
            className="border-destructive/40 text-destructive hover:bg-destructive/10 gap-2"
            disabled={!!submitting}
            onClick={() => submit('rejected')}
          >
            {submitting === 'rejected' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            No puedo ahora
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
