import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('email')
    .eq('id', user.id)
    .single();

  const email = profile?.email ?? user.email;
  if (!email) {
    return NextResponse.json({ error: 'Perfil sin email' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('requests')
    .select('id, title, type, priority, status, delivery_status, company, created_at, updated_at, external_provider, external_url, external_status')
    .or(`user_id.eq.${user.id},requester_email.eq.${email}`)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}
