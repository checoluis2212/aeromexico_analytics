import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { hasInternalAccess } from '@/lib/auth/access';
import { notifyRequestUpdate } from '@/lib/notifications/request-notify';
import { siteConfig } from '@/lib/constants';
import { z } from 'zod';

const schema = z.object({
  content: z.string().min(1).max(2000),
  is_internal: z.boolean().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  }

  const body = schema.parse(await request.json());
  const { data: profile } = await supabase
    .from('profiles')
    .select('email, full_name, role, acc_role')
    .eq('id', user.id)
    .single();

  const internal = hasInternalAccess(profile);
  const isInternalComment = internal && (body.is_internal ?? false);

  const admin = createAdminClient();
  const { data: reqRow } = await admin
    .from('requests')
    .select('id, title, requester_email, user_id')
    .eq('id', id)
    .single();

  if (!reqRow) {
    return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
  }

  if (!internal) {
    const email = profile?.email ?? user.email;
    const owns =
      reqRow.user_id === user.id ||
      reqRow.requester_email.toLowerCase() === email?.toLowerCase();
    if (!owns) {
      return NextResponse.json({ error: 'Sin acceso' }, { status: 403 });
    }
  }

  const { data: comment, error } = await admin
    .from('request_comments')
    .insert({
      request_id: id,
      user_id: user.id,
      author_name: profile?.full_name ?? user.email ?? 'Usuario',
      content: body.content,
      is_internal: isInternalComment,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!isInternalComment) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
    const author = profile?.full_name ?? 'Usuario';

    if (internal) {
      await notifyRequestUpdate({
        requestId: id,
        requesterEmail: reqRow.requester_email,
        requesterUserId: reqRow.user_id,
        title: `Nuevo mensaje en: ${reqRow.title}`,
        message: `${author}: ${body.content.slice(0, 120)}${body.content.length > 120 ? '…' : ''}`,
        link: `${siteUrl}/mis-pedidos/${id}`,
        clientEvent: 'comment',
      });
    } else {
      await notifyRequestUpdate({
        requestId: id,
        requesterEmail: siteConfig.email,
        title: `Comentario de ${author}`,
        message: `"${reqRow.title}": ${body.content.slice(0, 100)}`,
        link: `${siteUrl}/command-center/pedidos/${id}`,
      });
    }
  }

  return NextResponse.json(comment, { status: 201 });
}

export async function GET(
  _request: NextRequest,
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
    .select('role, acc_role, email')
    .eq('id', user.id)
    .single();

  const internal = hasInternalAccess(profile);

  if (!internal) {
    const admin = createAdminClient();
    const { data: reqRow } = await admin
      .from('requests')
      .select('id, user_id, requester_email')
      .eq('id', id)
      .single();

    if (!reqRow) {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
    }

    const email = profile?.email ?? user.email;
    const owns =
      reqRow.user_id === user.id ||
      reqRow.requester_email.toLowerCase() === email?.toLowerCase();
    if (!owns) {
      return NextResponse.json({ error: 'Sin acceso' }, { status: 403 });
    }
  }

  let query = supabase
    .from('request_comments')
    .select('id, author_name, content, created_at, is_internal, user_id')
    .eq('request_id', id)
    .order('created_at', { ascending: true });

  if (!internal) {
    query = query.eq('is_internal', false);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}
