import { createAdminClient } from '@/lib/supabase/admin';
import { getSergioAvailability } from '@/lib/availability';
import { CAPACITY_CONFIG } from '@/lib/availability-config';
import { SERGIO_NAV_SECTIONS, SERGIO_EXTRA_NAV } from '@/lib/command-center/nav';
import { isClientPortalPath } from '@/lib/ai/agent-scope';
import { buildOrchestratorContextForAdminChat } from '@/lib/ai/admin-agent/orchestrator-context';
import type { AdminToolReadResult } from '@/lib/ai/admin-agent/types';

function commandCenterNavLines(): string[] {
  const items = [
    ...SERGIO_NAV_SECTIONS.flatMap((s) => s.items),
    ...SERGIO_EXTRA_NAV,
  ].filter((i) => !isClientPortalPath(i.href));

  return items.map((i) => `- ${i.label}: ${i.href} — ${i.hint}`);
}

export async function buildAdminAgentBaseContext(userMessage?: string): Promise<string> {
  const [availability, pendingCount, orchestrator] = await Promise.all([
    getSergioAvailability(),
    countPendingRequests(),
    buildOrchestratorContextForAdminChat(userMessage),
  ]);

  const sem = CAPACITY_CONFIG[availability.capacity];

  return [
    'MODO: Command Center — Admin Agent (solo Sergio Burgos, operación interna).',
    'SEPARACIÓN: NO eres el AI Agent del portal cliente (/ai-agent). Sin historial compartido ni flujo de pedido guiado del cliente.',
    `Semáforo: ${sem.label}. ${sem.headline}`,
    availability.note ? `Nota semáforo: ${availability.note}` : '',
    `Pedidos pendientes de decisión (bandeja global): ${pendingCount}`,
    'Rutas operativas del Command Center:',
    ...commandCenterNavLines(),
    'Puedes leer bandeja, detalle de pedido, eventos y datos BigQuery. Las acciones que cambian estado (aceptar, rechazar, semáforo, comentario) requieren confirmación del usuario en la UI.',
    '---',
    orchestrator,
  ]
    .filter(Boolean)
    .join('\n');
}

async function countPendingRequests(): Promise<number> {
  const admin = createAdminClient();
  const { count } = await admin
    .from('requests')
    .select('id', { count: 'exact', head: true })
    .eq('sergio_decision', 'pending');
  return count ?? 0;
}

export function appendToolResult(
  baseContext: string,
  result: AdminToolReadResult
): string {
  return `${baseContext}\n\n---\n\nRESULTADO HERRAMIENTA (${result.tool}):\n${result.markdown}`;
}
