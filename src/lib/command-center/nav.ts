import type { AccRole } from '@/types/command-center';
import { aiAgentClientPreviewHref } from '@/lib/ai/assistant-modes';

export type CommandCenterNavItem = {
  href: string;
  label: string;
  hint: string;
  icon: string;
};

export type CommandCenterNavSection = {
  id: string;
  label: string;
  items: CommandCenterNavItem[];
};

const sergioPanel: CommandCenterNavItem = {
  href: '/command-center/admin',
  label: 'Mi panel',
  hint: 'Semáforo y pedidos nuevos',
  icon: 'Home',
};

const adminAgent: CommandCenterNavItem = {
  href: '/command-center/agent',
  label: 'Agente IA',
  hint: 'Bandeja global, semáforo y operación',
  icon: 'Bot',
};

const pedidos: CommandCenterNavItem = {
  href: '/command-center/pedidos',
  label: 'Pedidos',
  hint: 'Aceptar, rechazar y gestionar',
  icon: 'Inbox',
};

const lookerDashboards: CommandCenterNavItem = {
  href: '/command-center/looker-dashboards',
  label: 'Looker',
  hint: 'Dashboards para clientes',
  icon: 'PieChart',
};

const gtmVideos: CommandCenterNavItem = {
  href: '/command-center/gtm-videos',
  label: 'Videos GTM',
  hint: 'Pruebas de tags',
  icon: 'Video',
};

const tablero: CommandCenterNavItem = {
  href: '/command-center/board',
  label: 'Tablero',
  hint: 'Vista kanban de avance',
  icon: 'Columns3',
};

const eventos: CommandCenterNavItem = {
  href: '/command-center/events',
  label: 'Eventos GA4',
  hint: 'Salud de medición',
  icon: 'Zap',
};

const usuarios: CommandCenterNavItem = {
  href: '/command-center/usuarios',
  label: 'Usuarios',
  hint: 'Quién puede entrar',
  icon: 'Users',
};

const datosIa: CommandCenterNavItem = {
  href: '/command-center/integraciones',
  label: 'Datos IA',
  hint: 'BigQuery y orquestador',
  icon: 'Sparkles',
};

/** Navegación principal Sergio — una sola lista en sidebar (sin duplicar header). */
export const SERGIO_NAV_SECTIONS: CommandCenterNavSection[] = [
  {
    id: 'daily',
    label: 'Cada día',
    items: [sergioPanel, adminAgent, pedidos],
  },
  {
    id: 'delivery',
    label: 'Entregas',
    items: [lookerDashboards, gtmVideos],
  },
  {
    id: 'tools',
    label: 'Herramientas',
    items: [tablero, eventos, usuarios],
  },
  {
    id: 'config',
    label: 'Configuración',
    items: [datosIa],
  },
];

export const SERGIO_NAV: CommandCenterNavItem[] = SERGIO_NAV_SECTIONS.flatMap((s) => s.items);

/** @deprecated Usar sección Herramientas en SERGIO_NAV_SECTIONS */
export const SERGIO_EXTRA_NAV: CommandCenterNavItem[] =
  SERGIO_NAV_SECTIONS.find((s) => s.id === 'tools')?.items ?? [];

/** @deprecated La barra superior ya no duplica el sidebar. */
export const SERGIO_HEADER_NAV: CommandCenterNavItem[] = [];

const resumen: CommandCenterNavItem = {
  href: '/command-center/executive',
  label: 'Resumen',
  hint: 'Números del negocio',
  icon: 'Home',
};

const reportes: CommandCenterNavItem = {
  href: '/command-center/reports',
  label: 'Reportes',
  hint: 'Dashboards publicados',
  icon: 'BarChart3',
};

const avance: CommandCenterNavItem = {
  href: '/command-center/board',
  label: 'Avance',
  hint: 'Pedidos abiertos',
  icon: 'Columns3',
};

const portalPreview: CommandCenterNavItem = {
  href: aiAgentClientPreviewHref(),
  label: 'Vista portal',
  hint: 'AI Agent como lo ve un cliente (?vista=cliente)',
  icon: 'Globe',
};

/** Solo enlace secundario al pie del sidebar — no duplicar secciones principales. */
export function getSergioFooterNav(): CommandCenterNavItem[] {
  return [portalPreview];
}

/** Stakeholders */
export function getStakeholderNav(accRole: AccRole | string | null): CommandCenterNavItem[] {
  switch (accRole) {
    case 'developer':
    case 'qa':
      return [avance, eventos];
    case 'read_only':
      return [resumen, reportes];
    case 'manager':
    case 'director':
    case 'product_owner':
    default:
      return [resumen, avance, reportes];
  }
}

export function getStakeholderFooterNav(
  accRole: AccRole | string | null
): CommandCenterNavItem[] {
  const links: CommandCenterNavItem[] = [portalPreview];

  if (accRole === 'read_only') return links;

  if (['manager', 'director', 'product_owner'].includes(accRole ?? '')) {
    return [
      { href: '/mis-pedidos', label: 'Mis pedidos', hint: 'Tus pedidos', icon: 'Inbox' },
      portalPreview,
      { href: '/pedir', label: 'Pedir trabajo', hint: 'Formulario', icon: 'Inbox' },
    ];
  }

  return [
    { href: '/mis-pedidos', label: 'Mis pedidos', hint: 'Tus pedidos', icon: 'Inbox' },
    portalPreview,
  ];
}
