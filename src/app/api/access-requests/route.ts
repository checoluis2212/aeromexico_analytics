import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { accessRequestInputSchema } from '@/lib/access-requests/schema';
import { submitPlatformAccessRequest } from '@/lib/access-requests/submit-request';

export async function POST(request: NextRequest) {
  try {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: 'El servicio de solicitudes no está disponible temporalmente.' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const input = accessRequestInputSchema.parse(body);
    const result = await submitPlatformAccessRequest(input);

    if (!result.ok) {
      const status =
        result.code === 'duplicate_pending' || result.code === 'already_approved' ? 409 : 500;
      return NextResponse.json({ error: result.message, code: result.code }, { status });
    }

    return NextResponse.json(
      {
        success: true,
        id: result.id,
        status: result.status,
        message: 'Solicitud de acceso enviada correctamente.',
      },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof z.ZodError) {
      const msg = err.issues[0]?.message ?? 'Datos del formulario inválidos';
      return NextResponse.json({ error: msg }, { status: 400 });
    }
    console.error('POST /api/access-requests:', err);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}
