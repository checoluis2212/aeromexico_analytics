import { NextRequest, NextResponse } from 'next/server';
import { syncFromTrelloCard } from '@/lib/integrations/external-sync';

export async function POST(request: NextRequest) {
  const secret = process.env.TRELLO_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 });
  }

  const header = request.headers.get('x-trello-webhook-secret');
  if (header !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const action = body?.action;
    const type = action?.type as string | undefined;

    if (type === 'updateCard' || type === 'createCard') {
      const cardId = action?.data?.card?.id as string | undefined;
      if (cardId) {
        await syncFromTrelloCard(cardId);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('Trello webhook error:', e);
    return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
  }
}

export async function HEAD() {
  return new NextResponse(null, { status: 200 });
}
