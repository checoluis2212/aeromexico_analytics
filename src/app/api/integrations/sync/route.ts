import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { hasInternalAccess } from '@/lib/auth/access';
import { syncFromTrelloCard } from '@/lib/integrations/external-sync';

/** Sincroniza pedidos con Trello (solo equipo interno). */
export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

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
  const { data: rows } = await admin
    .from('requests')
    .select('external_id')
    .eq('external_provider', 'trello')
    .not('external_id', 'is', null);

  let synced = 0;
  for (const row of rows ?? []) {
    if (row.external_id && (await syncFromTrelloCard(row.external_id))) {
      synced += 1;
    }
  }

  return NextResponse.json({ synced, total: rows?.length ?? 0 });
}
