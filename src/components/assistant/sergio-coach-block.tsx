'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import {
  SergioAvatar,
  type SergioAvatarState,
} from '@/components/assistant/sergio-avatar';
import { siteConfig } from '@/lib/constants';
import type { GuidedWizardStepId, GuidedRequestForm } from '@/lib/ai/guided-request-coach';
import { getSergioCoachMessage } from '@/lib/ai/guided-request-coach';

type Props = {
  step: GuidedWizardStepId;
  form: GuidedRequestForm;
  loading?: boolean;
  chatFocused?: boolean;
  success?: boolean;
};

function resolveState(
  loading: boolean,
  chatFocused: boolean,
  success: boolean,
  speaking: boolean
): SergioAvatarState {
  if (success) return 'success';
  if (loading) return 'thinking';
  if (chatFocused) return 'listening';
  if (speaking) return 'speaking';
  return 'idle';
}

export function SergioCoachBlock({
  step,
  form,
  loading = false,
  chatFocused = false,
  success = false,
}: Props) {
  const reduceMotion = useReducedMotion();
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    if (reduceMotion) return;
    setSpeaking(true);
    const t = setTimeout(() => setSpeaking(false), 700);
    return () => clearTimeout(t);
  }, [step, reduceMotion]);

  const avatarState = resolveState(loading, chatFocused, success, speaking);

  return (
    <div className="rounded-xl border border-primary/20 bg-gradient-to-r from-primary/[0.07] to-transparent p-3 overflow-hidden">
      <div className="flex gap-3">
        <SergioAvatar state={avatarState} size="md" />
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-[11px] font-semibold text-primary flex items-center gap-1.5">
            {siteConfig.author}
            <span className="inline-flex items-center gap-0.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-medium normal-case text-primary/90">
              <Sparkles className="h-2.5 w-2.5" />
              con IA
            </span>
          </p>
          <AnimatePresence mode="wait">
            <motion.p
              key={step}
              initial={reduceMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -4 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="text-xs text-muted-foreground leading-relaxed"
            >
              {getSergioCoachMessage(step, form)}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
