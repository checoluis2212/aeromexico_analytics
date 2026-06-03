import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import {
  loadRequestSnapshotForAssistant,
  buildRequestWelcomeMessage,
  REQUEST_STATUS_SUGGESTIONS,
} from '@/lib/ai/request-assistant-context';
import { getUseCaseById } from '@/lib/ai/aeromexico-use-cases';
import { aiAgentLoginRedirect } from '@/lib/ai/assistant-modes';
import {
  ADMIN_AGENT_PATH,
  shouldRedirectSergioFromClientAgent,
} from '@/lib/ai/agent-scope';
import { isSergioAdmin } from '@/lib/auth/access';
import { AiAgentContent } from './ai-agent-content';

export const metadata = {
  title: 'AI Agent — Insights',
  description:
    'Consultor de inteligencia empresarial con datos consolidados — respuestas en lenguaje de negocio.',
};

type Props = {
  searchParams: Promise<{ pedido?: string; escenario?: string; vista?: string }>;
};

async function AiAgentPageInner({ searchParams }: Props) {
  const { pedido, escenario, vista } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(aiAgentLoginRedirect(pedido ? { pedido } : undefined));
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, acc_role, email')
    .eq('id', user.id)
    .maybeSingle();

  if (
    shouldRedirectSergioFromClientAgent(isSergioAdmin(profile), {
      vista,
      pedido,
      escenario,
    })
  ) {
    redirect(ADMIN_AGENT_PATH);
  }

  const showClientPreviewBanner = isSergioAdmin(profile);

  let requestContext: {
    id: string;
    welcomeMessage: string;
    title: string;
    referenceCode: string | null;
  } | null = null;

  if (pedido) {
    const email = profile?.email ?? user.email!;
    const snapshot = await loadRequestSnapshotForAssistant(pedido, user.id, email);
    if (snapshot) {
      requestContext = {
        id: snapshot.id,
        welcomeMessage: buildRequestWelcomeMessage(snapshot),
        title: snapshot.title,
        referenceCode: snapshot.reference_code,
      };
    }
  }

  const initialScenarioId =
    !requestContext && escenario && getUseCaseById(escenario) ? escenario : undefined;

  return (
    <AiAgentContent
      requestId={requestContext?.id}
      initialScenarioId={initialScenarioId}
      welcomeMessage={requestContext?.welcomeMessage}
      requestLabel={
        requestContext
          ? requestContext.referenceCode ?? requestContext.title.slice(0, 40)
          : undefined
      }
      suggestions={requestContext ? [...REQUEST_STATUS_SUGGESTIONS] : undefined}
      showClientPreviewBanner={showClientPreviewBanner}
    />
  );
}

export default function AiAgentPage(props: Props) {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center px-4 text-sm text-muted-foreground">
          Cargando AI Agent…
        </div>
      }
    >
      <AiAgentPageInner {...props} />
    </Suspense>
  );
}
