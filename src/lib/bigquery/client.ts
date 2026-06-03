import { BigQuery } from '@google-cloud/bigquery';
import { getBigQueryProjectId, isBigQueryConfigured } from '@/lib/ai/bigquery-orchestrator-context';

let client: BigQuery | null = null;

export function getBigQueryClient(): BigQuery | null {
  if (!isBigQueryConfigured()) return null;
  if (!client) {
    const projectId = getBigQueryProjectId() ?? undefined;
    const location = process.env.BIGQUERY_LOCATION?.trim() || undefined;
    client = new BigQuery({ projectId, location });
  }
  return client;
}
