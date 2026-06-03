import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { accessRequestStatusQuerySchema } from '@/lib/access-requests/schema';
import { getAccessRequestByEmail } from '@/lib/access-requests/submit-request';

export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get('email');
    const { email: normalized } = accessRequestStatusQuerySchema.parse({ email });

    const row = await getAccessRequestByEmail(normalized);

    if (!row) {
      return NextResponse.json({ status: null, message: 'No access request found for this email.' });
    }

    return NextResponse.json({
      status: row.status,
      created_at: row.created_at,
      reviewed_at: row.reviewed_at,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Valid email is required.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Unable to check status.' }, { status: 500 });
  }
}
