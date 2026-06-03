'use client';

import { PedirSolicitudForm } from '@/components/pedir/pedir-solicitud-form';

type Props = {
  autoStartGuided?: boolean;
  initialScenarioId?: string;
};

export function PreguntaleContent({ autoStartGuided, initialScenarioId }: Props) {
  return (
    <PedirSolicitudForm
      autoStart={autoStartGuided}
      initialScenarioId={initialScenarioId}
    />
  );
}
