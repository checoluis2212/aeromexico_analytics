import type { LucideIcon } from 'lucide-react';
import { BarChart3, LineChart, Sparkles, Zap } from 'lucide-react';
import { aiAgentHref, solicitudFormHref } from '@/lib/ai/assistant-modes';

export type PedirIntent = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  featured?: boolean;
};

/** Rutas del flujo de pedidos y formulario */
export const CLIENT_PEDIR_PATHS = ['/pedir', '/preguntale'] as const;

export function isClientPedirPath(pathname: string): boolean {
  return CLIENT_PEDIR_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
}

export const PEDIR_PRIMARY_INTENTS: PedirIntent[] = [
  {
    id: 'solicitud',
    title: 'Pedir trabajo a Sergio',
    description:
      'Dashboard, evento GA4, embudo o revisión de datos. Formulario en cinco pasos — sin chat.',
    icon: Sparkles,
    href: solicitudFormHref({ empezar: true }),
    featured: true,
  },
  {
    id: 'ai-agent',
    title: 'AI Agent · Insights',
    description:
      'Pregunta por eventos, ingresos, ROAS, embudos o campañas. Respuestas en lenguaje de negocio con datos de la base de datos de Aeroméxico.',
    icon: BarChart3,
    href: aiAgentHref(),
  },
];

export const PEDIR_QUICK_INTENTS: PedirIntent[] = [
  {
    id: 'dashboard',
    title: 'Dashboard o reporte',
    description: 'KPIs de campaña, revenue, embudo…',
    icon: BarChart3,
    href: solicitudFormHref({ escenario: 'campaign_dashboard', empezar: true }),
  },
  {
    id: 'tracking',
    title: 'Medir algo nuevo',
    description: 'Evento, flujo o feature recién lanzado',
    icon: Zap,
    href: solicitudFormHref({ empezar: true }),
  },
  {
    id: 'funnel',
    title: 'Embudo o conversión',
    description: 'Dónde se cae la gente antes de pagar',
    icon: LineChart,
    href: solicitudFormHref({ escenario: 'checkout_funnel', empezar: true }),
  },
];
