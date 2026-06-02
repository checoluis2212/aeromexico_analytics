import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { hasInternalAccess } from '@/lib/auth/access';
import { getSergioAvailability } from '@/lib/availability';
import { adviseCapacity } from '@/lib/ai/capacity-advisor';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, acc_role')
    .eq('id', user.id)
    .single();

  if (!hasInternalAccess(profile)) {
    return NextResponse.json({ error: 'Sin permiso' }, { status: 403 });
  }

  const admin = createAdminClient();
  const [{ data: request }, { data: openRequests }, availability] = await Promise.all([
    admin
      .from('requests')
      .select('id, title, type, priority, description, company, ai_capacity_advice')
      .eq('id', id)
      .single(),
    admin
      .from('requests')
      .select('id, priority, type, sergio_decision, delivery_status'),
    getSergioAvailability(),
  ]);

  if (!request) {
    return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
  }

  const advice = await adviseCapacity({
    request,
    openRequests: openRequests ?? [],
    capacity: availability.capacity,
  });

  await admin
    .from('requests')
    .update({ ai_capacity_advice: advice })
    .eq('id', id);

  return NextResponse.json(advice);
}
