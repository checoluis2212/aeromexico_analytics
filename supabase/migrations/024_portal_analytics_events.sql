-- Catálogo de eventos del portal interno (dataLayer → GTM → GA4)

INSERT INTO event_catalog (event_name, description, parameters, example_code, use_cases, category, is_active)
VALUES
(
  'user_context',
  'Contexto de usuario autenticado para User-ID en GA4. Se dispara al login y se limpia al logout.',
  '[{"name":"user_id","type":"string","required":true,"description":"UUID Supabase (auth.users.id)"},{"name":"user_properties","type":"object","required":false,"description":"app_role, acc_role, portal_access"}]'::jsonb,
  'dataLayer.push({ event: "user_context", user_id: "<uuid>", user_properties: { app_role: "client", acc_role: null, portal_access: true } });',
  ARRAY['User-ID GA4','Segmentación por rol'],
  'portal',
  true
),
(
  'page_view',
  'Vista de página SPA del portal con sección y tipo.',
  '[{"name":"page_path","type":"string","required":true},{"name":"portal_section","type":"string","required":true,"description":"access|client|command_center|resources|marketing"},{"name":"page_type","type":"string","required":true},{"name":"auth_state","type":"string","required":true}]'::jsonb,
  'dataLayer.push({ event: "page_view", page_path: "/pedir", portal_section: "client", page_type: "request_hub", auth_state: "authenticated" });',
  ARRAY['Navegación SPA','Funnels por sección'],
  'portal',
  true
),
(
  'access_portal_view',
  'Carga del portal pre-entry /access.',
  '[{"name":"intent","type":"string","required":false},{"name":"initial_view","type":"string","required":false,"description":"form|pending|success"}]'::jsonb,
  'dataLayer.push({ event: "access_portal_view", initial_view: "form" });',
  ARRAY['Funnel de acceso'],
  'portal',
  true
),
(
  'generate_lead',
  'Solicitud de acceso enviada (GA4 recommended).',
  '[{"name":"lead_type","type":"string","required":true,"description":"platform_access"},{"name":"department","type":"string","required":false},{"name":"company","type":"string","required":false}]'::jsonb,
  'dataLayer.push({ event: "generate_lead", lead_type: "platform_access", department: "Marketing" });',
  ARRAY['Adquisición interna','Funnel pre-entry'],
  'portal',
  true
),
(
  'login',
  'Login exitoso con cuenta aprobada (GA4 recommended).',
  '[{"name":"method","type":"string","required":true,"description":"email"}]'::jsonb,
  'dataLayer.push({ event: "login", method: "email" });',
  ARRAY['Autenticación','User-ID'],
  'portal',
  true
),
(
  'request_submit',
  'Pedido de analytics enviado.',
  '[{"name":"request_id","type":"string","required":true},{"name":"request_type","type":"string","required":true},{"name":"priority","type":"string","required":false},{"name":"source","type":"string","required":true,"description":"form|chat"}]'::jsonb,
  'dataLayer.push({ event: "request_submit", request_id: "uuid", request_type: "dashboard", source: "form" });',
  ARRAY['Conversión principal','Funnel pedidos'],
  'portal',
  true
),
(
  'assistant_open',
  'Apertura del asistente IA (AI Agent / Pregúntale).',
  '[{"name":"module","type":"string","required":true,"description":"tracking_assistant|consultor_analytics|guided_request"}]'::jsonb,
  'dataLayer.push({ event: "assistant_open", module: "tracking_assistant" });',
  ARRAY['Adopción IA','Engagement'],
  'portal',
  true
),
(
  'assistant_message_send',
  'Mensaje enviado al asistente (sin contenido del mensaje).',
  '[{"name":"module","type":"string","required":true},{"name":"message_length","type":"number","required":true}]'::jsonb,
  'dataLayer.push({ event: "assistant_message_send", module: "tracking_assistant", message_length: 42 });',
  ARRAY['Uso del copiloto'],
  'portal',
  true
),
(
  'request_created_from_chat',
  'Pedido creado desde el chat del asistente.',
  '[{"name":"request_id","type":"string","required":true},{"name":"module","type":"string","required":true}]'::jsonb,
  'dataLayer.push({ event: "request_created_from_chat", request_id: "uuid", module: "tracking_assistant" });',
  ARRAY['Conversión IA→pedido'],
  'portal',
  true
),
(
  'cc_request_action',
  'Sergio acepta o rechaza un pedido.',
  '[{"name":"action","type":"string","required":true,"description":"accepted|rejected"},{"name":"request_id","type":"string","required":true}]'::jsonb,
  'dataLayer.push({ event: "cc_request_action", action: "accepted", request_id: "uuid" });',
  ARRAY['Operación command center'],
  'portal',
  true
),
(
  'cc_access_decision',
  'Admin aprueba o rechaza solicitud de acceso.',
  '[{"name":"decision","type":"string","required":true},{"name":"access_request_id","type":"string","required":true}]'::jsonb,
  'dataLayer.push({ event: "cc_access_decision", decision: "approved", access_request_id: "uuid" });',
  ARRAY['Governance acceso'],
  'portal',
  true
),
(
  'nav_click',
  'Clic en CTA de navegación.',
  '[{"name":"link_id","type":"string","required":true},{"name":"destination","type":"string","required":true},{"name":"nav_zone","type":"string","required":true,"description":"header|footer|hero|sidebar"}]'::jsonb,
  'dataLayer.push({ event: "nav_click", link_id: "pedir_ia", destination: "/pedir", nav_zone: "header" });',
  ARRAY['Navegación','CTAs'],
  'portal',
  true
)
ON CONFLICT (event_name) DO UPDATE SET
  description = EXCLUDED.description,
  parameters = EXCLUDED.parameters,
  example_code = EXCLUDED.example_code,
  use_cases = EXCLUDED.use_cases,
  category = EXCLUDED.category,
  updated_at = NOW();
