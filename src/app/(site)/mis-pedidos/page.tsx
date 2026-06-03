import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { isSergioAdmin } from '@/lib/auth/access';
import { PageHeader } from '@/components/layout/page-header';
import { Section } from '@/components/layout/section';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { RequestsInbox } from '@/components/my-requests/requests-inbox';
import type { MyRequestRow } from '@/components/my-requests/request-card';
import { Sparkles, Inbox, FolderArchive } from 'lucide-react';
import { pedirHubHref, solicitudFormHref } from '@/lib/ai/assistant-modes';
import { MisPedidosAiEntry } from '@/components/my-requests/mis-pedidos-ai-entry';
import { MisPedidosAiBanner } from '@/components/my-requests/mis-pedidos-ai-banner';
import { NotificationSetupPrompt } from '@/components/account/notification-setup-prompt';
import { countOrdersNeedingAttention, MIS_PEDIDOS_AI } from '@/lib/mis-pedidos-ai-copy';
export const metadata = { title: 'Mis pedidos' };

export default async function MisPedidosPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('email, full_name, role, acc_role')
    .eq('id', user.id)
    .single();

  if (isSergioAdmin(profile)) {
    redirect('/command-center/pedidos');
  }

  const email = profile?.email ?? user.email!;

  const { data: requests } = await supabase
    .from('requests')
    .select(
      'id, reference_code, title, type, priority, status, delivery_status, company, created_at, external_url, requester_name, requester_email, sergio_decision, committed_due_date'
    )
    .or(`user_id.eq.${user.id},requester_email.eq.${email}`)
    .order('created_at', { ascending: false });

  const rows = (requests ?? []) as MyRequestRow[];
  const { pendingReview, active } = countOrdersNeedingAttention(rows);

  return (
    <>
      <PageHeader
        badge={profile?.full_name ?? email}
        title="Mis pedidos"
        description="Sigue el avance de cada solicitud. Para estado o plazos usa el AI Agent; para un pedido nuevo, el formulario."
      />

      <Section className="py-8 sm:py-12" containerClassName="max-w-6xl">
        <div className="space-y-5 mb-8">
          <div className="flex flex-wrap items-center gap-3">
            <Button asChild className="glow-aero">
              <Link href={solicitudFormHref({ empezar: true })}>
                <Sparkles className="mr-2 h-4 w-4" />
                Nuevo pedido
              </Link>
            </Button>
            <MisPedidosAiEntry />
            <Button variant="outline" asChild>
              <Link href="/mis-pedidos/archivo">
                <FolderArchive className="mr-2 h-4 w-4" />
                Mis entregas
              </Link>
            </Button>
            <NotificationSetupPrompt variant="link" />
          </div>

          {rows.length > 0 && (
            <>
              <NotificationSetupPrompt variant="banner" />
              <MisPedidosAiBanner pendingReview={pendingReview} active={active} />
            </>
          )}
        </div>

        {rows.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="Aún no tienes pedidos"
            description="Cuando me pidas un dashboard, un evento o una revisión de datos, lo verás aquí con su estado. Mientras tanto, el copiloto te ayuda a aclarar qué pedir."
            action={
              <div className="flex flex-col items-center gap-3">
                <div className="flex flex-wrap gap-2 justify-center">
                  <Button asChild className="glow-aero">
                    <Link href={pedirHubHref()}>Pedir con IA</Link>
                  </Button>
                  <MisPedidosAiEntry />
                </div>
                <p className="text-xs text-muted-foreground max-w-sm text-center">
                  {MIS_PEDIDOS_AI.emptyHint}
                </p>
              </div>
            }
          />
        ) : (
          <RequestsInbox requests={rows} showAiActions />
        )}
      </Section>
    </>
  );
}
