import { getBigQueryClient } from '@/lib/bigquery/client';
import { formatRowsForModel } from '@/lib/bigquery/format-results';
import {
  getMartConfigHint,
  hasMartTablesConfigured,
  selectOrchestratorQueries,
} from '@/lib/bigquery/orchestrator-queries';
import { isOrchestratorQueryEnabled } from '@/lib/bigquery/config';
import { isBigQueryConfigured } from '@/lib/ai/bigquery-orchestrator-context';

const QUERY_TIMEOUT_MS = 12_000;

type QueryOutcome = {
  id: string;
  label: string;
  ok: boolean;
  body: string;
};

async function runQuery(sql: string): Promise<Record<string, unknown>[]> {
  const bq = getBigQueryClient();
  if (!bq) return [];

  const work = async () => {
    const [job] = await bq.createQueryJob({
      query: sql,
      location: process.env.BIGQUERY_LOCATION?.trim() || undefined,
    });
    const [rows] = await job.getQueryResults();
    return (rows ?? []) as Record<string, unknown>[];
  };

  const timeout = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error('Timeout de consulta')), QUERY_TIMEOUT_MS);
  });

  return Promise.race([work(), timeout]);
}

/**
 * Ejecuta consultas seguras (plantilla) y devuelve bloque para el orquestador.
 * Solo servidor — nunca exponer SQL al usuario final.
 */
export async function fetchBigQueryDataForOrchestrator(
  userMessage: string
): Promise<string> {
  if (!isBigQueryConfigured() || !isOrchestratorQueryEnabled()) {
    return 'RESULTADOS DEL ALMACÉN: no disponibles (BigQuery sin configurar).';
  }

  const plans = selectOrchestratorQueries(userMessage || '');
  if (plans.length === 0) {
    return `RESULTADOS DEL ALMACÉN: sin consultas ejecutadas.
${getMartConfigHint()}
No inventes cifras hasta que existan tablas o un SQL de snapshot en .env.`;
  }

  const outcomes: QueryOutcome[] = [];

  for (const plan of plans) {
    try {
      const rows = await runQuery(plan.sql);
      outcomes.push({
        id: plan.id,
        label: plan.label,
        ok: true,
        body: formatRowsForModel(plan.label, rows),
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error de consulta';
      console.error(`[bigquery/orchestrator] ${plan.id}:`, msg);
      outcomes.push({
        id: plan.id,
        label: plan.label,
        ok: false,
        body: `[${plan.label}] No se pudo leer el almacén (${plan.id}). Revisa nombres de tabla/columnas en .env.`,
      });
    }
  }

  const hint = hasMartTablesConfigured()
    ? 'Usa solo estas cifras para responder con datos; no extrapoles fuera del periodo mostrado.'
    : getMartConfigHint();

  const blocks = outcomes.map((o) => o.body).join('\n\n');

  return `RESULTADOS DEL ALMACÉN (consulta automática — uso interno del modelo):
${blocks}

${hint}`;
}
