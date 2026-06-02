-- Semáforo de capacidad de Sergio (disponible / limitado / lleno)

DO $$ BEGIN
  CREATE TYPE sergio_capacity AS ENUM ('available', 'limited', 'full');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS sergio_availability (
  id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  capacity sergio_capacity NOT NULL DEFAULT 'available',
  note TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

INSERT INTO sergio_availability (id, capacity)
VALUES (1, 'available')
ON CONFLICT (id) DO NOTHING;

ALTER TABLE sergio_availability ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "availability_public_read" ON sergio_availability;
CREATE POLICY "availability_public_read" ON sergio_availability
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "availability_internal_manage" ON sergio_availability;
CREATE POLICY "availability_internal_manage" ON sergio_availability
  FOR ALL TO authenticated
  USING (is_internal_user())
  WITH CHECK (is_internal_user());
