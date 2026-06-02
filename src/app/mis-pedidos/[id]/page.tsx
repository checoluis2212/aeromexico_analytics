import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/layout/page-header';
import { Section } from '@/components/layout/section';
import { RequestDetailPanel } from '@/components/my-requests/request-detail-panel';
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
  if (!user) redirect('/login');

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

  const statusLabel = mapDeliveryStatusForUser(request.delivery_status ?? request.status);

  return (
    <>
      <PageHeader
        badge={statusLabel}
        title={request.title}
        description={`Pedido del ${format(new Date(request.created_at), "d MMM yyyy", { locale: es })}`}
      />

      <Section>
        <RequestDetailPanel
          request={request}
          comments={comments ?? []}
          backHref="/mis-pedidos"
          currentUserId={user.id}
        />
      </Section>
    </>
  );
}
