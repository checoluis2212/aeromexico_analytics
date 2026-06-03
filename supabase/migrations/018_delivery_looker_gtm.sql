-- Bibliotecas de entrega: Looker Studio + videos GTM Debug, vinculadas a pedidos

CREATE TYPE request_delivery_kind AS ENUM ('looker_dashboard', 'gtm_debug_video');

CREATE TABLE IF NOT EXISTS looker_dashboard_library (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  dashboard_url TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS gtm_debug_video_library (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  event_name TEXT,
  tags TEXT[] DEFAULT '{}',
  recorded_at DATE,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS request_deliveries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  kind request_delivery_kind NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  notes TEXT,
  library_looker_id UUID REFERENCES looker_dashboard_library(id) ON DELETE SET NULL,
  library_gtm_video_id UUID REFERENCES gtm_debug_video_library(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_request_deliveries_request ON request_deliveries(request_id, kind);
CREATE INDEX IF NOT EXISTS idx_looker_library_active ON looker_dashboard_library(is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_gtm_video_library_active ON gtm_debug_video_library(is_active, sort_order);

CREATE TRIGGER looker_dashboard_library_updated_at
  BEFORE UPDATE ON looker_dashboard_library
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE looker_dashboard_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE gtm_debug_video_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE request_deliveries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "looker_library_internal" ON looker_dashboard_library
  FOR ALL TO authenticated USING (is_internal_user()) WITH CHECK (is_internal_user());

CREATE POLICY "gtm_video_library_internal" ON gtm_debug_video_library
  FOR ALL TO authenticated USING (is_internal_user()) WITH CHECK (is_internal_user());

CREATE POLICY "request_deliveries_select" ON request_deliveries
  FOR SELECT TO authenticated
  USING (
    is_internal_user()
    OR EXISTS (
      SELECT 1 FROM requests r
      WHERE r.id = request_id
      AND (
        r.user_id = auth.uid()
        OR r.requester_email = (SELECT email FROM auth.users WHERE id = auth.uid())
      )
    )
  );

CREATE POLICY "request_deliveries_internal_write" ON request_deliveries
  FOR ALL TO authenticated
  USING (is_internal_user())
  WITH CHECK (is_internal_user());
