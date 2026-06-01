import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !subject || message) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // In production: integrate with email service (SendGrid, Resend, etc.)
    console.log('Contact form submission:', { name, email, subject, message });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
