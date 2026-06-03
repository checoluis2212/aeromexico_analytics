-- Preferencias de notificación externa por cliente (Slack / Teams)

CREATE TABLE IF NOT EXISTS user_notification_settings (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  slack_webhook_url TEXT,
  teams_webhook_url TEXT,
  enabled BOOLEAN NOT NULL DEFAULT false,
  notify_submitted BOOLEAN NOT NULL DEFAULT true,
  notify_accepted BOOLEAN NOT NULL DEFAULT true,
  notify_status_change BOOLEAN NOT NULL DEFAULT true,
  notify_comment BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE user_notification_settings IS
  'Webhooks Slack/Teams del cliente para avisos de sus pedidos. Solo accesible vía API (service role).';

ALTER TABLE user_notification_settings ENABLE ROW LEVEL SECURITY;

-- Sin políticas para authenticated: lectura/escritura solo vía API con service role

CREATE OR REPLACE FUNCTION update_user_notification_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_user_notification_settings_updated ON user_notification_settings;
CREATE TRIGGER trg_user_notification_settings_updated
  BEFORE UPDATE ON user_notification_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_user_notification_settings_timestamp();
