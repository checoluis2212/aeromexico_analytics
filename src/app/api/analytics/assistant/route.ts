import { NextResponse } from 'next/server';
import { requireCommandCenterAccess } from '@/lib/auth/require-api-session';
import { getAssistantAnalyticsSummary } from '@/lib/analytics/assistant-stats';

export async function GET() {
  const session = await requireCommandCenterAccess();
  if (session instanceof NextResponse) return session;

  const summary = await getAssistantAnalyticsSummary();
  return NextResponse.json(summary);
}
