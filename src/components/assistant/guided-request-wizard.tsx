'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Loader2,
  Sparkles,
  X,
  ArrowRight,
  HelpCircle,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TypeCards } from '@/components/my-requests/type-cards';
import { PriorityChips } from '@/components/my-requests/priority-chips';
import { SergioCoachBlock } from '@/components/assistant/sergio-coach-block';
import { GuidedStepChat } from '@/components/assistant/guided-step-chat';
import { SergioAvatar } from '@/components/assistant/sergio-avatar';
import { NotificationSetupPrompt } from '@/components/account/notification-setup-prompt';
import { requestAreas, requestPriorities, requestTypes } from '@/lib/constants';
import type { AssistantRequestDraft } from '@/lib/ai/assistant-request-flow';
import {
  type GuidedRequestForm,
  type GuidedWizardStepId,
  GUIDED_WIZARD_STEPS,
  DEFAULT_GUIDED_FORM,
  getStepMeta,
  stepLabel,
  suggestTitle,
  buildDraftFromGuidedForm,
} from '@/lib/ai/guided-request-coach';
import { cn } from '@/lib/utils';
import type { CopilotMessage } from '@/types/command-center';

export type GuidedFlowMode = 'idle' | 'guided' | 'sent';

type CreatedRequest = {
  id: string;
  reference_code: string | null;
};

type Props = {
  mode: GuidedFlowMode;
  loading: boolean;
  disabled: boolean;
  disabledReason?: string;
  createdRequest: CreatedRequest | null;
  initialForm?: Partial<GuidedRequestForm>;
  onOpen: () => void;
  onClose: () => void;
  onConfirm: (draft: AssistantRequestDraft) => void;
  onStepChange?: (step: GuidedWizardStepId, form: GuidedRequestForm) => void;
  chatFocused?: boolean;
  stepChatMessages?: CopilotMessage[];
  stepChatLoading?: boolean;
  chatMarkdown?: boolean;
  embedded?: boolean;
  /** Coach y chat por paso (desactivado en formulario puro) */
  enableStepAi?: boolean;
};

function StepExample({ step, form }: { step: GuidedWizardStepId; form: GuidedRequestForm }) {
  const meta = getStepMeta(step, form);
  if (!meta.example) return null;

  return (
    <details className="group rounded-lg border border-border/50 bg-muted/20">
      <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors [&::-webkit-details-marker]:hidden">
        <HelpCircle className="h-3.5 w-3.5 shrink-0 text-primary/70" />
        {meta.exampleLabel ?? 'Ver ejemplo'}
        <ChevronDown className="ml-auto h-3.5 w-3.5 transition-transform group-open:rotate-180" />
      </summary>
      <p className="px-3 pb-3 text-xs text-muted-foreground leading-relaxed border-t border-border/40 pt-2">
        «{meta.example}»
      </p>
    </details>
  );
}

