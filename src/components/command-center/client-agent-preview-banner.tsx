import Link from 'next/link';
import { ArrowRight, Shield } from 'lucide-react';
import { ADMIN_AGENT_PATH } from '@/lib/ai/agent-scope';

/** Aviso cuando Sergio entra al AI Agent del portal a propósito (vista previa). */
export function ClientAgentPreviewBanner() {
  return (
    <div className="border-b border-amber-500/30 bg-amber-500/10 px-4 sm:px-6 py-3">
      <div className="mx-auto max-w-6xl flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm">
        <div className="flex items-start gap-2 min-w-0">
          <Shield className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-muted-foreground leading-relaxed">
            <span className="text-foreground font-medium">Vista previa del portal cliente.</span>{' '}
            Este chat no es el Admin Agent: no opera la bandeja ni el semáforo desde aquí.
          </p>
        </div>
        <Link
          href={ADMIN_AGENT_PATH}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline shrink-0"
        >
          Ir al Admin Agent
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
