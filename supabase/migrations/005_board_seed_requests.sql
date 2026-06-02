-- Seed sprint board items (Avance / Scrum)
INSERT INTO requests (
  user_id,
  requester_name,
  requester_email,
  company,
  type,
  title,
  description,
  priority,
  status,
  delivery_status,
  story_points,
  sprint_id
)
SELECT
  p.id,
  COALESCE(p.full_name, 'Analytics Team'),
  p.email,
  COALESCE(p.company, 'Aeroméxico'),
  v.type::request_type,
  v.title,
  v.description,
  v.priority::request_priority,
  v.status::request_status,
  v.delivery_status::delivery_status,
  v.story_points,
  s.id
FROM profiles p
CROSS JOIN sprints s
CROSS JOIN (
  VALUES
    ('dashboard', 'Dashboard ROAS por campaña', 'ROAS y revenue por campaña.', 'p1_high', 'in_progress', 'development', 8),
    ('tracking', 'Evento add_to_cart — app móvil', 'Evento en Firebase/GA4.', 'p1_high', 'in_progress', 'analytics_qa', 5),
    ('funnel', 'Funnel checkout — abandono paso 3', 'Abandono paso 3 checkout.', 'p2_medium', 'in_review', 'requirements', 13),
    ('investigation', 'BigQuery mart — customer LTV', 'Mart LTV por cohorte.', 'p2_medium', 'submitted', 'discovery', 21),
    ('qa', 'QA post-deploy GTM v2.4', 'QA post deploy GTM.', 'p0_critical', 'in_progress', 'ready_for_release', 3),
    ('tracking', 'Tracking UTM — landing pages', 'UTM en landings.', 'p2_medium', 'submitted', 'backlog', 5),
    ('tracking', 'GTM — Consent Mode v2', 'Consent Mode v2.', 'p1_high', 'blocked', 'blocked', 8),
    ('dashboard', 'Reporte DAU mobile', 'DAU app móvil.', 'p3_low', 'completed', 'done', 3)
) AS v(type, title, description, priority, status, delivery_status, story_points)
WHERE p.role IN ('admin', 'consultant')
  AND s.is_active = true
  AND NOT EXISTS (SELECT 1 FROM requests LIMIT 1);
