'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { AssistantMarkdown } from '@/components/assistant/assistant-markdown';
import { SergioAvatar } from '@/components/assistant/sergio-avatar';
import { SergioTypingIndicator } from '@/components/assistant/typing-indicator';
import type { CopilotMessage } from '@/types/command-center';
import { stepLabel, type GuidedWizardStepId } from '@/lib/ai/guided-request-coach';
import { cn } from '@/lib/utils';

type Props = {
  step: GuidedWizardStepId;
  messages: CopilotMessage[];
  loading?: boolean;
  markdown?: boolean;
  className?: string;
};

export function GuidedStepChat({ step, messages, loading, markdown, className }: Props) {
  if (messages.length === 0 && !loading) return null;

  return (
    <div
      className={cn(
        'rounded-xl border border-primary/20 bg-primary/[0.04] overflow-hidden',
        className
      )}
      aria-label={`Dudas del paso ${stepLabel(step)}`}
    >
      <div className="px-3 py-2 border-b border-primary/15 bg-primary/[0.06]">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-primary">
          Dudas · paso {stepLabel(step)}
        </p>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          Las respuestas son solo para este paso — el wizard sigue aquí abajo.
        </p>
      </div>

      <div className="max-h-[min(28vh,200px)] overflow-y-auto px-3 py-3 space-y-3">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={`${step}-${i}-${msg.role}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn('flex gap-2', msg.role === 'user' ? 'justify-end' : 'justify-start')}
            >
              {msg.role === 'assistant' && <SergioAvatar state="idle" size="sm" />}
              <div
                className={cn(
                  'max-w-[90%] rounded-xl px-3 py-2 text-xs leading-relaxed',
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background/80 border border-border/40'
                )}
              >
                {msg.role === 'assistant' && markdown ? (
                  <AssistantMarkdown content={msg.content} />
                ) : (
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <div className="scale-90 origin-left">
            <SergioTypingIndicator label="Sergio responde…" />
          </div>
        )}
      </div>
    </div>
  );
}
