-- AI intake / agent handling on requests
ALTER TABLE requests ADD COLUMN IF NOT EXISTS ai_intake JSONB;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS agent_handled BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN requests.ai_intake IS 'Triage del agente: decisión, mensajes, confianza';
COMMENT ON COLUMN requests.agent_handled IS 'true si el agente auto-aceptó o procesó el pedido';
