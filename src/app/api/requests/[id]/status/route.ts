import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { hasInternalAccess } from '@/lib/auth/access';
import { notifyRequestUpdate, statusChangeMessage } from '@/lib/notifications/request-notify';
import type { DeliveryStatus } from '@/types/command-center';
import { DELIVERY_STATUSES } from '@/types/command-center';

const VALID = DELIVERY_STATUSES.map((s) => s.value);

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, acc_role, full_name, email')
    .eq('id', user.id)
    .single();

  if (!hasInternalAccess(profile)) {
    return NextResponse.json({ error: 'Sin permiso' }, { status: 403 });
  }

  const body = await request.json();
  const delivery_status = body.delivery_status as DeliveryStatus;

  if (!VALID.includes(delivery_status)) {
    return NextResponse.json({ error: 'Estado inválido' }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: existing } = await admin
    .from('requests')
    .select('id, title, delivery_status, status, requester_email, user_id')
    .eq('id', id)
    .single();

  if (!existing) {
    return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
  }

  const oldStatus = existing.delivery_status ?? existing.status ?? 'backlog';
  const newStatusField =
    delivery_status === 'done' ? 'completed' : delivery_status === 'blocked' ? 'blocked' : 'in_progress';

  const { data, error } = await admin
    .from('requests')
    .update({
      delivery_status,
      status: newStatusField,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await admin.from('activity_logs').insert({
    user_id: user.id,
    action: 'status_change',
    entity_type: 'request',
    entity_id: id,
    metadata: { from: oldStatus, to: delivery_status, by: profile?.full_name ?? profile?.email },
  });

  await admin.from('request_comments').insert({
    request_id: id,
    user_id: user.id,
    author_name: profile?.full_name ?? 'Sergio Burgos',
    content: `Estado actualizado → ${delivery_status.replace(/_/g, ' ')}`,
    is_internal: false,
  });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const { title, message } = statusChangeMessage(existing.title, oldStatus, delivery_status);

  await notifyRequestUpdate({
    requestId: id,
    requesterEmail: existing.requester_email,
    requesterUserId: existing.user_id,
    title,
    message,
    link: `${siteUrl}/mis-pedidos/${id}`,
    clientEvent: 'status_change',
  });

  return NextResponse.json(data);
}
