'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ChatPanel } from '@/components/command-center/chat-panel';
import {
  CLIENT_AGENT_SHORTCUTS,
  CONSULTOR_WELCOME,
  CONSULTOR_SUGGESTIONS,
} from '@/lib/ai/client-agent-shortcuts';
import { pedirHubHref, solicitudFormHref } from '@/lib/ai/assistant-modes';
import { ClientAgentPreviewBanner } from '@/components/command-center/client-agent-preview-banner';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { portalChatPanelClass, portalContentClass } from '@/lib/layout/portal';
import { cn } from '@/lib/utils';

type Props = {
  requestId?: string;
  welcomeMessage?: string;
  requestLabel?: string;
  suggestions?: string[];
  initialScenarioId?: string;
  /** Sergio con ?vista=cliente — aviso de que no es Admin Agent */
  showClientPreviewBanner?: boolean;
};

export function AiAgentContent({
  requestId,
  welcomeMessage,
  requestLabel,
  suggestions,
  initialScenarioId,
  showClientPreviewBanner = false,
}: Props) {
  const isOrderMode = Boolean(requestId);

  const title = isOrderMode
    ? `Pedido${requestLabel ? ` · ${requestLabel}` : ''}`
    : 'AI Agent';

  const description = isOrderMode
    ? 'Pregunta por el estado de tu pedido. Uso la misma información que ves en Mis pedidos.'
    : 'Ver pedidos, resolver dudas de analytics o pedir trabajo nuevo al equipo.';

  return (
    <div className="flex flex-1 flex-col min-h-0">
      {showClientPreviewBanner && <ClientAgentPreviewBanner />}
      <PageHeader
        badge={isOrderMode ? 'Seguimiento' : 'Consultor'}
        title={title}
        description={description}
      >
        <div className="flex flex-wrap gap-2">
          {!isOrderMode && (
            <Button variant="outline" size="sm" asChild>
              <Link href={solicitudFormHref({ empezar: true })}>Pedir trabajo</Link>
            </Button>
          )}
          {isOrderMode && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/mis-pedidos/${requestId}`}>
                Ver pedido
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
          )}
          {!isOrderMode && (
            <Button variant="ghost" size="sm" asChild>
              <Link href={pedirHubHref()}>Comparar con formulario</Link>
            </Button>
          )}
        </div>
      </PageHeader>

      <div className={cn(portalContentClass, 'py-6 sm:py-8 pb-10')}>
        <ChatPanel
          key={isOrderMode ? `order-${requestId}` : 'ai-agent'}
          module="tracking_assistant"
          apiEndpoint="/api/tracking-assistant/chat"
          markdown
          showRateLimit={false}
          assistantMode="consultor"
          enableGuidedRequestInConsultor={!isOrderMode}
          panelClassName={portalChatPanelClass}
          welcomeMessage={welcomeMessage ?? CONSULTOR_WELCOME}
          scenarios={isOrderMode ? [] : CLIENT_AGENT_SHORTCUTS}
          suggestions={isOrderMode ? (suggestions ?? []) : CONSULTOR_SUGGESTIONS}
          requestId={requestId}
          initialScenarioId={initialScenarioId}
          placeholder={
            isOrderMode
              ? 'Ej: ¿En qué va mi pedido? ¿Necesito hacer algo?'
              : 'Ej: ¿qué datos necesitas para un reporte de ROAS?'
          }
        />
      </div>
    </div>
  );
}
