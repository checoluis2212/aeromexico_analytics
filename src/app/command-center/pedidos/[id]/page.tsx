import { assertSergioAdmin } from '@/lib/auth/guards';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { CommandCenterTopBar } from '@/components/command-center/top-bar';
import { RequestDetailPanel } from '@/components/my-requests/request-detail-panel';
import { mapDeliveryStatusForUser } from '@/lib/integrations/external-sync';

export const metadata = { title: 'Detalle pedido' };

export default async function PedidoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await assertSergioAdmin();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: request } = await supabase
    .from('requests')
    .select('*')
    .eq('id', id)
    .single();

  if (!request) notFound();

  const { data: comments } = await supabase
    .from('request_comments')
    .select('id, author_name, content, created_at, is_internal, user_id')
    .eq('request_id', id)
    .order('created_at', { ascending: true });

  const statusLabel = mapDeliveryStatusForUser(request.delivery_status ?? request.status);

  return (
    <>
      <CommandCenterTopBar
        title={request.title}
        subtitle={`${statusLabel} · ${request.requester_name} · ${request.requester_email}`}
      />

      <div className="p-5">
        <RequestDetailPanel
          request={request}
          comments={comments ?? []}
          backHref="/command-center/pedidos"
          currentUserId={user?.id}
          isInternal
        />
      </div>
    </>
  );
}
