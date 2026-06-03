-- Tour de onboarding para AI Agent (cliente)

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS ai_agent_tour_completed_at TIMESTAMPTZ;
