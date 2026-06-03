import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getUseCaseById } from '@/lib/ai/aeromexico-use-cases';
import {
  aiAgentHref,
  aiAgentLoginRedirect,
  solicitudFormHref,
} from '@/lib/ai/assistant-modes';
import { PreguntaleContent } from './preguntale-content';

export const metadata = {
  title: 'Pedir trabajo',
  description: 'Formulario para solicitar dashboards, eventos, embudos o revisión de datos a Sergio.',
};

type Props = {
  searchParams: Promise<{
    pedido?: string;
    escenario?: string;
    modo?: string;
    empezar?: string;
  }>;
};

async function PreguntalePageInner({ searchParams }: Props) {
  const { pedido, escenario, modo, empezar } = await searchParams;

  if (pedido || modo === 'consultor') {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const target = aiAgentHref({
      pedido: pedido ?? undefined,
      escenario: escenario && getUseCaseById(escenario) ? escenario : undefined,
    });
    if (!user) redirect(aiAgentLoginRedirect(pedido ? { pedido } : undefined));
    redirect(target);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(
      `/login?redirect=${encodeURIComponent(
        solicitudFormHref({
          escenario: escenario && getUseCaseById(escenario) ? escenario : undefined,
          empezar: empezar === '1',
        })
      )}`
    );
  }

  const initialScenarioId =
    escenario && getUseCaseById(escenario) ? escenario : undefined;

  return (
    <PreguntaleContent
      autoStartGuided={empezar === '1'}
      initialScenarioId={initialScenarioId}
    />
  );
}

export default function PreguntalePage(props: Props) {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center px-4 text-sm text-muted-foreground">
          Cargando formulario…
        </div>
      }
    >
      <PreguntalePageInner {...props} />
    </Suspense>
  );
}
