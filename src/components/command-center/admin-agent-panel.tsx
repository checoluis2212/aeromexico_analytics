'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Bot, User, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { AssistantMarkdown } from '@/components/assistant/assistant-markdown';
import { SergioAvatar } from '@/components/assistant/sergio-avatar';
import { SergioTypingIndicator } from '@/components/assistant/typing-indicator';
import { AdminAgentScenarios } from '@/components/command-center/admin-agent-scenarios';
import {
  ADMIN_AGENT_QUERY_SHORTCUTS,
  ADMIN_AGENT_PANEL_LINKS,
  ADMIN_AGENT_WELCOME,
  ADMIN_AGENT_SUGGESTIONS,
} from '@/lib/ai/admin-agent/shortcuts';
import type { AdminPendingAction } from '@/lib/ai/admin-agent/types';
import type { CopilotMessage } from '@/types/command-center';
import { commandCenterChatPanelClass } from '@/lib/layout/command-center';
import { cn } from '@/lib/utils';

type HistoryTurn = { role: string; content: string };

type Props = {
  className?: string;
};

export function AdminAgentPanel({ className }: Props) {
  const [messages, setMessages] = useState<CopilotMessage[]>(() => [
    { role: 'assistant', content: ADMIN_AGENT_WELCOME },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingAction, setPendingAction] = useState<AdminPendingAction | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const hasUserMessage = messages.some((m) => m.role === 'user');

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, pendingAction]);

  async function send(
    text: string,
    opts?: { action?: 'confirm_action' | 'cancel_action'; displayText?: string }
  ) {
    const trimmed = text.trim();
    if (!trimmed && !opts?.action) return;

    const display = opts?.displayText ?? trimmed;
    if (display) {
      setMessages((m) => [...m, { role: 'user', content: display }]);
    }
    setInput('');
    setLoading(true);

    const history: HistoryTurn[] = messages
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .slice(-10)
      .map((m) => ({ role: m.role, content: m.content }));

    try {
      const res = await fetch('/api/command-center/admin-agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed || (opts?.action === 'confirm_action' ? 'confirmo' : 'no'),
          history,
          action: opts?.action,
          pending_action: pendingAction,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessages((m) => [
          ...m,
          { role: 'assistant', content: data.error ?? 'Error al conectar con el agente.' },
        ]);
        return;
      }
      setMessages((m) => [...m, { role: 'assistant', content: data.reply }]);
      setPendingAction(data.pending_action ?? null);
    } catch {
      setMessages((m) => [
        ...m,
        { role: 'assistant', content: 'No pude conectar. Reintenta en un momento.' },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    send(input);
  }

  return (
    <div
      className={cn(
        'flex flex-col rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm',
        'shadow-lg shadow-primary/[0.04] overflow-hidden w-full',
        commandCenterChatPanelClass,
        className
      )}
    >
      <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-5">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={`${msg.role}-${i}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn('flex gap-3', msg.role === 'user' ? 'justify-end' : 'justify-start')}
            >
              {msg.role === 'assistant' && <SergioAvatar state="idle" size="sm" />}
              <div
                className={cn(
                  'max-w-[min(88%,42rem)] rounded-2xl px-4 py-3 text-sm sm:text-[15px] leading-relaxed',
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-secondary/40 border border-border/40'
                )}
              >
                {msg.role === 'assistant' ? (
                  <AssistantMarkdown content={msg.content} />
                ) : (
                  <span className="whitespace-pre-wrap">{msg.content}</span>
                )}
              </div>
              {msg.role === 'user' && (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary ring-1 ring-border/50">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {!hasUserMessage && (
          <AdminAgentScenarios
            queries={ADMIN_AGENT_QUERY_SHORTCUTS}
            panelLinks={ADMIN_AGENT_PANEL_LINKS}
            onSelect={(chip) => {
              if (chip.message) send(chip.message, { displayText: chip.title });
            }}
            disabled={loading}
          />
        )}

        {loading && <SergioTypingIndicator label="Revisando bandeja…" />}

        {pendingAction && !loading && (
          <div className="rounded-2xl border border-amber-500/40 bg-amber-500/[0.08] px-5 py-4 space-y-4 max-w-2xl">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/15">
                <Bot className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Confirmar acción</p>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  {pendingAction.summary}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                className="glow-aero"
                onClick={() =>
                  send('confirmo', { action: 'confirm_action', displayText: 'Sí, confirmar' })
                }
                disabled={loading}
              >
                <Check className="h-3.5 w-3.5 mr-1.5" />
                Confirmar
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setPendingAction(null);
                  send('no', { action: 'cancel_action', displayText: 'Cancelar' });
                }}
                disabled={loading}
              >
                <X className="h-3.5 w-3.5 mr-1.5" />
                Cancelar
              </Button>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="shrink-0 border-t border-primary/20 bg-background/95 backdrop-blur-sm">
        <div className="px-4 sm:px-5 pt-3 pb-1 flex gap-2 overflow-x-auto scrollbar-thin">
          {ADMIN_AGENT_SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              disabled={loading}
              onClick={() => send(s)}
              className="shrink-0 text-xs sm:text-[13px] px-3.5 py-2 rounded-full border border-primary/20 bg-primary/[0.04] hover:bg-primary/10 hover:border-primary/35 transition-colors whitespace-nowrap"
            >
              {s}
            </button>
          ))}
        </div>

        <div className="p-4 sm:p-5 space-y-2">
          <p className="text-[11px] text-muted-foreground px-0.5">
            <span className="text-foreground font-medium">Enter</span> envía ·{' '}
            <span className="text-foreground font-medium">Shift+Enter</span> nueva línea
          </p>
          <form onSubmit={handleSubmit} className="flex gap-2.5">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ej: pedidos pendientes · últimas solicitudes · acepta AMX-1042 para el 2026-06-15"
              rows={1}
              className="min-h-[52px] max-h-32 resize-none text-sm sm:text-[15px] rounded-xl bg-background ring-1 ring-primary/20 focus-visible:ring-primary/45 shadow-sm"
              disabled={loading}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <Button
              type="submit"
              size="icon"
              disabled={loading || !input.trim()}
              className="shrink-0 h-[52px] w-[52px] rounded-xl glow-aero"
              aria-label="Enviar mensaje"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
