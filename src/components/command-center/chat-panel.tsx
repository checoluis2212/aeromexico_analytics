'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, Bot, User, Expand, Shrink } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { AssistantMarkdown } from '@/components/assistant/assistant-markdown';
import { SergioAvatar } from '@/components/assistant/sergio-avatar';
import { SergioTypingIndicator } from '@/components/assistant/typing-indicator';
import {
  PreguntaleScenarios,
  type ScenarioChip,
} from '@/components/assistant/preguntale-scenarios';
import {
  GuidedRequestWizard,
  type GuidedFlowMode,
} from '@/components/assistant/guided-request-wizard';
import { stepLabel } from '@/lib/ai/guided-request-coach';
import { cn } from '@/lib/utils';
import type { CopilotMessage } from '@/types/command-center';
import type {
  AssistantRequestDraft,
  RequestChatAction,
} from '@/lib/ai/assistant-request-flow';
import {
  formatNewRequestAcceptedReply,
  formatNewRequestConfirmPrompt,
  formatNewRequestDeclinedReply,
  isNewRequestFlowConfirm,
  isNewRequestFlowDecline,
  isNewRequestIntent,
} from '@/lib/ai/assistant-request-flow';
import {
  prefillGuidedForm,
  getGuidedStepAiContext,
  type GuidedRequestForm,
  type GuidedWizardStepId,
} from '@/lib/ai/guided-request-coach';
import type { AssistantMode } from '@/lib/ai/assistant-modes';
import { getUseCaseById } from '@/lib/ai/aeromexico-use-cases';

type SendOptions = {
  action?: RequestChatAction;
  draft?: AssistantRequestDraft;
  displayText?: string;
  scenarioId?: string;
};

interface ChatPanelProps {
  module: 'discovery' | 'copilot' | 'tracking_assistant';
  placeholder?: string;
  suggestions?: string[];
  apiEndpoint: string;
  markdown?: boolean;
  showRateLimit?: boolean;
  emptyHint?: string;
  welcomeMessage?: string;
  scenarios?: ScenarioChip[];
  enableOptionalRequests?: boolean;
  /** Wizard de pedido en modo consultor (AI Agent) al detectar intención de nuevo pedido */
  enableGuidedRequestInConsultor?: boolean;
  orderOnlyMode?: boolean;
  assistantMode?: AssistantMode;
  requestId?: string;
  initialScenarioId?: string;
  autoStartGuided?: boolean;
  fillHeight?: boolean;
  /** Sustituye la altura por defecto del panel (p. ej. portal cliente). */
  panelClassName?: string;
  allowExpand?: boolean;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
}

