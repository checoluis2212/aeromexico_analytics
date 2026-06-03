-- Skills Marketplace: módulos de datos que el administrador activa para el orquestador IA

CREATE TYPE orchestrator_skill_connection AS ENUM (
  'not_configured',
  'connected',
  'error'
);

CREATE TABLE IF NOT EXISTS orchestrator_skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'analytics',
  description TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  enabled BOOLEAN NOT NULL DEFAULT FALSE,
  connection_status orchestrator_skill_connection NOT NULL DEFAULT 'not_configured',
  config JSONB NOT NULL DEFAULT '{}',
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orchestrator_skills_enabled
  ON orchestrator_skills (enabled, sort_order);

ALTER TABLE orchestrator_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "orchestrator_skills_internal_read" ON orchestrator_skills
  FOR SELECT TO authenticated
  USING (is_internal_user());

CREATE POLICY "orchestrator_skills_admin_write" ON orchestrator_skills
  FOR ALL TO authenticated
  USING (is_internal_user())
  WITH CHECK (is_internal_user());

INSERT INTO orchestrator_skills (slug, name, category, description, sort_order) VALUES
  ('google_analytics', 'Google Analytics', 'analytics', 'Tráfico, conversiones y comportamiento web/app', 10),
  ('bigquery', 'BigQuery', 'data', 'Fuente de verdad: marts y métricas de negocio (única capa para la IA)', 0),
  ('meta_ads', 'Meta Ads', 'ads', 'Campañas, audiencias y rendimiento en Meta', 30),
  ('google_ads', 'Google Ads', 'ads', 'Search, display y conversiones de Google Ads', 40),
  ('hubspot', 'HubSpot', 'crm', 'Leads, embudo comercial y atribución', 50),
  ('salesforce', 'Salesforce', 'crm', 'Oportunidades y pipeline de ventas', 60),
  ('slack', 'Slack', 'collaboration', 'Alertas y resúmenes al equipo', 70),
  ('teams', 'Microsoft Teams', 'collaboration', 'Notificaciones y canales internos', 80),
  ('notion', 'Notion', 'knowledge', 'Documentación y playbooks', 90),
  ('confluence', 'Confluence', 'knowledge', 'Wiki y especificaciones', 100),
  ('shopify', 'Shopify', 'commerce', 'Ventas e-commerce y checkout', 110)
ON CONFLICT (slug) DO NOTHING;
