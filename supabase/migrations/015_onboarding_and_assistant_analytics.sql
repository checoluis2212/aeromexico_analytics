-- Onboarding de portal + tipos de evento del copiloto IA

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;

COMMENT ON COLUMN profiles.onboarding_completed_at IS
  'Cuándo el usuario completó o saltó el tour de bienvenida del portal cliente';

ALTER TABLE assistant_chat_usage
  ADD COLUMN IF NOT EXISTS event_type TEXT NOT NULL DEFAULT 'chat_message';

COMMENT ON COLUMN assistant_chat_usage.event_type IS
  'chat_message | request_draft | request_created — solo chat_message cuenta para rate limit';

CREATE INDEX IF NOT EXISTS idx_assistant_usage_event_time
  ON assistant_chat_usage (event_type, created_at DESC);
