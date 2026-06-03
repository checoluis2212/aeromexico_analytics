'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { SergioAvatar } from '@/components/assistant/sergio-avatar';
import { cn } from '@/lib/utils';

type Props = {
  label?: string;
  className?: string;
};

export function SergioTypingIndicator({
  label = 'Sergio escribe…',
  className,
}: Props) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      className={cn('flex gap-3', className)}
    >
      <SergioAvatar state="thinking" size="sm" />
      <div className="bg-secondary/40 rounded-2xl px-4 py-3 text-sm text-muted-foreground border border-border/40 flex items-center gap-2">
        <span>{label}</span>
        {!reduceMotion && (
          <span className="inline-flex gap-1 items-center" aria-hidden>
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-primary/70"
                animate={{ opacity: [0.35, 1, 0.35], y: [0, -2, 0] }}
                transition={{
                  duration: 0.9,
                  repeat: Infinity,
                  delay: i * 0.15,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </span>
        )}
      </div>
    </motion.div>
  );
}
