import { NextResponse } from 'next/server';
import { requireSergioApi } from '@/lib/auth/require-sergio-api';
import { isBigQueryConfigured } from '@/lib/ai/bigquery-orchestrator-context';
import { fetchBigQueryDataForOrchestrator } from '@/lib/bigquery/orchestrator-fetch';
import { getMartConfigHint, hasMartTablesConfigured } from '@/lib/bigquery/orchestrator-queries';

export async function GET() {
  const session = await requireSergioApi();
  if (session instanceof NextResponse) return session;

  if (!isBigQueryConfigured()) {
    return NextResponse.json({
      ok: false,
      error: 'BigQuery no configurado (proyecto + GOOGLE_APPLICATION_CREDENTIALS).',
    });
  }

  try {
    const preview = await fetchBigQueryDataForOrchestrator(
      '¿Cómo van ingresos y ROAS por campaña?'
    );
    return NextResponse.json({
      ok: true,
      martsConfigured: hasMartTablesConfigured(),
      configHint: getMartConfigHint(),
      preview: preview.slice(0, 4000),
    });
  } catch (err) {
    console.error('[bigquery-probe]', err);
    return NextResponse.json({
      ok: false,
      error: err instanceof Error ? err.message : 'Error al consultar BigQuery',
    });
  }
}
