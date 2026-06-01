-- Seed data for Working With Sergio

INSERT INTO playbooks (slug, title, category, description, content, steps, checklist, sort_order) VALUES
('ga4-implementation', 'Implementación GA4', 'ga4', 'Guía completa para implementar Google Analytics 4 desde cero.', 
'# Implementación GA4

## Objetivo
Establecer una base de medición confiable, gobernada y escalable.

## Fases
1. **Discovery** — Objetivos de negocio, KPIs, stakeholders
2. **Measurement Plan** — Eventos, parámetros, conversiones
3. **Implementation** — GTM + dataLayer + QA
4. **Validation** — DebugView, comparación histórica
5. **Documentation** — Event catalog, playbooks internos',
'[{"title":"Discovery","description":"Workshop con stakeholders"},{"title":"Measurement Plan","description":"Documentar eventos y KPIs"},{"title":"GTM Setup","description":"Tags, triggers, variables"},{"title":"QA","description":"Validación end-to-end"},{"title":"Go-live","description":"Deploy y monitoreo"}]'::jsonb,
'["Measurement plan aprobado","GTM container publicado","Eventos validados en DebugView","Conversiones configuradas","Documentación actualizada"]'::jsonb, 1),

('gtm-foundation', 'Google Tag Manager', 'gtm', 'Arquitectura y mejores prácticas para GTM enterprise.',
'# GTM Foundation

## Principios
- Naming conventions consistentes
- Folder structure por dominio
- Variables reutilizables
- Consent Mode v2 integrado',
'[{"title":"Container Audit","description":"Revisar estructura actual"},{"title":"Naming Convention","description":"Definir estándares"},{"title":"Tag Architecture","description":"Modular y escalable"}]'::jsonb,
'["Folders organizados","Naming convention documentado","Consent Mode activo"]'::jsonb, 2),

('data-layer-spec', 'Data Layer Specification', 'data_layer', 'Especificación técnica del dataLayer para consistencia de datos.',
'# Data Layer

## Estructura recomendada
```javascript
window.dataLayer = window.dataLayer || [];
dataLayer.push({
  event: "page_view",
  page: { type: "product", category: "analytics" }
});
```',
'[{"title":"Schema Design","description":"Definir objetos y propiedades"},{"title":"Implementation","description":"Push events desde la app"},{"title":"GTM Mapping","description":"Variables y triggers"}]'::jsonb,
'["Schema documentado","Eventos pusheados correctamente","GTM lee dataLayer"]'::jsonb, 3),

('bigquery-pipeline', 'BigQuery Export & Modeling', 'bigquery', 'Pipeline GA4 → BigQuery con modelado analítico.',
'# BigQuery Pipeline

## Setup
1. Activar export diario GA4 → BigQuery
2. Crear dataset staging + marts
3. dbt o scheduled queries para transformaciones',
'[{"title":"Export Setup","description":"GA4 Admin → BigQuery Link"},{"title":"Staging Tables","description":"Raw events"},{"title":"Data Marts","description":"Modelos de negocio"}]'::jsonb,
'["Export activo","Dataset creado","Queries de validación OK"]'::jsonb, 4),

('looker-studio-dashboards', 'Looker Studio Dashboards', 'looker_studio', 'Diseño de dashboards ejecutivos y operativos.',
'# Looker Studio

## Tipos de dashboards
- **Executive** — KPIs de alto nivel, tendencias
- **Operational** — Métricas diarias, alertas
- **Diagnostic** — Funnels, cohortes, segmentos',
'[{"title":"KPI Definition","description":"Métricas clave"},{"title":"Data Source","description":"BigQuery / GA4 connector"},{"title":"Design","description":"Layout ejecutivo"}]'::jsonb,
'["Data source conectado","KPIs validados","Dashboard compartido"]'::jsonb, 5),

('qa-analytics', 'QA Analytics', 'qa', 'Framework de quality assurance para implementaciones de analytics.',
'# QA Analytics

## Checklist
- Tag Assistant / GTM Preview
- GA4 DebugView
- Comparación pre/post deploy
- Automated monitoring',
'[{"title":"Test Plan","description":"Casos de prueba"},{"title":"Manual QA","description":"DebugView validation"},{"title":"Automated Checks","description":"Monitoring scripts"}]'::jsonb,
'["Test plan ejecutado","0 eventos rotos","Sign-off del stakeholder"]'::jsonb, 6);

