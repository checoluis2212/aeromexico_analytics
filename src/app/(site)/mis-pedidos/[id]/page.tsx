import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/layout/page-header';
import { Section } from '@/components/layout/section';
import { RequestDetailPanel } from '@/components/my-requests/request-detail-panel';
import { RequestDetailTracker } from '@/components/analytics/request-detail-tracker';
import { MisPedidosAiEntry } from '@/components/my-requests/mis-pedidos-ai-entry';
import { NotificationSetupPrompt } from '@/components/account/notification-setup-prompt';
import { mapDeliveryStatusForUser } from '@/lib/integrations/external-sync';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const metadata = { title: 'Detalle del pedido' };

export default async function MisPedidoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?redirect=/mis-pedidos/${id}`);

  const { data: profile } = await supabase
    .from('profiles')
    .select('email')
    .eq('id', user.id)
    .single();

  const email = profile?.email ?? user.email!;

  const { data: request } = await supabase
    .from('requests')
    .select('*')
    .eq('id', id)
    .or(`user_id.eq.${user.id},requester_email.eq.${email}`)
    .single();

  if (!request) notFound();

  const { data: comments } = await supabase
    .from('request_comments')
    .select('id, author_name, content, created_at, is_internal, user_id')
    .eq('request_id', id)
    .eq('is_internal', false)
    .order('created_at', { ascending: true });

  const { data: deliveries } = await supabase
    .from('request_deliveries')
    .select('*')
    .eq('request_id', id)
    .order('created_at', { ascending: false });

  const statusLabel = mapDeliveryStatusForUser(request.delivery_status ?? request.status);

  return (
    <>
      <PageHeader
        badge={request.reference_code ?? statusLabel}
        title={request.title}
        description={`Pedido del ${format(new Date(request.created_at), "d MMM yyyy", { locale: es })}${request.reference_code ? ` · ${request.reference_code}` : ''}`}
      />

      <Section className="py-8 sm:py-12" containerClassName="max-w-6xl">
        <RequestDetailTracker
          requestId={request.id}
          deliveryStatus={request.delivery_status}
          sergioDecision={request.sergio_decision}
        />
        <div className="mb-6 space-y-4">
          <MisPedidosAiEntry
            variant="detail"
            requestId={request.id}
            requestTitle={request.title}
          />
          <NotificationSetupPrompt variant="inline" />
        </div>
        <RequestDetailPanel
          request={request}
          comments={comments ?? []}
          backHref="/mis-pedidos"
          currentUserId={user.id}
          deliveries={deliveries ?? []}
        />
      </Section>
    </>
  );
}
