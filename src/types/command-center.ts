export type AccRole =
  | 'analytics_lead'
  | 'analytics_consultant'
  | 'manager'
  | 'director'
  | 'product_owner'
  | 'developer'
  | 'qa'
  | 'read_only';

export type DeliveryStatus =
  | 'backlog'
  | 'discovery'
  | 'requirements'
  | 'ready_for_development'
  | 'development'
  | 'analytics_qa'
  | 'ready_for_release'
  | 'done'
  | 'blocked';

export type AccRequestType =
  | 'dashboard'
  | 'tracking'
  | 'event'
  | 'investigation'
  | 'funnel'
  | 'qa_analytics'
  | 'gtm_implementation'
  | 'bigquery';

export type ReportCategory =
  | 'acquisition'
  | 'ecommerce'
  | 'revenue'
  | 'customer_journey'
  | 'marketing'
  | 'mobile'
  | 'product_analytics';

export type MetricType = 'kpi' | 'metric' | 'dimension' | 'event' | 'parameter';

export const ACC_ROLES: Record<AccRole, { label: string; permissions: string[] }> = {
  analytics_lead: { label: 'Analytics Lead', permissions: ['all'] },
  analytics_consultant: { label: 'Analytics Consultant', permissions: ['manage_requests', 'edit_board', 'manage_reports'] },
  manager: { label: 'Manager', permissions: ['create_requests', 'view_executive', 'approve'] },
  director: { label: 'Director', permissions: ['view_executive', 'view_value', 'approve'] },
  product_owner: { label: 'Product Owner', permissions: ['create_requests', 'view_board'] },
  developer: { label: 'Developer', permissions: ['view_board', 'edit_tasks'] },
  qa: { label: 'QA', permissions: ['view_board', 'qa_review'] },
  read_only: { label: 'Solo lectura', permissions: ['view_reports', 'view_dictionary'] },
};

export const DELIVERY_STATUSES: { value: DeliveryStatus; label: string; color: string }[] = [
  { value: 'backlog', label: 'Por hacer', color: 'bg-muted' },
  { value: 'discovery', label: 'Entendiendo', color: 'bg-blue-500/20 text-blue-400' },
  { value: 'requirements', label: 'Definiendo', color: 'bg-purple-500/20 text-purple-400' },
  { value: 'ready_for_development', label: 'Listo para build', color: 'bg-cyan-500/20 text-cyan-400' },
  { value: 'development', label: 'En desarrollo', color: 'bg-primary/20 text-primary' },
  { value: 'analytics_qa', label: 'Revisando', color: 'bg-signal/20 text-signal' },
  { value: 'ready_for_release', label: 'Casi listo', color: 'bg-radar/20 text-radar' },
  { value: 'done', label: 'Listo ✓', color: 'bg-radar/30 text-radar' },
  { value: 'blocked', label: 'Bloqueado', color: 'bg-destructive/20 text-destructive' },
];

export const ACC_REQUEST_TYPES: { value: AccRequestType; label: string; icon: string }[] = [
  { value: 'dashboard', label: 'Un dashboard o reporte', icon: 'BarChart3' },
  { value: 'tracking', label: 'Medir algo nuevo', icon: 'Radio' },
  { value: 'event', label: 'Un evento en web o app', icon: 'Zap' },
  { value: 'investigation', label: 'Investigar un dato', icon: 'Search' },
  { value: 'funnel', label: 'Analizar un embudo', icon: 'Filter' },
  { value: 'qa_analytics', label: 'Revisar que los datos estén bien', icon: 'ShieldCheck' },
  { value: 'gtm_implementation', label: 'Cambio en tags (GTM)', icon: 'Tag' },
  { value: 'bigquery', label: 'Datos en BigQuery', icon: 'Database' },
];

export const REPORT_CATEGORIES: { value: ReportCategory; label: string; icon: string }[] = [
  { value: 'acquisition', label: 'Adquisición', icon: 'UserPlus' },
  { value: 'ecommerce', label: 'E-commerce', icon: 'ShoppingCart' },
  { value: 'revenue', label: 'Ingresos', icon: 'DollarSign' },
  { value: 'customer_journey', label: 'Journey del cliente', icon: 'Route' },
  { value: 'marketing', label: 'Marketing', icon: 'Megaphone' },
  { value: 'mobile', label: 'App móvil', icon: 'Smartphone' },
  { value: 'product_analytics', label: 'Producto', icon: 'Box' },
];

export const MATURITY_DIMENSIONS = [
  'Tracking', 'Governance', 'Reporting', 'Data Quality',
  'Experimentation', 'Self-Service', 'Documentation',
];

