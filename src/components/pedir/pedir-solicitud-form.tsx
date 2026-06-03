'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import {
  GuidedRequestWizard,
  type GuidedFlowMode,
} from '@/components/assistant/guided-request-wizard';
import { AvailabilitySemaphoreLive } from '@/components/availability/availability-semaphore-live';
import {
  buildDraftFromGuidedForm,
  suggestTitle,
  type GuidedRequestForm,
} from '@/lib/ai/guided-request-coach';
import { getUseCaseById } from '@/lib/ai/aeromexico-use-cases';
import { requestAreas } from '@/lib/constants';
import { pedirHubHref, aiAgentHref } from '@/lib/ai/assistant-modes';
import { siteConfig } from '@/lib/constants';
import { portalContentClass } from '@/lib/layout/portal';
import { cn } from '@/lib/utils';
import type { AssistantRequestDraft } from '@/lib/ai/assistant-request-flow';

type Props = {
  autoStart?: boolean;
  initialScenarioId?: string;
};

export function PedirSolicitudForm({ autoStart, initialScenarioId }: Props) {
  const [guidedMode, setGuidedMode] = useState<GuidedFlowMode>(autoStart ? 'guided' : 'idle');
  const [loading, setLoading] = useState(false);
  const [createdRequest, setCreatedRequest] = useState<{
    id: string;
    reference_code: string | null;
  } | null>(null);
  const [initialForm, setInitialForm] = useState<Partial<GuidedRequestForm> | undefined>();
  const autoStarted = useRef(false);

  useEffect(() => {
    if (!autoStart || autoStarted.current) return;
    autoStarted.current = true;
    if (initialScenarioId) {
      const uc = getUseCaseById(initialScenarioId);
      if (uc) {
        const company = (requestAreas as readonly string[]).includes(uc.area)
          ? uc.area
          : 'Marketing';
        setInitialForm({
          company,
          type: uc.requestType,
          description: uc.starterMessage,
          title: suggestTitle(uc.starterMessage, uc.requestType),
        });
      }
    }
    setGuidedMode('guided');
  }, [autoStart, initialScenarioId]);

  const confirmRequest = useCallback(async (draft: AssistantRequestDraft) => {
    setLoading(true);
    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...draft,
          source: 'form',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'No se pudo enviar el pedido');
      setCreatedRequest({
        id: data.id,
        reference_code: data.reference_code ?? null,
      });
      setGuidedMode('sent');
      toast.success('Pedido enviado', {
        description: data.reference_code
          ? `Referencia ${data.reference_code}`
          : 'Lo verás en Mis pedidos',
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al enviar');
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="flex flex-1 flex-col min-h-0 h-full w-full">
      <header className="shrink-0 border-b border-border/40 bg-card/20">
        <div className={cn(portalContentClass, 'py-4 sm:py-5 space-y-3')}>
          <Link
            href={pedirHubHref()}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Volver a Pedir
          </Link>
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/5 px-2.5 py-0.5 text-[11px] font-medium text-primary">
              <Sparkles className="h-3 w-3" />
              Formulario · {siteConfig.author}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              Pedir <span className="gradient-text">trabajo</span>
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl leading-relaxed">
              Cinco pasos. Al final pulsas Enviar. ¿Solo preguntas? Ve al{' '}
              <Link href={aiAgentHref()} className="text-primary hover:underline">
                AI Agent
              </Link>
              .
            </p>
          </div>
          <div className="max-w-xs">
            <AvailabilitySemaphoreLive />
          </div>
        </div>
      </header>

      <div className={cn(portalContentClass, 'flex-1 min-h-0 py-4 flex flex-col')}>
        <GuidedRequestWizard
          mode={guidedMode}
          loading={loading}
          disabled={loading}
          createdRequest={createdRequest}
          initialForm={initialForm}
          enableStepAi={false}
          embedded
          onOpen={() => setGuidedMode('guided')}
          onClose={() => {
            setGuidedMode('idle');
            setCreatedRequest(null);
            setInitialForm(undefined);
          }}
          onConfirm={(draft) => void confirmRequest(draft)}
        />
      </div>
    </div>
  );
}
