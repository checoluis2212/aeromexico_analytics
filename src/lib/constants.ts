import { pedirHubHref } from '@/lib/ai/assistant-modes';

export const siteConfig = {
  name: 'Sergio Burgos',
  tagline: 'Analytics & Métricas · Aeroméxico',
  role: 'Analytics Metrics Specialist',
  org: 'Aeroméxico',
  description:
    'Portal de Sergio Burgos en Aeroméxico: pedir trabajo de analytics, ver tu cola y consultar datos con el AI Agent.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://workingwithsergio.com',
  author: 'Sergio Burgos',
  email: 'luissergio.mkt@gmail.com',
};

export const analyticsStack = [
  { name: 'Google Analytics 4', short: 'GA4' },
  { name: 'Google Tag Manager', short: 'GTM' },
  { name: 'BigQuery', short: 'BQ' },
  { name: 'Looker Studio', short: 'Looker' },
] as const;

/** Navegación principal — visible en header */
export const navPrimary = [
  { href: '/', label: 'Inicio' },
  { href: '/about', label: 'Sobre mí' },
  { href: '/working-with-me', label: 'Cómo trabajo' },
];

/** Recursos — menú desplegable */
export const navResources = [
  { href: '/event-catalog', label: 'Eventos GA4', hint: 'Qué medimos' },
  { href: '/glosario', label: 'Glosario', hint: 'Definiciones GA4 y GTM' },
  { href: '/faq', label: 'FAQ', hint: 'Preguntas frecuentes' },
  { href: '/analytics-os', label: 'Analytics OS', hint: 'Framework completo', badge: 'Premium' },
  { href: '/ai-insights', label: 'Insights con IA', hint: 'Sube un CSV y analiza' },
  { href: '/contact', label: 'Contacto', hint: 'Escríbeme directo' },
];

/** Rutas con barra lateral para clientes autenticados */
/** Rutas del portal cliente: mantienen sidebar y cabecera compacta. */
export const clientAreaPrefixes = [
  '/mis-pedidos',
  '/pedir',
  '/perfil',
  '/preguntale',
  '/ai-agent',
  '/working-with-me',
  '/event-catalog',
  '/faq',
  '/glosario',
] as const;

/** Navegación lateral — portal cliente (pedidos) */
export const clientNavPrimary = [
  { href: '/mis-pedidos', label: 'Mis pedidos', icon: 'Inbox', hint: 'Estado y seguimiento' },
  {
    href: '/mis-pedidos/archivo',
    label: 'Mis entregas',
    icon: 'FolderArchive',
    hint: 'Dashboards y videos archivados',
  },
  {
    href: '/ai-agent',
    label: 'AI Agent',
    icon: 'Sparkles',
    hint: 'Insights con datos de negocio',
    badge: 'IA',
    featured: true,
    matchPaths: ['/ai-agent'],
  },
  {
    href: pedirHubHref(),
    label: 'Pedir trabajo',
    icon: 'PlusCircle',
    hint: 'Formulario de solicitud',
    matchPaths: ['/pedir', '/preguntale'],
  },
  { href: '/working-with-me', label: 'Cómo trabajo', icon: 'BookOpen', hint: 'Tiempos y colaboración' },
  { href: '/perfil', label: 'Mi perfil', icon: 'User', hint: 'Tu cuenta' },
] as const;

export const clientNavResources = [
  { href: '/event-catalog', label: 'Eventos GA4', hint: 'Qué medimos' },
  { href: '/faq', label: 'FAQ', hint: 'Preguntas frecuentes' },
  { href: '/glosario', label: 'Glosario', hint: 'Definiciones GA4 y GTM' },
] as const;

/** @deprecated Usar navPrimary + navResources */
export const navItems = [
  ...navPrimary,
  ...navResources.filter((r) => !r.badge).map(({ href, label }) => ({ href, label })),
  { href: '/analytics-os', label: 'Analytics OS', badge: 'Premium' },
];

/** Acceso rápido — footer y enlaces cruzados */
export const hubNavItems = [
  { href: pedirHubHref(), label: 'Pedir trabajo' },
  { href: '/mis-pedidos', label: 'Mis pedidos' },
  { href: '/working-with-me', label: 'Cómo trabajo' },
];

/** Áreas comunes en Aeroméxico */
export const requestAreas = [
  'Marketing',
  'Digital',
  'Producto',
  'E-commerce',
  'App móvil',
  'Operaciones',
  'Otro',
] as const;

/** Prioridades en lenguaje humano */
export const requestPriorities = [
  { value: 'p0_critical', label: 'Urgente — lo necesito ya' },
  { value: 'p1_high', label: 'Importante — esta semana' },
  { value: 'p2_medium', label: 'Normal — próximas semanas' },
  { value: 'p3_low', label: 'Sin prisa — cuando se pueda' },
] as const;

