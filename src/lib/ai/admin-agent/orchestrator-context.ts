import { buildOrchestratorContextForChat } from '@/lib/ai/orchestrator-skills-server';

/**
 * BigQuery compartido como infraestructura (Datos IA), pero bloque de contexto
 * exclusivo del Admin Agent — sin mezclar con el prompt del portal cliente.
 */
export async function buildOrchestratorContextForAdminChat(
  userMessage?: string
): Promise<string> {
  const warehouse = await buildOrchestratorContextForChat(userMessage);

  return [
    'ALCANCE DATOS — ADMIN AGENT (Command Center)',
    '- Conexión BigQuery vía Datos IA: mismas tablas agregadas, consultas en este turno.',
    '- NO es el chat del AI Agent del portal (/ai-agent): sin historial, borradores ni wizard de pedido del cliente.',
    '- NO listar "mis pedidos" de un usuario del portal; aquí operas la bandeja interna completa.',
    '---',
    warehouse,
  ].join('\n');
}
