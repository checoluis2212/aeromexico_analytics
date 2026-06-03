import { getBigQueryProjectId, isBigQueryConfigured } from '@/lib/ai/bigquery-orchestrator-context';

const IDENT = /^[a-zA-Z][a-zA-Z0-9_]*$/;

export function parseDatasetList(): string[] {
  const raw =
    process.env.BIGQUERY_DATASETS?.trim() ||
    process.env.BIGQUERY_DATASET_IDS?.trim();
  if (!raw) return [];
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter((s) => IDENT.test(s));
}

function assertIdent(value: string, label: string): string {
  if (!IDENT.test(value)) {
    throw new Error(`${label} inválido`);
  }
  return value;
}

export function getMartDataset(): string | null {
  const fromEnv = process.env.BIGQUERY_MART_DATASET?.trim();
  if (fromEnv) return assertIdent(fromEnv, 'BIGQUERY_MART_DATASET');
  const datasets = parseDatasetList();
  return datasets[0] ?? null;
}

export function resolveTableRef(tableEnvKey: string): string | null {
  const project = getBigQueryProjectId();
  const dataset = getMartDataset();
  const table = process.env[tableEnvKey]?.trim();
  if (!project || !dataset || !table) return null;
  assertIdent(dataset, 'dataset');
  assertIdent(table, tableEnvKey);
  return `\`${project}.${dataset}.${table}\``;
}

export function getColumn(name: string, fallback: string): string {
  const col = process.env[name]?.trim() || fallback;
  return assertIdent(col, name);
}

export function getOrchestratorMaxRows(): number {
  const n = Number(process.env.BIGQUERY_ORCHESTRATOR_MAX_ROWS ?? '50');
  if (!Number.isFinite(n) || n < 1) return 50;
  return Math.min(Math.floor(n), 100);
}

export function getCustomSnapshotSql(): string | null {
  const sql = process.env.BIGQUERY_ORCHESTRATOR_SNAPSHOT_SQL?.trim();
  if (!sql) return null;
  const normalized = sql.replace(/\s+/g, ' ').trim();
  if (!/^SELECT\b/i.test(normalized)) return null;
  if (/[;]/.test(normalized)) return null;
  if (/\b(INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|MERGE|TRUNCATE|GRANT|REVOKE)\b/i.test(normalized)) {
    return null;
  }
  return normalized;
}

export function isOrchestratorQueryEnabled(): boolean {
  return isBigQueryConfigured();
}