INSERT INTO event_catalog (event_name, description, parameters, example_code, use_cases, category) VALUES
('page_view', 'Vista de página estándar. Se dispara en cada navegación.', 
 '[{"name":"page_title","type":"string","required":true,"description":"Título de la página"},{"name":"page_location","type":"string","required":true,"description":"URL completa"},{"name":"page_type","type":"string","required":false,"description":"Tipo: home, product, checkout"}]'::jsonb,
 'dataLayer.push({ event: "page_view", page_title: document.title, page_location: window.location.href, page_type: "product" });',
 ARRAY['Navegación general','Segmentación por tipo de página','Análisis de contenido'],
 'engagement'),

('sign_up', 'Registro completado exitosamente.',
 '[{"name":"method","type":"string","required":true,"description":"email, google, apple"},{"name":"user_type","type":"string","required":false,"description":"free, trial, enterprise"}]'::jsonb,
 'gtag("event", "sign_up", { method: "email", user_type: "trial" });',
 ARRAY['Adquisición','Funnel de registro','Atribución de canales'],
 'conversion'),

('purchase', 'Transacción completada.',
 '[{"name":"transaction_id","type":"string","required":true,"description":"ID único"},{"name":"value","type":"number","required":true,"description":"Valor total"},{"name":"currency","type":"string","required":true,"description":"ISO 4217"},{"name":"items","type":"array","required":false,"description":"Productos"}]'::jsonb,
 'gtag("event", "purchase", { transaction_id: "T12345", value: 99.99, currency: "USD", items: [{ item_id: "SKU_001", item_name: "Analytics Audit" }] });',
 ARRAY['Revenue tracking','E-commerce reporting','ROAS analysis'],
 'conversion'),

('generate_lead', 'Formulario de lead completado.',
 '[{"name":"lead_type","type":"string","required":true,"description":"demo, contact, newsletter"},{"name":"value","type":"number","required":false,"description":"Lead value estimate"}]'::jsonb,
 'gtag("event", "generate_lead", { lead_type: "demo", value: 500 });',
 ARRAY['Lead gen funnels','Marketing attribution','Sales pipeline'],
 'conversion'),

('file_download', 'Descarga de archivo/documento.',
 '[{"name":"file_name","type":"string","required":true,"description":"Nombre del archivo"},{"name":"file_extension","type":"string","required":false,"description":"pdf, xlsx, csv"}]'::jsonb,
 'gtag("event", "file_download", { file_name: "analytics-playbook.pdf", file_extension: "pdf" });',
 ARRAY['Content engagement','Resource tracking','Lead scoring'],
 'engagement');

INSERT INTO articles (slug, title, category, excerpt, content, tags) VALUES
('measurement-strategy-101', 'Measurement Strategy 101', 'guide', 'Cómo diseñar una estrategia de medición que alinee negocio y datos.',
'# Measurement Strategy 101

Una estrategia de medición efectiva conecta objetivos de negocio con KPIs accionables.

## Framework
1. **Business Questions** — ¿Qué decisiones necesitamos tomar?
2. **KPIs** — ¿Qué métricas responden esas preguntas?
3. **Events** — ¿Qué acciones medimos?
4. **Governance** — ¿Quién mantiene y valida?

## Anti-patterns
- Medir todo sin priorizar
- Implementar tags sin measurement plan
- Ignorar data quality post-launch',
 ARRAY['strategy','measurement','governance']),

('consent-mode-v2', 'Consent Mode v2 — Guía Práctica', 'best_practice', 'Implementación de Consent Mode v2 para cumplimiento GDPR/CCPA.',
'# Consent Mode v2

## Por qué importa
Sin consent mode, pierdes visibilidad en usuarios que rechazan cookies mientras mantienes compliance.

## Implementación
1. CMP integration (OneTrust, Cookiebot, etc.)
2. Default consent state
3. Update on user action
4. GTM consent settings',
 ARRAY['consent','gdpr','gtm','privacy']),

('ga4-bigquery-use-cases', 'Casos de Uso GA4 + BigQuery', 'use_case', 'Análisis avanzados que solo son posibles con export a BigQuery.',
'# GA4 + BigQuery Use Cases

## Análisis avanzados
- **Path analysis** — Secuencias de eventos custom
- **Cohort retention** — Retención por segmento
- **Attribution modeling** — Multi-touch custom
- **Session reconstruction** — Lógica propia de sesiones',
 ARRAY['bigquery','ga4','advanced-analytics']);
