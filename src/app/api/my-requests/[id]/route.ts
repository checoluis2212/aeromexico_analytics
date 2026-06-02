import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  _request: Request,
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
    .select('email')
    .eq('id', user.id)
    .single();

  const email = profile?.email ?? user.email;

  const { data, error } = await supabase
    .from('requests')
    .select('*')
    .eq('id', id)
    .or(`user_id.eq.${user.id},requester_email.eq.${email}`)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
  }

  const { data: comments } = await supabase
    .from('request_comments')
    .select('id, author_name, content, created_at')
    .eq('request_id', id)
    .eq('is_internal', false)
    .order('created_at', { ascending: true });

  return NextResponse.json({ ...data, comments: comments ?? [] });
}
