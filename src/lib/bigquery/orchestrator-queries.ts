import {
  getColumn,
  getCustomSnapshotSql,
  getMartDataset,
  getOrchestratorMaxRows,
  parseDatasetList,
  resolveTableRef,
} from '@/lib/bigquery/config';
import { getBigQueryProjectId } from '@/lib/ai/bigquery-orchestrator-context';

export type OrchestratorQueryPlan = {
  id: string;
  label: string;
  sql: string;
};

export function selectOrchestratorQueries(userMessage: string): OrchestratorQueryPlan[] {
  const plans: OrchestratorQueryPlan[] = [];
  const maxRows = getOrchestratorMaxRows();
  const lower = userMessage.toLowerCase();

  const custom = getCustomSnapshotSql();
  if (custom) {
    const limited = /\bLIMIT\s+\d+/i.test(custom)
      ? custom
      : `${custom} LIMIT ${maxRows}`;
    plans.push({
      id: 'custom_snapshot',
      label: 'Resumen configurado (admin)',
      sql: limited,
    });
    return plans.slice(0, 3);
  }

  const revenueRef = resolveTableRef('BIGQUERY_TABLE_REVENUE_DAILY');
  const roasRef = resolveTableRef('BIGQUERY_TABLE_CAMPAIGN_ROAS');

  if (revenueRef) {
    const dateCol = getColumn('BIGQUERY_COL_DATE', 'event_date');
    const revenueCol = getColumn('BIGQUERY_COL_REVENUE', 'purchase_revenue');
    const txCol = getColumn('BIGQUERY_COL_TRANSACTIONS', 'transactions');

    plans.push({
      id: 'revenue_7d',
      label: 'Ingresos y transacciones — últimos 7 días',
      sql: `SELECT
  CAST(${dateCol} AS DATE) AS dia,
  ROUND(SUM(${revenueCol}), 2) AS ingresos,
  SUM(${txCol}) AS transacciones
FROM ${revenueRef}
WHERE CAST(${dateCol} AS DATE) >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)
GROUP BY 1
ORDER BY 1 DESC
LIMIT ${Math.min(maxRows, 14)}`,
    });
  }

  const wantsRoas =
    /\broas\b/.test(lower) ||
    /\bcampa[ñn]a/.test(lower) ||
    /\bpublicidad\b/.test(lower) ||
    /\bgoogle ads\b/.test(lower) ||
    /\bmeta ads\b/.test(lower);

  if (roasRef && (wantsRoas || !revenueRef)) {
    const dateCol = getColumn('BIGQUERY_COL_DATE', 'event_date');
    const campaignCol = getColumn('BIGQUERY_COL_CAMPAIGN', 'campaign_name');
    const roasCol = getColumn('BIGQUERY_COL_ROAS', 'roas');
    const revenueCol = getColumn('BIGQUERY_COL_REVENUE', 'purchase_revenue');

    plans.push({
      id: 'roas_campaigns',
      label: 'ROAS por campaña — últimos 7 días',
      sql: `SELECT
  ${campaignCol} AS campana,
  ROUND(SUM(${revenueCol}), 2) AS ingresos,
  ROUND(AVG(${roasCol}), 2) AS roas_promedio
FROM ${roasRef}
WHERE CAST(${dateCol} AS DATE) >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)
GROUP BY 1
ORDER BY roas_promedio DESC
LIMIT ${Math.min(maxRows, 15)}`,
    });
  }

  if (plans.length === 0) {
    const inventory = buildDatasetInventoryQuery();
    if (inventory) {
      plans.push({
        id: 'dataset_inventory',
        label: 'Inventario de tablas (descubrimiento)',
        sql: inventory,
      });
    }
  }

  return plans.slice(0, 3);
}

function buildDatasetInventoryQuery(): string | null {
  const project = getBigQueryProjectId();
  const datasets = parseDatasetList();
  if (!project || datasets.length === 0) return null;

  const union = datasets
    .map(
      (ds) => `SELECT '${ds}' AS dataset, table_name, table_type
FROM \`${project}.${ds}.INFORMATION_SCHEMA.TABLES\`
WHERE table_type = 'BASE TABLE'`
    )
    .join('\nUNION ALL\n');

  return `${union}\nORDER BY dataset, table_name\nLIMIT 40`;
}

export function hasMartTablesConfigured(): boolean {
  return Boolean(
    resolveTableRef('BIGQUERY_TABLE_REVENUE_DAILY') ||
      resolveTableRef('BIGQUERY_TABLE_CAMPAIGN_ROAS') ||
      getCustomSnapshotSql()
  );
}

export function getMartConfigHint(): string {
  const dataset = getMartDataset();
  if (!dataset) {
    return 'Configure BIGQUERY_DATASETS y BIGQUERY_MART_DATASET en el servidor.';
  }
  if (!hasMartTablesConfigured()) {
    return `Dataset ${dataset}: defina BIGQUERY_TABLE_REVENUE_DAILY y/o BIGQUERY_TABLE_CAMPAIGN_ROAS (o BIGQUERY_ORCHESTRATOR_SNAPSHOT_SQL).`;
  }
  return `Marts en dataset ${dataset} configurados.`;
}
