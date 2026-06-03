'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MIS_PEDIDOS_AI } from '@/lib/mis-pedidos-ai-copy';
import { aiAgentHref } from '@/lib/ai/assistant-modes';
import { cn } from '@/lib/utils';

const STORAGE_KEY = 'aero-mis-pedidos-ai-banner-v1';

type Props = {
  pendingReview: number;
  active: number;
  className?: string;
};

export function MisPedidosAiBanner({ pendingReview, active, className }: Props) {
  const [dismissed, setDismissed] = useState(true);
  const attention = pendingReview + active;

  useEffect(() => {
    setDismissed(localStorage.getItem(STORAGE_KEY) === '1');
  }, []);

  if (dismissed || attention === 0) return null;

  const headline =
    pendingReview > 0
      ? `Tienes ${pendingReview} pedido${pendingReview > 1 ? 's' : ''} en revisión`
      : `Tienes ${active} pedido${active > 1 ? 's' : ''} en curso`;

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border border-primary/25 bg-gradient-to-r from-primary/[0.08] via-primary/[0.04] to-transparent p-4 sm:p-5',
        className
      )}
      role="region"
      aria-label="Copiloto IA para seguimiento de pedidos"
    >
      <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-primary/5 blur-2xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
      <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold tracking-tight">{headline}</p>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed max-w-xl">
            {MIS_PEDIDOS_AI.bannerTitle} {MIS_PEDIDOS_AI.bannerBody}
          </p>
          <p className="text-[10px] text-muted-foreground/80 mt-2">{MIS_PEDIDOS_AI.trustLine}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button asChild size="sm" className="glow-aero">
            <Link href={aiAgentHref()}>
              <Sparkles className="mr-2 h-3.5 w-3.5" />
              {MIS_PEDIDOS_AI.shortLabel}
            </Link>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground"
            aria-label="Ocultar aviso"
            onClick={() => {
              localStorage.setItem(STORAGE_KEY, '1');
              setDismissed(true);
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
