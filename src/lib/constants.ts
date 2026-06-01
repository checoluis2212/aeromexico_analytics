export const siteConfig = {
  name: 'Working With Sergio',
  tagline: 'Sistema Operativo de Analytics',
  description:
    'Portal profesional de consultoría en analytics. Estrategia de medición, implementación técnica y gobernanza de datos.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://workingwithsergio.com',
  author: 'Sergio Burgos',
  email: 'sergio@aero-analytics.com',
};

export const navItems = [
  { href: '/', label: 'Inicio' },
  { href: '/about', label: 'Sobre mí' },
  { href: '/working-with-me', label: 'Cómo trabajo' },
  { href: '/playbooks', label: 'Playbooks' },
  { href: '/knowledge-base', label: 'Base de conocimiento' },
  { href: '/event-catalog', label: 'Catálogo de eventos' },
  { href: '/analytics-os', label: 'Analytics OS', badge: 'Premium' },
];

export const hubNavItems = [
  { href: '/request-center', label: 'Centro de solicitudes' },
  { href: '/hub', label: 'Hub de analytics' },
  { href: '/ai-insights', label: 'Insights con IA' },
  { href: '/contact', label: 'Contacto' },
];

export const services = [
  {
    title: 'Estrategia de medición',
    description: 'Diseño de estrategias de medición alineadas con objetivos de negocio y KPIs accionables.',
    icon: 'Target',
  },
  {
    title: 'Implementación GA4 y GTM',
    description: 'Implementación enterprise de Google Analytics 4, Tag Manager y dataLayer con QA riguroso.',
    icon: 'Code2',
  },
  {
    title: 'BigQuery y modelado de datos',
    description: 'Pipelines GA4 → BigQuery, modelado analítico y arquitectura de datos escalable.',
    icon: 'Database',
  },
  {
    title: 'Dashboards e informes',
    description: 'Dashboards ejecutivos en Looker Studio e informes automatizados para stakeholders.',
    icon: 'BarChart3',
  },
  {
    title: 'QA y auditorías de analytics',
    description: 'Auditorías de implementación, QA de tags y monitoreo continuo de calidad de datos.',
    icon: 'ShieldCheck',
  },
  {
    title: 'Insights con IA',
    description: 'Análisis automatizado de datos con detección de anomalías e insights accionables.',
    icon: 'Sparkles',
  },
];

export const principles = [
  {
    title: 'Analytics orientado a decisiones',
    description: 'Cada métrica debe responder una pregunta de negocio. Sin plan de medición, no hay implementación.',
  },
  {
    title: 'Gobernanza desde el diseño',
    description: 'Documentación, convenciones de nombres y ownership desde el día uno. No como algo posterior.',
  },
  {
    title: 'Calidad sobre cantidad',
    description: 'Preferimos 10 eventos bien definidos que 100 tags sin contexto ni validación.',
  },
  {
    title: 'Arquitectura escalable',
    description: 'Diseñamos para crecer: de startup a enterprise sin reimplementar desde cero.',
  },
];

export const slas = [
  { priority: 'P0 — Crítico', response: '2 horas', resolution: '24 horas', description: 'Producción caída, datos incorrectos en reporting ejecutivo' },
  { priority: 'P1 — Alto', response: '4 horas', resolution: '48 horas', description: 'Tracking roto en flujos críticos, dashboards sin datos' },
  { priority: 'P2 — Medio', response: '1 día hábil', resolution: '5 días hábiles', description: 'Nuevas implementaciones, mejoras, nuevos dashboards' },
  { priority: 'P3 — Bajo', response: '2 días hábiles', resolution: '10 días hábiles', description: 'Consultas, documentación, optimizaciones menores' },
];

export const requestTypes = [
  { value: 'tracking', label: 'Nuevo tracking', description: 'Implementación de eventos GA4/GTM' },
  { value: 'dashboard', label: 'Dashboard', description: 'Looker Studio o reporting personalizado' },
  { value: 'funnel', label: 'Análisis de embudo', description: 'Análisis de conversión y abandono' },
  { value: 'qa', label: 'QA de analytics', description: 'Auditoría y validación de implementación' },
  { value: 'reporting', label: 'Reporting', description: 'Informes automatizados y KPIs' },
  { value: 'investigation', label: 'Investigación de datos', description: 'Investigación de discrepancias de datos' },
];

export const playbookCategories = [
  { value: 'ga4', label: 'GA4', icon: 'BarChart2' },
  { value: 'gtm', label: 'GTM', icon: 'Tag' },
  { value: 'data_layer', label: 'Capa de datos', icon: 'Layers' },
  { value: 'bigquery', label: 'BigQuery', icon: 'Database' },
  { value: 'looker_studio', label: 'Looker Studio', icon: 'PieChart' },
  { value: 'qa', label: 'QA de analytics', icon: 'CheckCircle2' },
];

export const aosModules = [
  {
    title: 'Marco de medición',
    description: 'Framework completo de estrategia de medición: preguntas de negocio → KPIs → eventos → gobernanza.',
    status: 'Núcleo',
  },
  {
    title: 'Modelo de gobernanza de datos',
    description: 'Roles, ownership, gestión de cambios y estándares de calidad para programas enterprise.',
    status: 'Núcleo',
  },
  {
    title: 'Evaluación de madurez analítica',
    description: 'Evaluación de madurez con roadmap de evolución en 4 dimensiones.',
    status: 'Premium',
  },
  {
    title: 'Playbook ejecutivo de analytics',
    description: 'Cómo presentar datos a C-level: narrativa, visualización y marcos de decisión.',
    status: 'Premium',
  },
  {
    title: 'Programa de capacitación de equipos',
    description: 'Capacitación estructurada para equipos de producto, marketing y data.',
    status: 'Premium',
  },
  {
    title: 'Cadencia operativa de analytics',
    description: 'Ritmo operativo: standups, revisiones, respuesta a incidentes y mejora continua.',
    status: 'Núcleo',
  },
];

export const maturityStages = ['Reactivo', 'Proactivo', 'Predictivo', 'Prescriptivo'];

export const roleLabels: Record<string, string> = {
  admin: 'Administrador',
  consultant: 'Consultor',
  client: 'Cliente',
  viewer: 'Visor',
};

export const requestStatusLabels: Record<string, string> = {
  submitted: 'Enviado',
  in_review: 'En revisión',
  in_progress: 'En progreso',
  blocked: 'Bloqueado',
  completed: 'Completado',
  cancelled: 'Cancelado',
};

export const requestTypeLabels: Record<string, string> = {
  tracking: 'Tracking',
  dashboard: 'Dashboard',
  funnel: 'Embudo',
  qa: 'QA',
  reporting: 'Reporting',
  investigation: 'Investigación',
};

export const priorityLabels: Record<string, string> = {
  p0_critical: 'P0',
  p1_high: 'P1',
  p2_medium: 'P2',
  p3_low: 'P3',
};

export const articleCategoryLabels: Record<string, string> = {
  guide: 'Guía',
  best_practice: 'Buena práctica',
  use_case: 'Caso de uso',
  reference: 'Referencia',
};
