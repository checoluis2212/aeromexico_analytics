import type { ScenarioChip } from '@/components/assistant/preguntale-scenarios';

/** Consultas al agente (envían mensaje al chat). */
export const ADMIN_AGENT_QUERY_SHORTCUTS: ScenarioChip[] = [
  {
    id: 'pending',
    area: 'Bandeja',
    title: 'Pedidos pendientes',
    subtitle: 'Los que esperan tu sí o no',
    message: '¿Qué pedidos tengo pendientes de aceptar o rechazar?',
  },
  {
    id: 'all_requests',
    area: 'Solicitudes',
    title: 'Últimas solicitudes',
    subtitle: 'Toda la bandeja con solicitante y área',
    message: 'Lista las últimas solicitudes de todos los clientes en la bandeja',
  },
  {
    id: 'requesters',
    area: 'Clientes',
    title: 'Quién está pidiendo',
    subtitle: 'Solicitantes y áreas recientes',
    message: '¿Quiénes son los solicitantes y áreas con pedidos recientes?',
  },
  {
    id: 'in_progress',
    area: 'Operación',
    title: 'En curso',
    subtitle: 'Aceptados y en desarrollo',
    message: '¿Qué pedidos están en curso o en desarrollo ahora?',
  },
  {
    id: 'semaphore',
    area: 'Capacidad',
    title: 'Semáforo',
    subtitle: 'Estado de cola y nota',
    message: '¿Cómo está mi semáforo de capacidad?',
  },
  {
    id: 'events',
    area: 'Medición',
    title: 'Eventos GA4',
    subtitle: 'Salud del catálogo',
    message: 'Muéstrame una muestra del catálogo de eventos',
  },
  {
    id: 'bigquery',
    area: 'Datos',
    title: 'BigQuery',
    subtitle: 'Cifras del almacén',
    message: '¿Qué puedes consultar en BigQuery ahora mismo?',
  },
];

/** Enlaces a pantallas del panel (no abren chat). */
export const ADMIN_AGENT_PANEL_LINKS: ScenarioChip[] = [
  {
    id: 'bandeja',
    area: 'Panel',
    title: 'Bandeja',
    subtitle: 'Gestionar pedidos',
    href: '/command-center/pedidos',
  },
  {
    id: 'board',
    area: 'Panel',
    title: 'Tablero',
    subtitle: 'Kanban de avance',
    href: '/command-center/board',
  },
  {
    id: 'datos_ia',
    area: 'Config',
    title: 'Datos IA',
    subtitle: 'BigQuery',
    href: '/command-center/integraciones',
  },
  {
    id: 'admin',
    area: 'Panel',
    title: 'Mi panel',
    subtitle: 'Semáforo y resumen',
    href: '/command-center/admin',
  },
];

/** @deprecated Usar ADMIN_AGENT_QUERY_SHORTCUTS */
export const ADMIN_AGENT_SHORTCUTS: ScenarioChip[] = [
  ...ADMIN_AGENT_QUERY_SHORTCUTS,
  ...ADMIN_AGENT_PANEL_LINKS,
];

export const ADMIN_AGENT_WELCOME = `Hola — soy tu **Agente IA** del Command Center.

Opero la **bandeja de todos los clientes** (no el chat «mis pedidos» del portal). Puedo listar solicitudes, ver detalle AMX, semáforo, eventos y BigQuery. Las acciones que cambian estado piden **confirmación** en pantalla.`;

export const ADMIN_AGENT_SUGGESTIONS = [
  'Pedidos pendientes',
  'Últimas solicitudes de todos',
  '¿Quién está pidiendo?',
  '¿Cómo está el semáforo?',
  'Pedidos en curso',
];
