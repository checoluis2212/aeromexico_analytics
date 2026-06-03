import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MIS_PEDIDOS_AI } from '@/lib/mis-pedidos-ai-copy';
import { aiAgentHref } from '@/lib/ai/assistant-modes';
import { cn } from '@/lib/utils';

type Props = {
  requestId?: string;
  requestTitle?: string;
  variant?: 'toolbar' | 'detail' | 'compact' | 'table';
  className?: string;
};

function href(requestId?: string) {
  return requestId ? aiAgentHref({ pedido: requestId }) : aiAgentHref();
}

export function MisPedidosAiEntry({
  requestId,
  requestTitle,
  variant = 'toolbar',
  className,
}: Props) {
  if (variant === 'table') {
    return (
      <Link
        href={href(requestId)}
        className={cn(
          'inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-primary',
          'hover:bg-primary/10 transition-colors',
          className
        )}
        title={MIS_PEDIDOS_AI.valueProp}
      >
        <Sparkles className="h-3.5 w-3.5 shrink-0" />
        <span className="hidden xl:inline">{MIS_PEDIDOS_AI.tableLabel}</span>
      </Link>
    );
  }

  if (variant === 'compact') {
    return (
      <Link
        href={href(requestId)}
        className={cn(
          'inline-flex items-center gap-1 rounded-full border border-primary/25 bg-primary/5 px-2 py-0.5',
          'text-[11px] font-medium text-primary hover:bg-primary/10 transition-colors',
          className
        )}
        title={MIS_PEDIDOS_AI.valueProp}
      >
        <Sparkles className="h-3 w-3" />
        {MIS_PEDIDOS_AI.compactLabel}
      </Link>
    );
  }

  if (variant === 'detail') {
    return (
      <div
        className={cn(
          'rounded-xl border border-primary/25 bg-gradient-to-br from-primary/[0.08] to-transparent p-5 sm:p-6',
          className
        )}
      >
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Sparkles className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-base font-semibold">{MIS_PEDIDOS_AI.shortLabel}</p>
              <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
                Nuevo
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
              {requestTitle ? (
                <>
                  Pregunta sobre <span className="text-foreground/90">&quot;{requestTitle.slice(0, 55)}
                  {requestTitle.length > 55 ? '…' : ''}&quot;</span> — {MIS_PEDIDOS_AI.valuePropShort.toLowerCase()}.
                </>
              ) : (
                MIS_PEDIDOS_AI.valueProp
              )}
            </p>
            <p className="text-[11px] text-muted-foreground/80 mt-2">{MIS_PEDIDOS_AI.trustLine}</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {MIS_PEDIDOS_AI.detailExamples.map((q) => (
                <li key={q}>
                  <span className="inline-block rounded-full bg-secondary/80 px-2.5 py-1 text-[11px] text-muted-foreground">
                    {q}
                  </span>
                </li>
              ))}
            </ul>
            <Button asChild size="sm" className="mt-4 glow-aero">
              <Link href={href(requestId)}>
                <Sparkles className="mr-2 h-3.5 w-3.5" />
                Preguntar ahora
                <ArrowRight className="ml-2 h-3.5 w-3.5 opacity-70" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col sm:flex-row sm:items-center gap-2', className)}>
      <Button asChild variant="outline" className="border-primary/30 hover:bg-primary/5">
        <Link href={href(requestId)}>
          <Sparkles className="mr-2 h-4 w-4" />
          {MIS_PEDIDOS_AI.shortLabel}
        </Link>
      </Button>
      <p className="text-xs text-muted-foreground max-w-[220px] leading-snug hidden sm:block">
        {MIS_PEDIDOS_AI.valuePropShort}
      </p>
    </div>
  );
}
