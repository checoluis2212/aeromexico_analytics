import { assertSergioAdmin } from '@/lib/auth/guards';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { CommandCenterTopBar } from '@/components/command-center/top-bar';
import { CommandCenterPageContent } from '@/components/command-center/command-center-page-content';
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

  const [
    { data: deliveries },
    { data: lookerLibrary },
    { data: gtmLibrary },
  ] = await Promise.all([
    supabase
      .from('request_deliveries')
      .select('*')
      .eq('request_id', id)
      .order('created_at', { ascending: false }),
    supabase
      .from('looker_dashboard_library')
      .select('*')
      .eq('is_active', true)
      .order('sort_order'),
    supabase
      .from('gtm_debug_video_library')
      .select('*')
      .eq('is_active', true)
      .order('sort_order'),
  ]);

  const statusLabel = mapDeliveryStatusForUser(request.delivery_status ?? request.status);

  return (
    <>
      <CommandCenterTopBar
        title={request.title}
        subtitle={`${statusLabel} · ${request.requester_name} · ${request.requester_email}`}
      />

      <CommandCenterPageContent>
        <RequestDetailPanel
          request={request}
          comments={comments ?? []}
          backHref="/command-center/pedidos"
          currentUserId={user?.id}
          isInternal
          deliveries={deliveries ?? []}
          lookerLibrary={lookerLibrary ?? []}
          gtmLibrary={gtmLibrary ?? []}
        />
      </CommandCenterPageContent>
    </>
  );
}
