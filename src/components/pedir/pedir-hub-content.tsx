'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { AvailabilitySemaphoreLive } from '@/components/availability/availability-semaphore-live';
import { siteConfig } from '@/lib/constants';
import {
  PEDIR_PRIMARY_INTENTS,
  PEDIR_QUICK_INTENTS,
} from '@/lib/pedir/intents';
import { portalContentClass } from '@/lib/layout/portal';
import { cn } from '@/lib/utils';
import { useTrackEvent } from '@/components/analytics/analytics-context';

export function PedirHubContent() {
  const track = useTrackEvent();

  useEffect(() => {
    track('request_hub_view');
  }, [track]);

  function trackIntent(intentId: string, destination: string) {
    track('request_intent_click', { intent_id: intentId, destination });
  }
  return (
    <div className="flex flex-1 flex-col min-h-0 overflow-y-auto">
      <div className={cn(portalContentClass, 'py-8 sm:py-10 space-y-8')}>
        <header className="space-y-3">
          <p className="text-[11px] font-medium uppercase tracking-wider text-primary">
            Portal de pedidos
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            ¿Qué necesitas de <span className="gradient-text">analytics</span>?
          </h1>
          <p className="text-sm text-muted-foreground max-w-xl leading-relaxed">
            Elige una ruta: formulario de pedido o AI Agent para insights.
          </p>
          <div className="max-w-xs pt-1">
            <AvailabilitySemaphoreLive />
          </div>
        </header>

        <div className="grid gap-3 sm:grid-cols-2">
          {PEDIR_PRIMARY_INTENTS.map((intent) => {
            const Icon = intent.icon;
            return (
              <Link
                key={intent.id}
                href={intent.href}
                onClick={() => trackIntent(intent.id, intent.href)}
                className={cn(
                  'group relative flex flex-col rounded-2xl border p-5 sm:p-6 transition-all',
                  intent.featured
                    ? 'border-primary/30 bg-gradient-to-br from-primary/[0.08] to-transparent hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5'
                    : 'border-border/50 bg-card/30 hover:border-border hover:bg-card/50'
                )}
              >
                <div
                  className={cn(
                    'mb-4 flex h-10 w-10 items-center justify-center rounded-xl',
                    intent.featured ? 'bg-primary/15 text-primary' : 'bg-secondary/80 text-foreground'
                  )}
                >
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <h2 className="text-base font-semibold tracking-tight">{intent.title}</h2>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed flex-1">
                  {intent.description}
                </p>
                <span
                  className={cn(
                    'mt-4 inline-flex items-center gap-1.5 text-xs font-medium',
                    intent.featured ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                  )}
                >
                  Continuar
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            );
          })}
        </div>

        <section className="space-y-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Atajos frecuentes
          </p>
          <div className="flex flex-wrap gap-2">
            {PEDIR_QUICK_INTENTS.map((intent) => {
              const Icon = intent.icon;
              return (
                <Link
                  key={intent.id}
                  href={intent.href}
                  onClick={() => trackIntent(intent.id, intent.href)}
                  className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/40 px-3.5 py-2 text-xs hover:border-primary/30 hover:bg-primary/[0.04] transition-colors"
                >
                  <Icon className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="font-medium">{intent.title}</span>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
