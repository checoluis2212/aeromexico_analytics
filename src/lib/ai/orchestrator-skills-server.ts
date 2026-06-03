import { createClient } from '@/lib/supabase/server';
import {
  ORCHESTRATOR_DATA_WAREHOUSE_SLUG,
  SKILLS_MARKETPLACE_CATALOG,
  isDataWarehouseSkill,
} from '@/lib/ai/skills-marketplace-catalog';
import { buildOrchestratorContextBlock } from '@/lib/ai/orchestrator-prompt';
import {
  buildBigQueryWarehouseContextBlock,
  isBigQueryConfigured,
} from '@/lib/ai/bigquery-orchestrator-context';
import { fetchBigQueryDataForOrchestrator } from '@/lib/bigquery/orchestrator-fetch';

export type OrchestratorSkillRow = {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string | null;
  sort_order: number;
  enabled: boolean;
  connection_status: 'not_configured' | 'connected' | 'error';
  config: Record<string, unknown>;
  last_synced_at: string | null;
};

function envSatisfiesSkill(slug: string): boolean {
  if (slug === ORCHESTRATOR_DATA_WAREHOUSE_SLUG) {
    return isBigQueryConfigured();
  }
  const def = SKILLS_MARKETPLACE_CATALOG.find((s) => s.slug === slug);
  if (!def?.envKeys?.length) return false;
  if (def.dataRole === 'data_warehouse') {
    return def.envKeys.some((key) => {
      if (key === 'GOOGLE_APPLICATION_CREDENTIALS') {
        return Boolean(process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim());
      }
      return Boolean(process.env[key]?.trim());
    });
  }
  return def.envKeys.some((key) => Boolean(process.env[key]?.trim()));
}

/** Detecta conexión por variables de entorno (sin OAuth aún). */
export function inferConnectionStatus(
  slug: string,
  current: OrchestratorSkillRow['connection_status']
): OrchestratorSkillRow['connection_status'] {
  if (current === 'error') return 'error';
  if (envSatisfiesSkill(slug)) return 'connected';
  return 'not_configured';
}

async function ensureSkillsSeeded(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { count } = await supabase
    .from('orchestrator_skills')
    .select('*', { count: 'exact', head: true });

  if (count && count > 0) return;

  const rows = SKILLS_MARKETPLACE_CATALOG.map((s, i) => ({
    slug: s.slug,
    name: s.name,
    category: s.category,
    description: s.description,
    sort_order: s.slug === ORCHESTRATOR_DATA_WAREHOUSE_SLUG ? 0 : (i + 1) * 10,
    enabled:
      s.slug === ORCHESTRATOR_DATA_WAREHOUSE_SLUG
        ? envSatisfiesSkill(s.slug)
        : false,
    connection_status: envSatisfiesSkill(s.slug) ? 'connected' : 'not_configured',
  }));

  await supabase.from('orchestrator_skills').upsert(rows, { onConflict: 'slug' });
}

export async function listOrchestratorSkills(): Promise<OrchestratorSkillRow[]> {
  const supabase = await createClient();
  await ensureSkillsSeeded(supabase);
  const { data, error } = await supabase
    .from('orchestrator_skills')
    .select('*')
    .order('sort_order');

  if (error) {
    console.error('orchestrator_skills:', error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    ...row,
    connection_status: inferConnectionStatus(
      row.slug,
      row.connection_status as OrchestratorSkillRow['connection_status']
    ),
  })) as OrchestratorSkillRow[];
}

/** Solo el almacén BigQuery cuenta como fuente de datos para el orquestador. */
export async function getOrchestratorSkillsForAi(): Promise<{
  dataWarehouse: OrchestratorSkillRow | null;
  auxiliaryEnabled: OrchestratorSkillRow[];
}> {
  const all = await listOrchestratorSkills();
  const bq = all.find((s) => s.slug === ORCHESTRATOR_DATA_WAREHOUSE_SLUG) ?? null;
  const dataWarehouse =
    bq && bq.enabled && bq.connection_status === 'connected' ? bq : null;
  const auxiliaryEnabled = all.filter(
    (s) =>
      !isDataWarehouseSkill(s.slug) &&
      s.enabled &&
      s.connection_status === 'connected'
  );
  return { dataWarehouse, auxiliaryEnabled };
}

export async function buildOrchestratorContextForChat(
  userMessage?: string
): Promise<string> {
  const { dataWarehouse, auxiliaryEnabled } = await getOrchestratorSkillsForAi();
  const connected = Boolean(dataWarehouse) && isBigQueryConfigured();
  const activeSkillNames = [
    ...(dataWarehouse ? [dataWarehouse.name] : []),
    ...auxiliaryEnabled.map((s) => s.name),
  ];
  const base = buildOrchestratorContextBlock({
    dataWarehouseConnected: connected,
    warehouseContextBlock: buildBigQueryWarehouseContextBlock(),
    activeSkillNames,
  });

  if (!connected) return base;

  const dataBlock = await fetchBigQueryDataForOrchestrator(userMessage?.trim() ?? '');
  return `${base}\n\n---\n\n${dataBlock}`;
}
