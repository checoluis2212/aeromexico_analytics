'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type SergioAvatarState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'success';

type Props = {
  state?: SergioAvatarState;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

const sizeMap = {
  sm: { box: 'h-8 w-8 text-[10px]', ring: 'ring-1' },
  md: { box: 'h-9 w-9 text-xs', ring: 'ring-1' },
  lg: { box: 'h-11 w-11 text-sm', ring: 'ring-2' },
};

export function SergioAvatar({ state = 'idle', size = 'md', className }: Props) {
  const reduceMotion = useReducedMotion();
  const s = sizeMap[size];

  const pulse =
    !reduceMotion &&
    (state === 'idle' || state === 'listening' || state === 'speaking');

  return (
    <div className={cn('relative shrink-0', className)}>
      {state === 'listening' && !reduceMotion && (
        <motion.span
          className={cn(
            'absolute inset-0 rounded-full bg-primary/25',
            s.box
          )}
          animate={{ scale: [1, 1.35, 1], opacity: [0.45, 0, 0.45] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
          aria-hidden
        />
      )}

      <motion.div
        className={cn(
          'relative flex items-center justify-center rounded-full font-bold text-primary',
          'bg-primary/15 ring-primary/25',
          s.box,
          s.ring,
          state === 'success' && 'bg-radar/15 text-radar ring-radar/30'
        )}
        animate={
          reduceMotion
            ? undefined
            : state === 'thinking'
              ? { scale: [1, 1.06, 1] }
              : state === 'speaking'
                ? { y: [0, -2, 0] }
                : pulse
                  ? { scale: [1, 1.03, 1] }
                  : { scale: 1 }
        }
        transition={{
          duration: state === 'thinking' ? 0.75 : state === 'speaking' ? 0.45 : 2.4,
          repeat: state === 'thinking' || pulse || state === 'speaking' ? Infinity : 0,
          ease: 'easeInOut',
        }}
      >
        {state === 'success' ? (
          <CheckCircle2 className={cn(size === 'sm' ? 'h-4 w-4' : 'h-5 w-5')} />
        ) : state === 'thinking' ? (
          <Loader2 className={cn('animate-spin', size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4')} />
        ) : (
          'SB'
        )}
      </motion.div>
    </div>
  );
}
