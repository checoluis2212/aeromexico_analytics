'use client';

import { CommandCenterTopBar } from '@/components/command-center/top-bar';
import { ChatPanel } from '@/components/command-center/chat-panel';

const SUGGESTIONS = [
  '¿Existe un reporte para compras por canal?',
  '¿Dónde veo revenue por campaña?',
  '¿Cómo veo abandono de checkout?',
  '¿Hay un dashboard de LTV por cohorte?',
  '¿Qué reporte muestra engagement de la app móvil?',
];

export default function ReportDiscoveryPage() {
  return (
    <>
      <CommandCenterTopBar
        title="Report Discovery Assistant"
        subtitle="Encuentra reportes existentes o crea una nueva solicitud"
        badge="AI"
      />
      <div className="p-6 max-w-4xl mx-auto">
        <ChatPanel
          module="discovery"
          apiEndpoint="/api/command-center/chat"
          placeholder="Pregunta sobre reportes, métricas o dashboards..."
          suggestions={SUGGESTIONS}
        />
      </div>
    </>
  );
}
