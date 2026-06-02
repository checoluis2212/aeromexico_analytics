-- Aceptación de pedidos por Sergio + consejo de capacidad IA

DO $$ BEGIN
  CREATE TYPE sergio_decision AS ENUM ('pending', 'accepted', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE requests ADD COLUMN IF NOT EXISTS sergio_decision sergio_decision NOT NULL DEFAULT 'pending';
ALTER TABLE requests ADD COLUMN IF NOT EXISTS committed_due_date DATE;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS sergio_notes TEXT;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS sergio_decided_at TIMESTAMPTZ;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS sergio_decided_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS ai_capacity_advice JSONB;

-- Pedidos existentes: ya en flujo, marcar como aceptados
UPDATE requests SET sergio_decision = 'accepted' WHERE sergio_decision = 'pending';