/** Panel Sergio — operación diaria */
export const SERGIO_NAV_PRIMARY = [
  { href: '/command-center/admin', label: 'Mi panel', hint: 'Cola, semáforo, urgentes', icon: 'Home' },
  { href: '/command-center/pedidos', label: 'Bandeja', hint: 'Aceptar y gestionar', icon: 'Inbox' },
  { href: '/command-center/board', label: 'Tablero', hint: 'Avance por estado', icon: 'Columns3' },
  { href: '/command-center/executive', label: 'KPIs', hint: 'Negocio + operación', icon: 'BarChart3' },
  { href: '/command-center/events', label: 'Eventos', hint: 'Salud GA4/GTM', icon: 'Zap' },
  { href: '/command-center/copilot', label: 'Copilot', hint: 'Asistente IA', icon: 'MessageCircle' },
];

/** Stakeholders — solo consulta */
export const STAKEHOLDER_NAV_PRIMARY = [
  { href: '/command-center/executive', label: 'Resumen', hint: 'KPIs y confianza en datos', icon: 'Home' },
  { href: '/command-center/reports', label: 'Reportes', hint: 'Dashboards publicados', icon: 'BarChart3' },
  { href: '/command-center/board', label: 'Avance', hint: 'En qué estamos', icon: 'Columns3' },
  { href: '/command-center/copilot', label: 'Pregúntale', hint: 'Asistente con IA', icon: 'MessageCircle' },
];

/** @deprecated Usar SERGIO_NAV o STAKEHOLDER_NAV */
export const ACC_NAV_PRIMARY = [
  { href: '/command-center/executive', label: 'Resumen', hint: 'Cómo vamos', icon: 'Home' },
  { href: '/command-center/pedidos', label: 'Pedidos', hint: 'Filtra por usuario', icon: 'Inbox' },
  { href: '/command-center/requests', label: 'Pedir a Sergio', hint: 'Pide lo que quieras', icon: 'PlusCircle' },
  { href: '/command-center/reports', label: 'Reportes', hint: 'Encuentra tus datos', icon: 'BarChart3' },
  { href: '/command-center/board', label: 'Avance', hint: 'En qué estamos', icon: 'Columns3' },
  { href: '/command-center/copilot', label: 'Pregúntale', hint: 'Asistente con IA', icon: 'MessageCircle' },
];

/** Recursos secundarios — accesibles desde /resources */
export const ACC_NAV_RESOURCES = [
  { href: '/command-center/events', label: 'Eventos', hint: 'Qué medimos en web y app', icon: 'Zap' },
  { href: '/command-center/dictionary', label: 'Glosario', hint: 'Qué significa cada métrica', icon: 'BookOpen' },
  { href: '/command-center/knowledge', label: 'Guías', hint: 'Cómo hacemos las cosas', icon: 'Library' },
  { href: '/command-center/maturity', label: 'Salud del programa', hint: 'Fortalezas y riesgos', icon: 'TrendingUp' },
  { href: '/command-center/value', label: 'Nuestro impacto', hint: 'Valor que generamos', icon: 'Award' },
  { href: '/command-center/workspace', label: 'Mi espacio', hint: 'Para el equipo Analytics', icon: 'User' },
];

/** @deprecated Usar ACC_NAV_PRIMARY + ACC_NAV_RESOURCES */
export const ACC_NAV = [...ACC_NAV_PRIMARY, ...ACC_NAV_RESOURCES];

export interface Report {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: ReportCategory;
  business_questions: string[];
  owner_id: string | null;
  data_source: string;
  refresh_frequency: string | null;
  dashboard_url: string | null;
  view_count: number;
  popularity_score: number;
  is_published: boolean;
  tags: string[];
  created_at: string;
}

export interface Metric {
  id: string;
  slug: string;
  name: string;
  type: MetricType;
  definition: string;
  business_definition: string | null;
  formula: string | null;
  owner_id: string | null;
  examples: string[];
  tags: string[];
  is_active: boolean;
}

export interface AnalyticsScore {
  id: string;
  dimension: string;
  score: number;
  strengths: string[];
  risks: string[];
  opportunities: string[];
  assessed_at: string;
}

export interface AnalyticsHealth {
  id: string;
  health_score: number;
  tracking_coverage: number;
  ga4_status: string;
  bigquery_status: string;
  gtm_status: string;
  roi_estimate: number;
  hours_saved: number;
  recorded_at: string;
}

export interface Sprint {
  id: string;
  name: string;
  goal: string | null;
  start_date: string;
  end_date: string;
  capacity_points: number;
  is_active: boolean;
}

export interface CopilotMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}
