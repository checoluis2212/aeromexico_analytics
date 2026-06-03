-- Rate limit del asistente de tracking (10 preguntas / hora / usuario)

CREATE TABLE IF NOT EXISTS assistant_chat_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_assistant_usage_user_time
  ON assistant_chat_usage (user_id, created_at DESC);

ALTER TABLE assistant_chat_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users insert own assistant usage"
  ON assistant_chat_usage FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users read own assistant usage"
  ON assistant_chat_usage FOR SELECT TO authenticated
  USING (user_id = auth.uid());
