import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { DeliveryStatus } from '@/types/command-center';

const VALID_STATUSES: DeliveryStatus[] = [
  'backlog', 'discovery', 'requirements', 'ready_for_development',
  'development', 'analytics_qa', 'ready_for_release', 'done', 'blocked',
];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const status = body.delivery_status as DeliveryStatus;

  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('requests')
    .update({ delivery_status: status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select('id, delivery_status')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabase.from('activity_logs').insert({
    user_id: user.id,
    action: 'status_change',
    entity_type: 'request',
    entity_id: id,
    metadata: { delivery_status: status },
  });

  return NextResponse.json(data);
}
