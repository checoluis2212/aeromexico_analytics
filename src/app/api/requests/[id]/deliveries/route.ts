import { NextRequest, NextResponse } from 'next/server';
import { requireApiSession } from '@/lib/auth/require-api-session';
import { requireSergioApi } from '@/lib/auth/require-sergio-api';
import type { RequestDeliveryKind } from '@/lib/delivery/types';

type Params = { params: Promise<{ id: string }> };

const KINDS: RequestDeliveryKind[] = ['looker_dashboard', 'gtm_debug_video'];

export async function GET(_request: NextRequest, { params }: Params) {
  const session = await requireApiSession();
  if (session instanceof NextResponse) return session;
  const { id } = await params;

  const { data, error } = await session.supabase
    .from('request_deliveries')
    .select('*')
    .eq('request_id', id)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(request: NextRequest, { params }: Params) {
  const session = await requireSergioApi();
  if (session instanceof NextResponse) return session;
  const { id: requestId } = await params;
  const body = await request.json();

  const kind = body.kind as RequestDeliveryKind;
  if (!KINDS.includes(kind)) {
    return NextResponse.json({ error: 'Tipo de entrega inválido' }, { status: 400 });
  }

  const title = String(body.title ?? '').trim();
  const url = String(body.url ?? '').trim();
  if (!title || !url) {
    return NextResponse.json({ error: 'Título y URL requeridos' }, { status: 400 });
  }

  const { data, error } = await session.supabase
    .from('request_deliveries')
    .insert({
      request_id: requestId,
      kind,
      title,
      url,
      notes: body.notes?.trim() || null,
      library_looker_id: body.library_looker_id || null,
      library_gtm_video_id: body.library_gtm_video_id || null,
      created_by: session.user.id,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const session = await requireSergioApi();
  if (session instanceof NextResponse) return session;
  const { id: requestId } = await params;
  const { searchParams } = new URL(request.url);
  const deliveryId = searchParams.get('deliveryId');
  if (!deliveryId) {
    return NextResponse.json({ error: 'deliveryId requerido' }, { status: 400 });
  }

  const { error } = await session.supabase
    .from('request_deliveries')
    .delete()
    .eq('id', deliveryId)
    .eq('request_id', requestId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
