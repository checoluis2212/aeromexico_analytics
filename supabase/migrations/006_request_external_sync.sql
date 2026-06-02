-- External sync (Trello / Jira) + user request linking

ALTER TABLE requests ADD COLUMN IF NOT EXISTS external_provider TEXT;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS external_id TEXT;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS external_url TEXT;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS external_status TEXT;

CREATE INDEX IF NOT EXISTS idx_requests_external ON requests(external_provider, external_id);
CREATE INDEX IF NOT EXISTS idx_requests_requester_email ON requests(requester_email);

-- Authenticated users can view requests they submitted (by email or user_id)
DROP POLICY IF EXISTS "Users view own requests by email" ON requests;
CREATE POLICY "Users view own requests by email" ON requests
  FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id
    OR requester_email = (SELECT email FROM profiles WHERE id = auth.uid())
    OR is_internal_user()
  );
