'use client';

import { CommandCenterTopBar } from '@/components/command-center/top-bar';
import { ChatPanel } from '@/components/command-center/chat-panel';

const SUGGESTIONS = [
  '¿Dónde veo las compras por canal?',
  '¿Existe un reporte de revenue por campaña?',
  '¿Cómo veo el abandono del checkout?',
  'Necesito un dashboard de LTV por cohorte',
  '¿Qué mide la tasa de conversión?',
];

export default function CopilotPage() {
  return (
    <>
      <CommandCenterTopBar
        title="Pregúntale"
        subtitle="Como hablar con alguien del equipo — pero disponible 24/7"
      />
      <div className="p-5 max-w-3xl mx-auto">
        <ChatPanel
          module="copilot"
          apiEndpoint="/api/command-center/chat"
          placeholder="Ej: ¿Dónde veo revenue por campaña?"
          suggestions={SUGGESTIONS}
        />
      </div>
    </>
  );
}
