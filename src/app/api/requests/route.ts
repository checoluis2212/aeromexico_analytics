import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAuthenticatedRequest, requestInputSchema } from '@/lib/requests/create-request';
import { z } from 'zod';

export async function POST(request: NextRequest) {
  try {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: 'Configuración incompleta en el servidor. Avísale a Sergio.' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const data = requestInputSchema.parse(body);

    const authClient = await createClient();
    const {
      data: { user },
    } = await authClient.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Inicia sesión para enviar un pedido.' },
        { status: 401 }
      );
    }

    const result = await createAuthenticatedRequest(
      { ...data, source: data.source ?? 'form' },
      user.id
    );

    return NextResponse.json({ success: true, ...result }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      const msg = err.issues[0]?.message ?? 'Datos incompletos';
      return NextResponse.json({ error: msg }, { status: 400 });
    }
    console.error('Request API error:', err);
    const msg = err instanceof Error ? err.message : 'Error interno. Intenta de nuevo.';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
