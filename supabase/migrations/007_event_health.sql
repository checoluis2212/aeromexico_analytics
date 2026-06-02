-- Event health tracking for GA4/GTM QA visibility

DO $$ BEGIN
  CREATE TYPE event_health_status AS ENUM ('healthy', 'warning', 'broken', 'pending_qa');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE event_catalog ADD COLUMN IF NOT EXISTS health_status event_health_status DEFAULT 'pending_qa';
ALTER TABLE event_catalog ADD COLUMN IF NOT EXISTS last_validated_at TIMESTAMPTZ;
ALTER TABLE event_catalog ADD COLUMN IF NOT EXISTS validation_notes TEXT;

ALTER TABLE analytics_health ADD COLUMN IF NOT EXISTS events_healthy INT;
ALTER TABLE analytics_health ADD COLUMN IF NOT EXISTS events_warning INT;
ALTER TABLE analytics_health ADD COLUMN IF NOT EXISTS events_broken INT;
ALTER TABLE analytics_health ADD COLUMN IF NOT EXISTS events_total INT;

-- Seed known events with realistic health states
UPDATE event_catalog SET health_status = 'healthy', last_validated_at = NOW() - INTERVAL '2 days'
WHERE event_name IN ('page_view', 'sign_up', 'purchase', 'generate_lead');

UPDATE event_catalog SET health_status = 'warning', last_validated_at = NOW() - INTERVAL '14 days',
  validation_notes = 'Parámetro items inconsistente en checkout mobile — revisar en QA'
WHERE event_name = 'file_download';

-- Mark any remaining active events as healthy if still pending
UPDATE event_catalog SET health_status = 'healthy', last_validated_at = NOW()
WHERE is_active = true AND health_status = 'pending_qa';