/** Tipos de pedido — lenguaje de negocio */
export const requestTypes = [
  { value: 'dashboard', label: 'Dashboard o reporte', description: 'KPIs y reportes para tu equipo — incluyendo apoyo a Growth' },
  { value: 'tracking', label: 'Medir algo nuevo', description: 'Evento, conversión, tag GTM o cambio en web/app' },
  { value: 'funnel', label: 'Embudo o conversión', description: 'Checkout, booking, app — dónde se pierden usuarios' },
  { value: 'qa', label: 'Revisar métricas', description: 'Los números no cuadran o hay dudas en GA4/BQ' },
  { value: 'reporting', label: 'Datos en BigQuery', description: 'Query, dataset o informe recurrente' },
  { value: 'investigation', label: 'Investigar un dato', description: 'Atribución, revenue, cohortes — algo no cuadra' },
];

export const services = [
  {
    title: 'Apoyo a Growth',
    description: 'Acompaño al equipo de Growth con KPIs, conversión, adquisición y dashboards. Yo no ejecuto growth: me enfoco en que la medición sea confiable.',
    icon: 'Target',
  },
  {
    title: 'GA4 — Aeroméxico',
    description: 'Eventos, conversiones y configuración de GA4. Lo validamos en DebugView y lo dejamos documentado para que no se pierda.',
    icon: 'BarChart3',
  },
  {
    title: 'GTM & Data Layer',
    description: 'Tags, triggers y variables sobre los data layers de Aeroméxico (web, app, e-commerce). Revisamos Consent Mode y hacemos QA en Preview.',
    icon: 'Code2',
  },
  {
    title: 'BigQuery',
    description: 'Export de GA4 a BigQuery, queries y datasets para que puedas responder preguntas reales del negocio (sin volarte con “data science”).',
    icon: 'Database',
  },
  {
    title: 'Looker Studio & Reporting',
    description: 'Dashboards y reportes conectados a GA4 y BigQuery para marketing, producto y liderazgo. Claros, útiles y fáciles de mantener.',
    icon: 'BarChart3',
  },
  {
    title: 'QA & Gobernanza',
    description: 'Auditorías post-deploy, reconciliación de datos y reglas simples de naming. Lo importante: que los números cuadren y todos hablen el mismo idioma.',
    icon: 'ShieldCheck',
  },
  {
    title: 'Revisión',
    description: 'Reviso tu implementación (GTM/dataLayer) y tus métricas (GA4/BigQuery). Te digo qué está bien, qué no, y qué haría yo para arreglarlo.',
    icon: 'Sparkles',
  },
];

export const principles = [
  {
    title: 'Tu decisión de negocio primero',
    description:
      'Vengas de E-commerce, Marketing, Producto o Growth: empezamos por qué necesitas el dato (conversión, revenue, embudo, campaña). La medición técnica viene después.',
  },
  {
    title: 'Yo mantengo el data layer',
    description:
      'El data layer de Aeroméxico (web, app, checkout) lo cuido yo. GTM y GA4 se apoyan ahí. Tú no tienes que construirlo — cuéntame qué quieres medir.',
  },
  {
    title: 'Catálogo para toda la empresa',
    description:
      'Eventos y cambios quedan en el catálogo. Cualquier área puede ver qué existe y qué significa, sin depender de chats o memoria.',
  },
  {
    title: 'Medición al ritmo de tu área',
    description:
      'Si E-commerce, Producto o App lanzan un flujo nuevo, lo alineamos antes o junto al deploy. Así el dato sale cuando lo necesitas, no días después.',
  },
];

export const slas = [
  {
    priority: 'Urgente',
    responseMax: '2 h',
    deliveryMax: '24 h',
    description: 'Algo se rompió en producción o un número importante no cuadra.',
  },
  {
    priority: 'Importante',
    responseMax: '4 h',
    deliveryMax: '2 días',
    description: 'Riesgo en un flujo clave o un dashboard sin datos.',
  },
  {
    priority: 'Normal',
    responseMax: '1 día',
    deliveryMax: '1 semana',
    description: 'Dashboard nuevo, evento o mejora planificada.',
  },
  {
    priority: 'Sin prisa',
    responseMax: '2 días',
    deliveryMax: '2 semanas',
    description: 'Ajustes menores, consultas o documentación.',
  },
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
  p0_critical: 'Urgente',
  p1_high: 'Importante',
  p2_medium: 'Normal',
  p3_low: 'Sin prisa',
};

export const articleCategoryLabels: Record<string, string> = {
  guide: 'Guía',
  best_practice: 'Buena práctica',
  use_case: 'Caso de uso',
  reference: 'Referencia',
};
