'use client';

import { CommandCenterTopBar } from '@/components/command-center/top-bar';
import { ChatPanel } from '@/components/command-center/chat-panel';

const SUGGESTIONS = [
  'Genera SQL BigQuery para revenue por canal últimos 30 días',
  'Crea un evento GA4 para add_to_cart con parámetros',
  'Genera un Measurement Plan para funnel de registro',
  'Explica qué mide la tasa de conversión y cómo se calcula',
  'Genera QA checklist para deploy de GTM',
];

export default function CopilotPage() {
  return (
    <>
      <CommandCenterTopBar
        title="AI Analytics Copilot"
        subtitle="SQL · Eventos GA4 · Measurement Plans · User Stories · QA"
        badge="Copilot"
      />
      <div className="p-6 max-w-4xl mx-auto">
        <ChatPanel
          module="copilot"
          apiEndpoint="/api/command-center/chat"
          placeholder="Pide SQL, eventos, planes de medición, user stories..."
          suggestions={SUGGESTIONS}
        />
      </div>
    </>
  );
}
