/** Catálogo estático — debe coincidir con seed en 020_orchestrator_skills.sql */

export type SkillCategory = 'analytics' | 'data' | 'ads' | 'crm' | 'collaboration' | 'knowledge' | 'commerce';

/** Solo `bigquery` alimenta respuestas con cifras; el resto es ingesta o canales futuros. */
export type SkillDataRole = 'data_warehouse' | 'auxiliary';

export type MarketplaceSkillDef = {
  slug: string;
  name: string;
  category: SkillCategory;
  description: string;
  dataRole: SkillDataRole;
  envKeys?: string[];
};

export const ORCHESTRATOR_DATA_WAREHOUSE_SLUG = 'bigquery';

export const SKILLS_MARKETPLACE_CATALOG: MarketplaceSkillDef[] = [
  {
    slug: 'bigquery',
    name: 'BigQuery',
    category: 'data',
    dataRole: 'data_warehouse',
    description:
      'Fuente de verdad: marts, export GA4, ads y CRM consolidados. La IA usa solo esta capa para cifras.',
    envKeys: [
      'GOOGLE_APPLICATION_CREDENTIALS',
      'GOOGLE_CLOUD_PROJECT_ID',
      'BIGQUERY_PROJECT_ID',
    ],
  },
  {
    slug: 'google_analytics',
    name: 'Google Analytics',
    category: 'analytics',
    dataRole: 'auxiliary',
    description: 'Ingesta hacia el almacén (no consulta directa por la IA para KPIs)',
    envKeys: ['NEXT_PUBLIC_GA4_MEASUREMENT_ID'],
  },
  {
    slug: 'meta_ads',
    name: 'Meta Ads',
    category: 'ads',
    dataRole: 'auxiliary',
    description: 'Datos de campaña vía tablas en el almacén',
    envKeys: ['META_ADS_ACCESS_TOKEN'],
  },
  {
    slug: 'google_ads',
    name: 'Google Ads',
    category: 'ads',
    dataRole: 'auxiliary',
    description: 'Datos de campaña vía tablas en el almacén',
    envKeys: ['GOOGLE_ADS_DEVELOPER_TOKEN'],
  },
  {
    slug: 'hubspot',
    name: 'HubSpot',
    category: 'crm',
    dataRole: 'auxiliary',
    description: 'CRM reflejado en marts del almacén',
    envKeys: ['HUBSPOT_ACCESS_TOKEN'],
  },
  {
    slug: 'salesforce',
    name: 'Salesforce',
    category: 'crm',
    dataRole: 'auxiliary',
    description: 'Pipeline reflejado en marts del almacén',
    envKeys: ['SALESFORCE_CLIENT_ID'],
  },
  {
    slug: 'slack',
    name: 'Slack',
    category: 'collaboration',
    dataRole: 'auxiliary',
    description: 'Notificaciones (no fuente de métricas)',
    envKeys: ['SLACK_WEBHOOK_URL', 'SLACK_BOT_TOKEN'],
  },
  {
    slug: 'teams',
    name: 'Microsoft Teams',
    category: 'collaboration',
    dataRole: 'auxiliary',
    description: 'Notificaciones (no fuente de métricas)',
    envKeys: ['TEAMS_WEBHOOK_URL'],
  },
  {
    slug: 'notion',
    name: 'Notion',
    category: 'knowledge',
    dataRole: 'auxiliary',
    description: 'Documentación (no fuente de métricas)',
    envKeys: ['NOTION_API_KEY'],
  },
  {
    slug: 'confluence',
    name: 'Confluence',
    category: 'knowledge',
    dataRole: 'auxiliary',
    description: 'Wiki (no fuente de métricas)',
    envKeys: ['CONFLUENCE_API_TOKEN'],
  },
  {
    slug: 'shopify',
    name: 'Shopify',
    category: 'commerce',
    dataRole: 'auxiliary',
    description: 'E-commerce vía tablas en el almacén',
    envKeys: ['SHOPIFY_ACCESS_TOKEN'],
  },
];

export function isDataWarehouseSkill(slug: string): boolean {
  const def = SKILLS_MARKETPLACE_CATALOG.find((s) => s.slug === slug);
  return def?.dataRole === 'data_warehouse';
}

export const SKILL_CATEGORY_LABELS: Record<SkillCategory, string> = {
  analytics: 'Analítica',
  data: 'Datos',
  ads: 'Publicidad',
  crm: 'CRM',
  collaboration: 'Colaboración',
  knowledge: 'Conocimiento',
  commerce: 'Comercio',
};
