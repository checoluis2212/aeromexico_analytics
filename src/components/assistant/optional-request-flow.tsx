'use client';

import Link from 'next/link';
import {
  ClipboardList,
  Loader2,
  X,
  ArrowRight,
  CheckCircle2,
  Pencil,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { requestPriorities, requestTypes } from '@/lib/constants';
import type { AssistantRequestDraft } from '@/lib/ai/assistant-request-flow';
import { cn } from '@/lib/utils';

export type RequestFlowStep = 'idle' | 'collect' | 'review' | 'sent';

type CreatedRequest = {
  id: string;
  reference_code: string | null;
  title?: string;
};

type Props = {
  step: RequestFlowStep;
  collectText: string;
  onCollectTextChange: (value: string) => void;
  draft: AssistantRequestDraft | null;
  loading: boolean;
  disabled: boolean;
  disabledReason?: string;
  createdRequest: CreatedRequest | null;
  onOpenCollect: () => void;
  onClose: () => void;
  contextHint?: string | null;
  onBuildDraft: () => void;
  onConfirm: () => void;
  onEditDraft: () => void;
  onCancelDraft: () => void;
};

function typeLabel(type: string) {
  return requestTypes.find((t) => t.value === type)?.label ?? type;
}

function priorityLabel(priority: string) {
  return requestPriorities.find((p) => p.value === priority)?.label ?? priority;
}

export function OptionalRequestFlow({
  step,
  collectText,
  onCollectTextChange,
  draft,
  loading,
  disabled,
  disabledReason,
  createdRequest,
  contextHint,
  onOpenCollect,
  onClose,
  onBuildDraft,
  onConfirm,
  onEditDraft,
  onCancelDraft,
}: Props) {
  if (step === 'idle') {
    return (
      <div className="rounded-xl border border-border/50 bg-secondary/20 px-3 py-2.5 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-foreground/90">¿Ya quieres que Sergio lo haga?</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Pedir es <strong className="font-medium">opcional</strong> — armamos un borrador y tú confirmas antes de enviar.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9 shrink-0 gap-1.5 border-primary/35 hover:bg-primary/5"
          disabled={disabled}
          title={disabledReason}
          onClick={onOpenCollect}
        >
          <ClipboardList className="h-3.5 w-3.5" />
          Pedir desde aquí
        </Button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'rounded-xl border overflow-hidden transition-all',
        step === 'sent'
          ? 'border-radar/30 bg-radar/[0.06]'
          : 'border-primary/25 bg-gradient-to-b from-primary/[0.06] to-transparent'
      )}
    >
      <div className="flex items-start justify-between gap-2 px-4 py-3 border-b border-border/40">
        <div className="min-w-0">
          <p className="text-sm font-semibold flex items-center gap-2">
            {step === 'sent' ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-radar shrink-0" />
                Pedido enviado
              </>
            ) : step === 'review' ? (
              'Revisa tu borrador'
            ) : (
              <>
                <ClipboardList className="h-4 w-4 text-primary shrink-0" />
                Pedir a Sergio
              </>
            )}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {step === 'sent'
              ? 'Sergio lo verá en su cola. Puedes seguir preguntando aquí.'
              : step === 'review'
                ? 'Nada se envía hasta que pulses Enviar pedido.'
                : 'Cuéntame qué necesitas — te muestro un borrador para confirmar.'}
          </p>
        </div>
        {step !== 'sent' && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 text-muted-foreground"
            aria-label="Cerrar"
            disabled={loading}
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="p-4 space-y-3">
        {step === 'collect' && (
          <>
            {contextHint && (
              <p className="text-[11px] text-primary/90 bg-primary/[0.06] border border-primary/20 rounded-lg px-3 py-2">
                {contextHint} — revisa y edita antes de enviar.
              </p>
            )}
            <div className="space-y-2">
              <label htmlFor="request-collect" className="text-xs font-medium text-foreground/80">
                ¿Qué necesitas?
              </label>
              <Textarea
                id="request-collect"
                value={collectText}
                onChange={(e) => onCollectTextChange(e.target.value)}
                placeholder="Ej: Embudo del checkout web — vemos caída en el paso de pago desde la campaña de primavera. Lo necesito esta semana."
                className="min-h-[88px] text-sm rounded-lg bg-background/80"
                disabled={loading || disabled}
              />
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                Incluye qué quieres lograr, dónde (web, app, GA4…) y urgencia si aplica.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                className="glow-aero"
                disabled={loading || disabled || collectText.trim().length < 12}
                onClick={onBuildDraft}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                    Armando borrador…
                  </>
                ) : (
                  'Armar borrador'
                )}
              </Button>
              <Button type="button" size="sm" variant="outline" asChild>
                <Link href="/pedir">
                  Pedir con IA
                  <ExternalLink className="ml-2 h-3 w-3 opacity-60" />
                </Link>
              </Button>
            </div>
            {disabled && disabledReason && (
              <p className="text-[11px] text-signal">{disabledReason}</p>
            )}
          </>
        )}

        {step === 'review' && draft && (
          <>
            <dl className="space-y-2.5 text-sm rounded-lg border border-border/40 bg-background/50 p-3">
              <div>
                <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">Título</dt>
                <dd className="font-medium mt-0.5">{draft.title}</dd>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">Tipo</dt>
                  <dd className="mt-0.5">{typeLabel(draft.type ?? 'dashboard')}</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">Urgencia</dt>
                  <dd className="mt-0.5">{priorityLabel(draft.priority ?? 'p2_medium')}</dd>
                </div>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">Detalle</dt>
                <dd className="mt-0.5 text-muted-foreground text-xs leading-relaxed whitespace-pre-wrap">
                  {draft.description.slice(0, 400)}
                  {draft.description.length > 400 ? '…' : ''}
                </dd>
              </div>
            </dl>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                className="glow-aero"
                disabled={loading}
                onClick={onConfirm}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                    Enviando…
                  </>
                ) : (
                  'Enviar pedido a Sergio'
                )}
              </Button>
              <Button type="button" size="sm" variant="outline" disabled={loading} onClick={onEditDraft}>
                <Pencil className="mr-2 h-3.5 w-3.5" />
                Ajustar
              </Button>
              <Button type="button" size="sm" variant="ghost" disabled={loading} onClick={onCancelDraft}>
                Cancelar
              </Button>
            </div>
          </>
        )}

        {step === 'sent' && createdRequest && (
          <div className="space-y-3">
            {createdRequest.reference_code && (
              <p className="text-xs font-mono text-primary">{createdRequest.reference_code}</p>
            )}
            <Button asChild size="sm" variant="outline" className="border-primary/30">
              <Link href={`/mis-pedidos/${createdRequest.id}`}>
                Ver en Mis pedidos
                <ArrowRight className="ml-2 h-3.5 w-3.5" />
              </Link>
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={onClose}>
              Seguir en el chat
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
