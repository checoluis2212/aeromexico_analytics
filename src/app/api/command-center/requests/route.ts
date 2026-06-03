import { NextResponse } from 'next/server';

/** Ruta legacy deshabilitada — usar POST /api/requests (autenticado). */
export async function POST() {
  return NextResponse.json(
    { error: 'Ruta deshabilitada. Usa /api/requests con sesión iniciada.' },
    { status: 410 }
  );
}