export function GuidedRequestWizard({
  mode,
  loading,
  disabled,
  disabledReason,
  createdRequest,
  initialForm,
  onOpen,
  onClose,
  onConfirm,
  onStepChange,
  chatFocused = false,
  stepChatMessages = [],
  stepChatLoading = false,
  chatMarkdown = false,
  embedded = false,
  enableStepAi = false,
}: Props) {
  const reduceMotion = useReducedMotion();
  const [stepIndex, setStepIndex] = useState(0);
  const [form, setForm] = useState<GuidedRequestForm>(DEFAULT_GUIDED_FORM);

  const step = GUIDED_WIZARD_STEPS[stepIndex];
  const meta = getStepMeta(step, form);
  const isFirst = stepIndex === 0;
  const isReview = step === 'review';

  const onStepChangeRef = useRef(onStepChange);
  onStepChangeRef.current = onStepChange;
  const lastReportedStepKey = useRef<string | null>(null);
  const prevModeRef = useRef(mode);

  useEffect(() => {
    const enteringGuided = mode === 'guided' && prevModeRef.current !== 'guided';
    prevModeRef.current = mode;

    if (enteringGuided) {
      if (initialForm) {
        setForm((f) => ({ ...f, ...initialForm }));
      }
      setStepIndex(0);
      lastReportedStepKey.current = null;
    }
  }, [mode, initialForm]);

  useEffect(() => {
    if (mode !== 'guided') {
      lastReportedStepKey.current = null;
      return;
    }

    const reportKey = `${step}|${form.company}|${form.type}|${form.priority}|${form.title}|${form.description}`;
    if (lastReportedStepKey.current === reportKey) return;
    lastReportedStepKey.current = reportKey;
    onStepChangeRef.current?.(step, form);
  }, [mode, step, form]);

  function patch(partial: Partial<GuidedRequestForm>) {
    setForm((f) => ({ ...f, ...partial }));
  }

  function canAdvance(): boolean {
    switch (step) {
      case 'area':
        return Boolean(form.company);
      case 'type':
        return Boolean(form.type);
      case 'detail':
        return form.description.trim().length >= 10;
      case 'priority':
        return Boolean(form.priority);
      case 'review':
        return true;
      default:
        return false;
    }
  }

  function goNext() {
    if (step === 'detail' && !form.title.trim()) {
      patch({ title: suggestTitle(form.description, form.type) });
    }
    if (isReview) {
      onConfirm(buildDraftFromGuidedForm(form));
      return;
    }
    if (canAdvance()) setStepIndex((i) => Math.min(i + 1, GUIDED_WIZARD_STEPS.length - 1));
  }

  function goBack() {
    setStepIndex((i) => Math.max(0, i - 1));
  }

  if (mode === 'idle') {
    return (
      <div className="rounded-xl border border-primary/25 bg-gradient-to-r from-primary/[0.06] to-transparent px-4 py-4 flex flex-col sm:flex-row sm:items-center gap-4">
        <SergioAvatar state="idle" size="md" className="hidden sm:block" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary shrink-0" />
            Pedido con IA
          </p>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            Área, tipo, detalle y urgencia — completa cada paso y envía en la revisión final.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <Button
            type="button"
            size="sm"
            className="h-9 gap-1.5 glow-aero"
            disabled={disabled}
            title={disabledReason}
            onClick={onOpen}
          >
            <ClipboardList className="h-3.5 w-3.5" />
            Empezar pedido
          </Button>
        </div>
      </div>
    );
  }

  if (mode === 'sent' && createdRequest) {
    return (
      <div className="rounded-xl border border-radar/30 bg-radar/[0.06] p-4 space-y-3">
        <div className="flex items-center gap-3">
          <SergioAvatar state="success" size="md" />
          <div>
            <p className="text-sm font-semibold">Recibí tu pedido</p>
            <p className="text-xs text-muted-foreground mt-0.5">Lo reviso y te confirmo en Mis pedidos.</p>
          </div>
        </div>
        {createdRequest.reference_code && (
          <p className="text-xs font-mono text-primary pl-12">{createdRequest.reference_code}</p>
        )}
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm" variant="outline" className="border-primary/30">
            <Link href={`/mis-pedidos/${createdRequest.id}`}>
              Ver en Mis pedidos
              <ArrowRight className="ml-2 h-3.5 w-3.5" />
            </Link>
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={onClose}>
            Pedir otra cosa
          </Button>
        </div>
        <NotificationSetupPrompt variant="inline" afterOrder className="mt-1" />
      </div>
    );
  }

  if (mode !== 'guided') return null;

  return (
    <div
      className={cn(
        'flex flex-col bg-card/95 backdrop-blur-sm border-primary/20 shadow-[0_-8px_32px_-8px_rgba(0,0,0,0.35)]',
        embedded
          ? 'flex-1 min-h-0 h-full border-t'
          : 'border-t'
      )}
      role="region"
      aria-label="Pedido con IA"
    >
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border/40 shrink-0">
        <div className="flex gap-1 flex-1 min-w-0">
          {GUIDED_WIZARD_STEPS.map((s, i) => (
            <div key={s} className="flex-1 min-w-0">
              <div
                className={cn(
                  'h-1 rounded-full transition-colors',
                  i <= stepIndex ? 'bg-primary' : 'bg-border/50'
                )}
              />
              <p
                className={cn(
                  'text-[9px] mt-1 truncate hidden sm:block',
                  i === stepIndex ? 'text-primary font-medium' : 'text-muted-foreground/60'
                )}
              >
                {stepLabel(s)}
              </p>
            </div>
          ))}
        </div>
        <span className="text-[10px] tabular-nums text-muted-foreground shrink-0">
          {stepIndex + 1}/{GUIDED_WIZARD_STEPS.length}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0"
          disabled={loading}
          aria-label="Cerrar"
          onClick={onClose}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div
        className={cn(
          'px-4 py-4 space-y-4 overflow-y-auto',
          embedded ? 'flex-1 min-h-0' : 'min-h-[160px] max-h-[min(36vh,300px)]'
        )}
      >
        {enableStepAi && (
          <>
            <SergioCoachBlock
              step={step}
              form={form}
              loading={stepChatLoading}
              chatFocused={chatFocused}
            />
            <GuidedStepChat
              step={step}
              messages={stepChatMessages}
              loading={stepChatLoading}
              markdown={chatMarkdown}
            />
          </>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={reduceMotion ? false : { opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, x: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="space-y-4"
          >
            <div className="space-y-1">
              <h3 className="text-sm font-semibold tracking-tight">{meta.question}</h3>
              {meta.subtitle && (
                <p className="text-xs text-muted-foreground leading-relaxed">{meta.subtitle}</p>
              )}
            </div>

            <motion.div
              className="rounded-xl ring-1 ring-primary/20 p-0.5"
              initial={reduceMotion ? false : { boxShadow: '0 0 0 0 rgba(var(--primary), 0)' }}
              animate={
                reduceMotion
                  ? undefined
                  : {
                      boxShadow: [
                        '0 0 0 0 hsl(var(--primary) / 0)',
                        '0 0 0 3px hsl(var(--primary) / 0.12)',
                        '0 0 0 0 hsl(var(--primary) / 0)',
                      ],
                    }
              }
              transition={{ duration: 0.9, ease: 'easeOut' }}
            >
              <div className="rounded-[10px] bg-background/30 p-3 space-y-3">
                {step === 'area' && (
                  <Select value={form.company} onValueChange={(v) => v && patch({ company: v })}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Elige tu área" />
                    </SelectTrigger>
                    <SelectContent>
                      {requestAreas.map((area) => (
                        <SelectItem key={area} value={area}>
                          {area}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {step === 'type' && (
                  <TypeCards
                    value={form.type}
                    onChange={(v) => patch({ type: v as GuidedRequestForm['type'] })}
                  />
                )}

                {step === 'detail' && (
                  <div className="space-y-3">
                    <StepExample step={step} form={form} />
                    <Textarea
                      id="guided-desc"
                      value={form.description}
                      onChange={(e) => patch({ description: e.target.value })}
                      placeholder="Ej: Quiero ver conversión por canal, ROAS y abandono en checkout mobile…"
                      className="min-h-[100px] resize-none"
                      disabled={loading}
                      rows={4}
                    />
                    <p
                      className={cn(
                        'text-[11px] tabular-nums',
                        form.description.trim().length >= 10 ? 'text-radar' : 'text-muted-foreground'
                      )}
                    >
                      {form.description.trim().length} / 10 caracteres mínimo
                    </p>
                  </div>
                )}

                {step === 'priority' && (
                  <PriorityChips
                    value={form.priority}
                    onChange={(v) => patch({ priority: v as GuidedRequestForm['priority'] })}
                  />
                )}

                {step === 'review' && (
                  <dl className="space-y-2.5 rounded-lg border border-border/50 bg-background/40 p-3 text-sm">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">Área</dt>
                        <dd className="text-sm font-medium mt-0.5">{form.company}</dd>
                      </div>
                      <div>
                        <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">Urgencia</dt>
                        <dd className="text-sm font-medium mt-0.5">
                          {requestPriorities.find((p) => p.value === form.priority)?.label}
                        </dd>
                      </div>
                    </div>
                    <div>
                      <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">Tipo</dt>
                      <dd className="text-sm font-medium mt-0.5">
                        {requestTypes.find((t) => t.value === form.type)?.label}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">Detalle</dt>
                      <dd className="text-xs text-muted-foreground mt-0.5 whitespace-pre-wrap leading-relaxed">
                        {form.description}
                      </dd>
                    </div>
                  </dl>
                )}
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {disabled && disabledReason && (
          <p className="text-xs text-signal">{disabledReason}</p>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 px-4 py-3 border-t border-border/40 shrink-0 bg-background/60">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-9"
          disabled={isFirst || loading}
          onClick={goBack}
        >
          <ChevronLeft className="h-4 w-4 mr-0.5" />
          Atrás
        </Button>
        <Button
          type="button"
          size="sm"
          className="h-9 min-w-[120px] glow-aero"
          disabled={!canAdvance() || loading || (isReview && disabled)}
          onClick={goNext}
        >
          {loading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />
              Enviando…
            </>
          ) : isReview ? (
            'Enviar a Sergio'
          ) : (
            <>
              Continuar
              <ChevronRight className="h-4 w-4 ml-0.5" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
