'use client';

import Link from 'next/link';
import { ArrowRight, ClipboardList, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  aiAgentHref,
  aiAgentLoginRedirect,
  pedirHubHref,
  pedirLoginRedirect,
  solicitudFormHref,
} from '@/lib/ai/assistant-modes';

type Props = {
  isAuthenticated: boolean;
  authLoading: boolean;
  className?: string;
};

export function HomeStartPaths({ isAuthenticated, authLoading, className }: Props) {
  const pedirHref = !authLoading && isAuthenticated ? pedirHubHref() : pedirLoginRedirect();
  const formHref =
    !authLoading && isAuthenticated ? solicitudFormHref({ empezar: true }) : pedirLoginRedirect();
  const agentHref =
    !authLoading && isAuthenticated ? aiAgentHref() : aiAgentLoginRedirect();

  const paths = [
    {
      id: 'pedir',
      title: 'Pedir trabajo',
      description:
        'Dashboard, embudo, evento nuevo o revisión de datos. Llenas el formulario y te confirmo si lo tomo y para cuándo.',
      href: formHref,
      cta: 'Ir al formulario',
      icon: ClipboardList,
      accent: 'border-primary/25 bg-primary/[0.04] hover:border-primary/40',
    },
    {
      id: 'agent',
      title: 'AI Agent',
      description:
        'Preguntas de analytics — ROAS, GA4, campañas, números raros. Te respondo con contexto de Aeroméxico.',
      href: agentHref,
      cta: 'Abrir chat',
      icon: Sparkles,
      accent: 'border-border/50 bg-card/30 hover:border-primary/30',
    },
  ];

  return (
    <div className={cn('grid gap-4 sm:grid-cols-2', className)}>
      {paths.map((path) => {
        const Icon = path.icon;
        return (
          <Link
            key={path.id}
            href={path.href}
            className={cn(
              'group relative flex flex-col rounded-2xl border p-5 sm:p-6 transition-all duration-200',
              'hover:shadow-lg hover:shadow-primary/[0.06] hover:-translate-y-0.5',
              path.accent
            )}
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4">
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold tracking-tight group-hover:text-primary transition-colors">
              {path.title}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed flex-1">
              {path.description}
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
              {path.cta}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        );
      })}
      <p className="sm:col-span-2 text-xs text-muted-foreground text-center sm:text-left">
        ¿Duda puntual? AI Agent. ¿Quieres que lo trabajemos? Formulario.{' '}
        <Link href={pedirHref} className="text-primary hover:underline">
          Comparar en /pedir
        </Link>
      </p>
    </div>
  );
}
