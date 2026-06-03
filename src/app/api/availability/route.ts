import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSergioAvailability, updateSergioAvailability, type SergioCapacity } from '@/lib/availability';
import { hasInternalAccess } from '@/lib/auth/access';
import { notifySemaphoreChange } from '@/lib/notifications/semaphore-notify';

const VALID: SergioCapacity[] = ['available', 'limited', 'full', 'oof'];

export async function GET() {
  const availability = await getSergioAvailability();
  return NextResponse.json(availability);
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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
  const capacity = body.capacity as SergioCapacity;

  if (!VALID.includes(capacity)) {
    return NextResponse.json({ error: 'Estado inválido' }, { status: 400 });
  }

  try {
    const previous = await getSergioAvailability();
    const availability = await updateSergioAvailability({
      capacity,
      note: body.note ?? null,
      userId: user.id,
    });

    void notifySemaphoreChange({
      previous,
      next: availability,
      changedByEmail: profile?.email ?? user.email,
      changedByName: profile?.full_name,
    }).catch((err) => console.error('[availability] notifySemaphoreChange', err));

    return NextResponse.json(availability);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Error al guardar';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
