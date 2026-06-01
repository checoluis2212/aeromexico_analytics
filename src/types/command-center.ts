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
  { value: 'backlog', label: 'Backlog', color: 'bg-muted' },
  { value: 'discovery', label: 'Discovery', color: 'bg-blue-500/20 text-blue-400' },
  { value: 'requirements', label: 'Requirements', color: 'bg-purple-500/20 text-purple-400' },
  { value: 'ready_for_development', label: 'Ready for Dev', color: 'bg-cyan-500/20 text-cyan-400' },
  { value: 'development', label: 'Development', color: 'bg-primary/20 text-primary' },
  { value: 'analytics_qa', label: 'Analytics QA', color: 'bg-signal/20 text-signal' },
  { value: 'ready_for_release', label: 'Ready for Release', color: 'bg-radar/20 text-radar' },
  { value: 'done', label: 'Done', color: 'bg-radar/30 text-radar' },
  { value: 'blocked', label: 'Blocked', color: 'bg-destructive/20 text-destructive' },
];

export const ACC_REQUEST_TYPES: { value: AccRequestType; label: string; icon: string }[] = [
  { value: 'dashboard', label: 'Nuevo Dashboard', icon: 'BarChart3' },
  { value: 'tracking', label: 'Nuevo Tracking', icon: 'Radio' },
  { value: 'event', label: 'Nuevo Evento', icon: 'Zap' },
  { value: 'investigation', label: 'Investigación', icon: 'Search' },
  { value: 'funnel', label: 'Funnel Analysis', icon: 'Filter' },
  { value: 'qa_analytics', label: 'QA Analytics', icon: 'ShieldCheck' },
  { value: 'gtm_implementation', label: 'Implementación GTM', icon: 'Tag' },
  { value: 'bigquery', label: 'BigQuery Request', icon: 'Database' },
];

export const REPORT_CATEGORIES: { value: ReportCategory; label: string; icon: string }[] = [
  { value: 'acquisition', label: 'Adquisición', icon: 'UserPlus' },
  { value: 'ecommerce', label: 'E-commerce', icon: 'ShoppingCart' },
  { value: 'revenue', label: 'Revenue', icon: 'DollarSign' },
  { value: 'customer_journey', label: 'Customer Journey', icon: 'Route' },
  { value: 'marketing', label: 'Marketing', icon: 'Megaphone' },
  { value: 'mobile', label: 'Mobile', icon: 'Smartphone' },
  { value: 'product_analytics', label: 'Product Analytics', icon: 'Box' },
];

export const MATURITY_DIMENSIONS = [
  'Tracking', 'Governance', 'Reporting', 'Data Quality',
  'Experimentation', 'Self-Service', 'Documentation',
];

export const ACC_NAV = [
  { href: '/command-center/executive', label: 'Executive Dashboard', icon: 'LayoutDashboard', module: 'executive' },
  { href: '/command-center/requests', label: 'Request Center', icon: 'Inbox', module: 'requests' },
  { href: '/command-center/board', label: 'Delivery Board', icon: 'Kanban', module: 'board' },
  { href: '/command-center/reports', label: 'Report Marketplace', icon: 'Store', module: 'reports' },
  { href: '/command-center/discovery', label: 'Report Discovery', icon: 'MessageSquare', module: 'discovery' },
  { href: '/command-center/events', label: 'Event Catalog', icon: 'Zap', module: 'events' },
  { href: '/command-center/dictionary', label: 'Data Dictionary', icon: 'BookOpen', module: 'dictionary' },
  { href: '/command-center/knowledge', label: 'Knowledge Hub', icon: 'Library', module: 'knowledge' },
  { href: '/command-center/copilot', label: 'AI Copilot', icon: 'Sparkles', module: 'copilot' },
  { href: '/command-center/maturity', label: 'Maturity Center', icon: 'TrendingUp', module: 'maturity' },
  { href: '/command-center/value', label: 'Value Center', icon: 'Award', module: 'value' },
  { href: '/command-center/workspace', label: 'My Workspace', icon: 'User', module: 'workspace' },
];

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
