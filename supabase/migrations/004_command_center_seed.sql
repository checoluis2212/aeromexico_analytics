-- Seed data — Analytics Command Center

INSERT INTO sprints (name, goal, start_date, end_date, capacity_points, is_active) VALUES
('Sprint 12 — Q2', 'Cobertura e-commerce checkout + reportes revenue', '2026-05-26', '2026-06-09', 42, true),
('Sprint 13 — Q2', 'Mobile app events + BigQuery marts', '2026-06-09', '2026-06-23', 40, false);

INSERT INTO reports (slug, title, description, category, business_questions, data_source, refresh_frequency, dashboard_url, view_count, popularity_score, tags) VALUES
('acq-channel-performance', 'Rendimiento por canal de adquisición', 'Análisis de sesiones, conversiones y CPA por canal de marketing.', 'acquisition',
 ARRAY['¿Qué canal genera más conversiones?', '¿Cuál es el CPA por canal?'], 'GA4 + BigQuery', 'Diario',
 'https://lookerstudio.google.com/', 1240, 92.5, ARRAY['marketing','acquisition']),
('ecom-checkout-funnel', 'Embudo de checkout e-commerce', 'Visualización paso a paso del funnel de compra con tasas de abandono.', 'ecommerce',
 ARRAY['¿Dónde abandonan los usuarios?', '¿Cuál es la tasa de conversión por paso?'], 'GA4', 'Horario',
 'https://lookerstudio.google.com/', 890, 88.0, ARRAY['ecommerce','funnel']),
('rev-campaign-roas', 'ROAS por campaña', 'Retorno de inversión publicitaria por campaña y audiencia.', 'revenue',
 ARRAY['¿Qué campaña tiene mejor ROAS?', '¿Cómo evoluciona el revenue por campaña?'], 'BigQuery', 'Diario',
 'https://lookerstudio.google.com/', 2100, 95.0, ARRAY['revenue','marketing']),
('cj-customer-lifetime', 'Customer Journey — Lifetime Value', 'Análisis de LTV por cohorte y segmento de cliente.', 'customer_journey',
 ARRAY['¿Cuál es el LTV por cohorte?', '¿Qué segmentos tienen mayor retención?'], 'BigQuery', 'Semanal',
 'https://lookerstudio.google.com/', 560, 78.5, ARRAY['retention','ltv']),
('mob-app-engagement', 'Engagement App Móvil', 'DAU, sesiones, eventos clave y retención de la app móvil.', 'mobile',
 ARRAY['¿Cuántos DAU tenemos?', '¿Qué features tienen más engagement?'], 'GA4 Firebase', 'Diario',
 'https://lookerstudio.google.com/', 720, 85.0, ARRAY['mobile','engagement']),
('prod-feature-adoption', 'Adopción de features', 'Tracking de adopción de nuevas funcionalidades del producto.', 'product_analytics',
 ARRAY['¿Qué % de usuarios usa la feature X?', '¿Cuál es el time-to-value?'], 'GA4 + Amplitude export', 'Diario',
 'https://lookerstudio.google.com/', 430, 72.0, ARRAY['product','features'])
ON CONFLICT (slug) DO NOTHING;

INSERT INTO metrics (slug, name, type, definition, business_definition, formula, examples, tags) VALUES
('conversion-rate', 'Tasa de conversión', 'kpi', 'Porcentaje de sesiones que completan el objetivo principal.', 'Mide la efectividad del funnel para convertir visitantes en clientes.', '(conversiones / sesiones) × 100', ARRAY['3.2% checkout', '1.8% registro'], ARRAY['conversion','kpi']),
('revenue', 'Revenue', 'kpi', 'Ingresos totales atribuidos a transacciones completadas.', 'Ingreso bruto generado por ventas online.', 'SUM(purchase_revenue)', ARRAY['$1.2M mensual'], ARRAY['revenue','ecommerce']),
('sessions', 'Sesiones', 'metric', 'Número de sesiones iniciadas en la propiedad.', 'Volumen de tráfico del sitio o app.', 'COUNT(DISTINCT session_id)', ARRAY['450K/mes'], ARRAY['traffic']),
('bounce-rate', 'Tasa de rebote', 'metric', 'Porcentaje de sesiones de una sola página.', 'Indica engagement inicial del contenido.', '(sesiones rebote / sesiones) × 100', ARRAY['42% homepage'], ARRAY['engagement']),
('cac', 'Costo de adquisición (CAC)', 'kpi', 'Costo promedio para adquirir un cliente.', 'Eficiencia del gasto en marketing.', 'gasto_marketing / nuevos_clientes', ARRAY['$45 por cliente'], ARRAY['marketing','acquisition'])
ON CONFLICT (slug) DO NOTHING;

INSERT INTO dimensions (slug, name, definition, data_type, source, examples) VALUES
('channel', 'Canal', 'Canal de adquisición del usuario (organic, paid, direct, etc.)', 'string', 'GA4 default channel grouping', ARRAY['organic', 'paid_search', 'email']),
('device-category', 'Categoría de dispositivo', 'Tipo de dispositivo: desktop, mobile, tablet.', 'string', 'GA4 device_category', ARRAY['mobile', 'desktop']),
('market', 'Mercado', 'País o región geográfica del usuario.', 'string', 'GA4 country', ARRAY['MX', 'US', 'CO'])
ON CONFLICT (slug) DO NOTHING;

INSERT INTO analytics_scores (dimension, score, strengths, risks, opportunities) VALUES
('Tracking', 78, ARRAY['GA4 implementado en web', 'GTM con consent mode'], ARRAY['App móvil parcial', 'Eventos legacy sin migrar'], ARRAY['Completar app events', 'Server-side tagging']),
('Governance', 65, ARRAY['Event catalog iniciado', 'Naming convention definida'], ARRAY['Ownership no asignado en 30% eventos', 'Sin change management formal'], ARRAY['RACI matrix', 'Review cadence']),
('Reporting', 82, ARRAY['15 dashboards activos', 'BigQuery export diario'], ARRAY['Duplicación de métricas', 'Sin data dictionary completo'], ARRAY['Report marketplace', 'Self-service']),
('Data Quality', 71, ARRAY['QA automatizado post-deploy'], ARRAY['Discrepancias GA4 vs backend 5%'], ARRAY['Monitoring alerts', 'Reconciliation jobs']),
('Experimentation', 45, ARRAY['A/B tests en homepage'], ARRAY['Sin framework formal', 'Sin integración GA4 experiments'], ARRAY['Optimizely + GA4', 'Experiment registry']),
('Self-Service', 58, ARRAY['Report marketplace en beta'], ARRAY['Alta dependencia de analytics team'], ARRAY['Discovery assistant', 'SQL templates']),
('Documentation', 74, ARRAY['Knowledge hub activo', 'Playbooks GA4/GTM'], ARRAY['Docs desactualizados en 20% eventos'], ARRAY['Versionado automático', 'Review quarterly']);

INSERT INTO analytics_health (health_score, tracking_coverage, ga4_status, bigquery_status, gtm_status, roi_estimate, hours_saved) VALUES
(76, 84.5, 'healthy', 'healthy', 'healthy', 485000, 1240);