export function ChatPanel({
  module,
  placeholder,
  suggestions = [],
  apiEndpoint,
  markdown = false,
  showRateLimit = false,
  emptyHint = 'Hola — escribe lo que necesitas en tus palabras',
  welcomeMessage,
  scenarios = [],
  enableOptionalRequests = false,
  enableGuidedRequestInConsultor = false,
  orderOnlyMode = false,
  assistantMode = 'solicitud',
  requestId,
  initialScenarioId,
  autoStartGuided = false,
  fillHeight = false,
  panelClassName,
  allowExpand = false,
  expanded: expandedProp,
  onExpandedChange,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<CopilotMessage[]>(() =>
    welcomeMessage ? [{ role: 'assistant', content: welcomeMessage }] : []
  );
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [pendingDraft, setPendingDraft] = useState<AssistantRequestDraft | null>(null);
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);
  const [guidedMode, setGuidedMode] = useState<GuidedFlowMode>('idle');
  const [guidedInitialForm, setGuidedInitialForm] = useState<Partial<GuidedRequestForm> | undefined>();
  const [guidedProgress, setGuidedProgress] = useState<{
    step: GuidedWizardStepId;
    form: GuidedRequestForm;
  } | null>(null);
  const [createdRequest, setCreatedRequest] = useState<{
    id: string;
    reference_code: string | null;
  } | null>(null);
  const [chatInputFocused, setChatInputFocused] = useState(false);
  const [guidedSubmitting, setGuidedSubmitting] = useState(false);
  const [guidedStepThreads, setGuidedStepThreads] = useState<
    Partial<Record<GuidedWizardStepId, CopilotMessage[]>>
  >({});
  const [guidedStepChatLoading, setGuidedStepChatLoading] = useState(false);
  const [expandedInternal, setExpandedInternal] = useState(false);
  const expanded = expandedProp ?? expandedInternal;
  const setExpanded = onExpandedChange ?? setExpandedInternal;
  const bottomRef = useRef<HTMLDivElement>(null);
  const initialScenarioHandled = useRef(false);
  const autoStartHandled = useRef(false);
  const awaitingNewRequestConfirm = useRef(false);
  const newRequestMessageSnapshot = useRef<CopilotMessage[]>([]);

  const isSolicitudMode = assistantMode === 'solicitud';
  const isConsultorMode = assistantMode === 'consultor';
  const hasUserMessages = messages.some((m) => m.role === 'user');
  const canRunGuidedOrder =
    (enableOptionalRequests && isSolicitudMode) || enableGuidedRequestInConsultor;
  const isConsultorEmpty =
    isConsultorMode && !hasUserMessages && guidedMode === 'idle';

  const chatActive =
    isConsultorMode ||
    !orderOnlyMode ||
    guidedMode === 'guided' ||
    Boolean(requestId);
  const sergioBranding =
    isConsultorMode || orderOnlyMode || guidedMode === 'guided';

  const showScenariosInDock = isConsultorEmpty && scenarios.length > 0;
  const showSuggestionsInDock = isConsultorEmpty && suggestions.length > 0;

  const showConsultorRateLimit = showRateLimit && isConsultorMode;
  const rateLimitBlocked = showConsultorRateLimit && remaining === 0;
  const isGuidedOrder = canRunGuidedOrder && guidedMode === 'guided';

  useEffect(() => {
    if (isGuidedOrder) return;
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, guidedMode, loading, isGuidedOrder]);

  useEffect(() => {
    if (!expanded || !allowExpand) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setExpanded(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [expanded, allowExpand, setExpanded]);

  useEffect(() => {
    if (!showConsultorRateLimit) {
      setRemaining(null);
      return;
    }
    fetch(apiEndpoint, { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.unlimited) {
          setRemaining(null);
          return;
        }
        if (data && typeof data.remaining === 'number') setRemaining(data.remaining);
      })
      .catch(() => undefined);
  }, [apiEndpoint, showConsultorRateLimit, assistantMode]);

  useEffect(() => {
    if (!initialScenarioId || initialScenarioHandled.current || loading) return;
    initialScenarioHandled.current = true;
    setActiveScenarioId(initialScenarioId);

    if (autoStartGuided) return;

    if (assistantMode === 'consultor') {
      const scenario = getUseCaseById(initialScenarioId);
      if (scenario) {
        sendMessage(scenario.starterMessage, {
          scenarioId: initialScenarioId,
          displayText: scenario.title,
        });
      }
      return;
    }

    if (!enableOptionalRequests) return;
    const form = prefillGuidedForm({ messages: [], scenarioId: initialScenarioId });
    const { scenarioId: _s, ...initial } = form;
    setGuidedInitialForm(initial);
    setGuidedMode('guided');
    // eslint-disable-next-line react-hooks/exhaustive-deps -- deep link al montar
  }, [initialScenarioId, enableOptionalRequests, assistantMode, loading, autoStartGuided]);

  function historyForApi(
    prior: CopilotMessage[],
    pending?: { role: 'user'; content: string; apiContent: string }
  ): { role: string; content: string }[] {
    const rows = prior.map((m) => ({
      role: m.role,
      content: m.role === 'user' ? (m.apiContent ?? m.content) : m.content,
    }));
    if (pending) rows.push({ role: pending.role, content: pending.apiContent });
    return rows;
  }

  async function postChat(
    message: string,
    history: { role: string; content: string }[],
    opts?: SendOptions
  ) {
    const res = await fetch(apiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        message,
        module,
        history,
        action: opts?.action,
        draft: opts?.draft,
        scenarioId: opts?.scenarioId ?? activeScenarioId ?? undefined,
        requestId,
        guidedOrder: canRunGuidedOrder && guidedMode === 'guided' && !opts?.action,
        assistantMode,
      }),
    });
    return res.json().then((data) => ({ res, data }));
  }

  async function sendMessage(text: string, opts?: SendOptions) {
    const trimmed = text.trim();
    const isSilentAction =
      opts?.action === 'confirm_request' || opts?.action === 'cancel_request';
    const isGuidedStepQuestion =
      isGuidedOrder && Boolean(guidedProgress) && Boolean(trimmed) && !opts?.action;

    if (!trimmed && !opts?.action) return;
    if (isGuidedStepQuestion ? guidedStepChatLoading : loading) return;

    const displayText =
      opts?.displayText ??
      (opts?.action === 'start_request' ? 'Quiero pedir a Sergio' : trimmed);

    if (enableGuidedRequestInConsultor && trimmed && !opts?.action && guidedMode === 'idle') {
      const userMsg = {
        role: 'user' as const,
        content: displayText,
        apiContent: trimmed,
      };

      if (awaitingNewRequestConfirm.current) {
        if (isNewRequestFlowConfirm(trimmed)) {
          awaitingNewRequestConfirm.current = false;
          const snapshot = [...newRequestMessageSnapshot.current, userMsg];
          setMessages((prev) => [
            ...prev,
            userMsg,
            { role: 'assistant', content: formatNewRequestAcceptedReply() },
          ]);
          setInput('');
          beginGuidedOrderFromMessages(snapshot);
          return;
        }
        if (isNewRequestFlowDecline(trimmed)) {
          awaitingNewRequestConfirm.current = false;
          setMessages((prev) => [
            ...prev,
            userMsg,
            { role: 'assistant', content: formatNewRequestDeclinedReply() },
          ]);
          setInput('');
          return;
        }
        awaitingNewRequestConfirm.current = false;
      }

      if (isNewRequestIntent(trimmed)) {
        const snapshot = [...messages, userMsg];
        awaitingNewRequestConfirm.current = true;
        newRequestMessageSnapshot.current = snapshot;
        setMessages((prev) => [
          ...prev,
          userMsg,
          { role: 'assistant', content: formatNewRequestConfirmPrompt() },
        ]);
        setInput('');
        return;
      }
    }

    if (rateLimitBlocked && !isSilentAction && opts?.action !== 'start_request') {
      toast.error('Límite alcanzado', {
        description:
          '10 mensajes por hora en modo Consultor. Cambia a Solicitud para levantar un pedido guiado.',
      });
      return;
    }

    const apiUserText = isGuidedStepQuestion
      ? `${getGuidedStepAiContext(guidedProgress!.step, guidedProgress!.form)}\n\nPregunta del usuario: ${trimmed}`
      : trimmed || displayText;

    const pendingUser = displayText
      ? { role: 'user' as const, content: displayText, apiContent: apiUserText }
      : undefined;

    if (isGuidedStepQuestion && pendingUser) {
      setGuidedStepThreads((prev) => ({
        ...prev,
        [guidedProgress!.step]: [...(prev[guidedProgress!.step] ?? []), pendingUser],
      }));
      setInput('');
      setGuidedStepChatLoading(true);
    } else {
      if (displayText && !isSilentAction) {
        setMessages((prev) => [...prev, pendingUser!]);
      }
      if (opts?.action !== 'start_request') setInput('');
      setLoading(true);
    }

    try {
      const prior = isGuidedStepQuestion
        ? (guidedStepThreads[guidedProgress!.step] ?? [])
        : messages;
      const apiHistory = historyForApi(prior, pendingUser);
      const { res, data } = await postChat(apiUserText, apiHistory, opts);

      const rateLimitReply =
        data.error ??
        'Llegaste al límite de 10 mensajes por hora en modo **Consultor**. Cambia a **Solicitud** para levantar un pedido guiado.';

      if (res.status === 429) {
        setRemaining(0);
        toast.error('Límite alcanzado', { description: data.error });
        if (isGuidedStepQuestion && guidedProgress) {
          setGuidedStepThreads((prev) => ({
            ...prev,
            [guidedProgress.step]: [
              ...(prev[guidedProgress.step] ?? []),
              { role: 'assistant', content: rateLimitReply },
            ],
          }));
        } else {
          setMessages((prev) => [...prev, { role: 'assistant', content: rateLimitReply }]);
        }
        return;
      }

      if (!res.ok || !data.reply) {
        throw new Error(data.error ?? 'Error');
      }

      if (typeof data.remaining === 'number') setRemaining(data.remaining);

      const skipChatReply = opts?.action === 'start_request';
      if (!skipChatReply) {
        if (isGuidedStepQuestion && guidedProgress) {
          setGuidedStepThreads((prev) => ({
            ...prev,
            [guidedProgress.step]: [
              ...(prev[guidedProgress.step] ?? []),
              { role: 'assistant', content: data.reply },
            ],
          }));
        } else {
          setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
        }
      }

      if (data.request_draft) {
        setPendingDraft(data.request_draft as AssistantRequestDraft);
      } else if (opts?.action === 'confirm_request' || opts?.action === 'cancel_request') {
        setPendingDraft(null);
        if (opts.action === 'cancel_request') setGuidedMode('idle');
      }

      if (data.request_created?.id) {
        setPendingDraft(null);
        setCreatedRequest({
          id: data.request_created.id,
          reference_code: data.request_created.reference_code ?? null,
        });
        setGuidedMode('sent');
        toast.success('Pedido enviado', {
          description: data.request_created.reference_code
            ? `ID ${data.request_created.reference_code}`
            : 'Revisa Mis pedidos',
        });
      }

      if (data.start_guided_request && enableGuidedRequestInConsultor && guidedMode === 'idle') {
        beginGuidedOrderFromMessages(
          pendingUser ? [...messages, pendingUser] : messages
        );
      }
    } catch {
      if (opts?.action === 'confirm_request') {
        setGuidedMode('guided');
      }
      const errorReply =
        opts?.action === 'confirm_request'
          ? 'Ups, no pude enviar el pedido ahora. Intenta de nuevo o usa [Pedir con IA](/pedir).'
          : 'Ups, no pude responder ahora. Intenta de nuevo.';

      if (isGuidedStepQuestion && guidedProgress) {
        setGuidedStepThreads((prev) => ({
          ...prev,
          [guidedProgress.step]: [
            ...(prev[guidedProgress.step] ?? []),
            { role: 'assistant', content: errorReply },
          ],
        }));
      } else if (!isSilentAction) {
        setMessages((prev) => [...prev, { role: 'assistant', content: errorReply }]);
      }

      toast.error('No se pudo completar', {
        description: 'Prueba otra vez o abre Pedir con IA (/pedir).',
      });
    } finally {
      if (isGuidedStepQuestion) setGuidedStepChatLoading(false);
      else setLoading(false);
    }
  }

  function handleScenario(scenario: ScenarioChip) {
    if (!scenario.message) return;
    setActiveScenarioId(scenario.id);
    sendMessage(scenario.message, {
      scenarioId: scenario.id,
      displayText: scenario.title,
    });
  }

  const handleGuidedStepChange = useCallback(
    (step: GuidedWizardStepId, form: GuidedRequestForm) => {
      setGuidedProgress({ step, form });
    },
    []
  );

  function beginGuidedOrderFromMessages(
    messageSnapshot: { role: string; content: string; apiContent?: string }[]
  ) {
    if (rateLimitBlocked) {
      toast.error('Límite de chat alcanzado', {
        description: 'Intenta de nuevo en un momento o usa el formulario en /pedir.',
      });
      return;
    }

    const prefill = prefillGuidedForm({
      messages: messageSnapshot,
      scenarioId: activeScenarioId,
      inputDraft: input.trim(),
    });

    if (prefill.scenarioId) {
      setActiveScenarioId(prefill.scenarioId);
    }

    const { scenarioId: _scenarioId, ...form } = prefill;
    setGuidedInitialForm(form);
    setCreatedRequest(null);
    setGuidedStepThreads({});
    setGuidedMode('guided');

    toast.message('Nuevo pedido', {
      description: form.description
        ? 'Pre-rellené el detalle desde lo que comentaste.'
        : 'Cinco pasos — si tienes duda, escríbela abajo.',
    });
  }

  function openGuidedWizard() {
    beginGuidedOrderFromMessages(messages);
  }

  useEffect(() => {
    if (!autoStartGuided || autoStartHandled.current || loading) return;
    if (!enableOptionalRequests || !isSolicitudMode || guidedMode === 'guided') return;
    autoStartHandled.current = true;
    if (initialScenarioId) setActiveScenarioId(initialScenarioId);
    openGuidedWizard();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- arranque único desde hub /pedir
  }, [autoStartGuided, enableOptionalRequests, isSolicitudMode, guidedMode, loading, initialScenarioId]);

  async function confirmGuidedRequest(draft: AssistantRequestDraft) {
    setGuidedSubmitting(true);
    try {
      await sendMessage('confirmo', {
        action: 'confirm_request',
        draft,
        displayText: 'Enviar pedido guiado',
      });
    } finally {
      setGuidedSubmitting(false);
    }
  }

  function closeRequestFlow() {
    setGuidedMode('idle');
    setGuidedInitialForm(undefined);
    setGuidedProgress(null);
    setGuidedStepThreads({});
    setGuidedStepChatLoading(false);
    setPendingDraft(null);
    setCreatedRequest(null);
    awaitingNewRequestConfirm.current = false;
    newRequestMessageSnapshot.current = [];
  }

  const chatDock = (
    <div className="shrink-0 border-t border-primary/20 bg-background/95 backdrop-blur-sm">
      {showScenariosInDock && (
        <div className="px-4 pt-3 pb-1 max-h-[min(38vh,280px)] overflow-y-auto border-b border-border/30">
          <PreguntaleScenarios
            scenarios={scenarios}
            onSelect={handleScenario}
            disabled={loading || rateLimitBlocked}
            compact
          />
        </div>
      )}

      {showSuggestionsInDock && (
        <div className="px-4 pt-2.5 pb-1 flex gap-2 overflow-x-auto scrollbar-thin">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              disabled={loading || rateLimitBlocked}
              onClick={() => sendMessage(s)}
              className="shrink-0 text-[11px] px-3 py-1.5 rounded-full border border-primary/20 bg-primary/[0.04] hover:bg-primary/10 hover:border-primary/35 transition-colors whitespace-nowrap"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="p-4 space-y-2.5">
        {isGuidedOrder && guidedProgress && (
          <div className="flex items-center gap-2.5 rounded-lg border border-primary/25 bg-primary/[0.08] px-3 py-2.5">
            <SergioAvatar
              state={
                chatInputFocused ? 'listening' : guidedStepChatLoading ? 'thinking' : 'idle'
              }
              size="sm"
            />
            <div className="min-w-0">
              <p className="text-xs font-medium text-foreground">
                Paso {stepLabel(guidedProgress.step)} · ¿duda aquí?
              </p>
              <p className="text-[11px] leading-snug text-muted-foreground">
                Respondo en el panel del paso — el wizard sigue aquí abajo.
              </p>
            </div>
          </div>
        )}

        {isConsultorMode && !isGuidedOrder && (
          <p className="text-[11px] text-muted-foreground px-0.5">
            <span className="text-foreground font-medium">Enter</span> envía ·{' '}
            <span className="text-foreground font-medium">Shift+Enter</span> nueva línea
          </p>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(input);
          }}
          className="flex gap-2"
        >
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={() => setChatInputFocused(true)}
            onBlur={() => setChatInputFocused(false)}
            placeholder={
              isGuidedOrder
                ? 'Ej: ¿Qué tipo elijo para un dashboard de campaña?'
                : (placeholder ?? 'Escribe tu consulta...')
            }
            className="min-h-[52px] max-h-32 resize-none text-sm rounded-xl bg-background ring-1 ring-primary/20 focus-visible:ring-primary/45 shadow-sm"
            rows={1}
            disabled={rateLimitBlocked}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage(input);
              }
            }}
          />
          <Button
            type="submit"
            size="icon"
            disabled={
              (isGuidedOrder ? guidedStepChatLoading : loading) ||
              !input.trim() ||
              rateLimitBlocked
            }
            className="shrink-0 h-[52px] w-[52px] rounded-xl glow-aero"
            aria-label="Enviar mensaje"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );

  const messageList = (
    <>
      {messages.length === 0 && !welcomeMessage && (
        <div className="text-center py-8">
          <Bot className="h-10 w-10 text-primary/40 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">{emptyHint}</p>
          {suggestions.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mt-6 max-w-lg mx-auto">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => sendMessage(s)}
                  className="text-xs px-3 py-1.5 rounded-full border border-border/60 hover:border-primary/40 hover:bg-primary/5 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <AnimatePresence>
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn('flex gap-3', msg.role === 'user' ? 'justify-end' : 'justify-start')}
          >
            {msg.role === 'assistant' &&
              (sergioBranding ? (
                <SergioAvatar state="idle" size="sm" />
              ) : (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/10 text-[10px] font-bold text-primary">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
              ))}
            <div
              className={cn(
                'max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-secondary/40 border border-border/40'
              )}
            >
              {msg.role === 'assistant' && markdown ? (
                <AssistantMarkdown content={msg.content} />
              ) : (
                <div className="whitespace-pre-wrap">{msg.content}</div>
              )}
            </div>
            {msg.role === 'user' && (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-secondary ring-1 ring-border/50">
                <User className="h-4 w-4" />
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {loading &&
        (sergioBranding ? (
          <SergioTypingIndicator
            label={guidedSubmitting ? 'Enviando tu pedido…' : 'Sergio escribe…'}
          />
        ) : (
          <div className="flex gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
              <Loader2 className="h-4 w-4 text-primary animate-spin" />
            </div>
            <div className="bg-secondary/40 rounded-2xl px-4 py-3 text-sm text-muted-foreground border border-border/40">
              Pensando en tu caso…
            </div>
          </div>
        ))}
      <div ref={bottomRef} />
    </>
  );

  return (
    <div
      className={cn(
        'flex flex-col rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm shadow-lg shadow-primary/[0.03] overflow-hidden',
        fillHeight
          ? 'h-full min-h-0'
          : (panelClassName ?? 'min-h-[560px] h-[calc(100vh-14rem)]'),
        expanded && allowExpand && 'ring-1 ring-primary/25 shadow-primary/[0.06]'
      )}
    >
      {(showConsultorRateLimit || allowExpand) && (
        <div
          className={cn(
            'relative shrink-0 border-b border-border/40 bg-secondary/20',
            allowExpand && !(showConsultorRateLimit && remaining !== null) && 'h-10'
          )}
        >
          {showConsultorRateLimit && remaining !== null && (
            <div
              className={cn(
                'px-4 py-2.5 text-[11px] text-muted-foreground text-center',
                allowExpand && 'pr-12'
              )}
            >
              {remaining > 0
                ? `${remaining} mensaje${remaining === 1 ? '' : 's'} restante${remaining === 1 ? '' : 's'} en Consultor (por hora)`
                : 'Límite de Consultor alcanzado — cambia a Solicitud para continuar'}
            </div>
          )}
          {allowExpand && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn(
                'absolute right-2 h-8 w-8 text-muted-foreground hover:text-foreground',
                showConsultorRateLimit && remaining !== null ? 'top-1/2 -translate-y-1/2' : 'top-2'
              )}
              onClick={() => setExpanded(!expanded)}
              aria-label={expanded ? 'Contraer chat' : 'Expandir chat'}
              title={expanded ? 'Contraer (Esc)' : 'Expandir al espacio disponible'}
            >
              {expanded ? <Shrink className="h-4 w-4" /> : <Expand className="h-4 w-4" />}
            </Button>
          )}
        </div>
      )}

      {isGuidedOrder ? (
        <>
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
            <GuidedRequestWizard
              mode="guided"
              loading={guidedSubmitting}
              disabled={rateLimitBlocked}
              disabledReason={
                rateLimitBlocked
                  ? 'Límite de Consultor — cambia a Solicitud o usa pedido en pantalla completa.'
                  : undefined
              }
              createdRequest={createdRequest}
              initialForm={guidedInitialForm}
              onOpen={openGuidedWizard}
              onClose={closeRequestFlow}
              onConfirm={confirmGuidedRequest}
              onStepChange={handleGuidedStepChange}
              chatFocused={chatInputFocused}
              stepChatMessages={
                guidedProgress ? (guidedStepThreads[guidedProgress.step] ?? []) : []
              }
              stepChatLoading={guidedStepChatLoading}
              chatMarkdown={markdown}
              embedded
            />
          </div>

          {chatDock}
        </>
      ) : (
        <>
          <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 space-y-4">{messageList}</div>

          {enableOptionalRequests && isSolicitudMode && guidedMode !== 'guided' && (
            <div className="shrink-0 px-4 pt-3 border-t border-border/40 bg-background/30">
              <GuidedRequestWizard
                mode={guidedMode}
                loading={loading}
                disabled={rateLimitBlocked}
                disabledReason={
                  rateLimitBlocked
                    ? 'Límite de Consultor — cambia a Solicitud o usa pedido en pantalla completa.'
                    : undefined
                }
                createdRequest={createdRequest}
                initialForm={guidedInitialForm}
                onOpen={openGuidedWizard}
                onClose={closeRequestFlow}
                onConfirm={confirmGuidedRequest}
              />
            </div>
          )}

          {chatActive && chatDock}
        </>
      )}
    </div>
  );
}
