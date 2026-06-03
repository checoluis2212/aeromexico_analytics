-- Pre-Entry Access Portal: solicitudes de acceso a la plataforma

CREATE TYPE platform_access_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE platform_access_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT NOT NULL,
  department TEXT NOT NULL,
  job_title TEXT NOT NULL,
  reason TEXT NOT NULL,
  status platform_access_status NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  reviewer_notes TEXT,
  proposed_role user_role DEFAULT 'client',
  proposed_acc_role acc_role,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  CONSTRAINT platform_access_requests_email_lower_chk CHECK (email = lower(trim(email)))
);

CREATE UNIQUE INDEX platform_access_requests_pending_email_idx
  ON platform_access_requests (lower(email))
  WHERE status = 'pending';

CREATE INDEX platform_access_requests_status_created_idx
  ON platform_access_requests (status, created_at DESC);

CREATE INDEX platform_access_requests_email_idx
  ON platform_access_requests (lower(email));

-- Usuarios existentes conservan acceso; nuevos requieren aprobación explícita
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS platform_access_approved BOOLEAN NOT NULL DEFAULT false;

UPDATE profiles SET platform_access_approved = true;

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS platform_access_request_id UUID
  REFERENCES platform_access_requests(id) ON DELETE SET NULL;

-- RLS
ALTER TABLE platform_access_requests ENABLE ROW LEVEL SECURITY;

-- Inserción pública vía API (service role); lectura propia por email autenticado
CREATE POLICY "Users read own access requests by email"
  ON platform_access_requests FOR SELECT
  USING (
    lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );

CREATE POLICY "Internal read all access requests"
  ON platform_access_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('admin', 'consultant')
    )
  );

CREATE POLICY "Internal update access requests"
  ON platform_access_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('admin', 'consultant')
    )
  );

COMMENT ON TABLE platform_access_requests IS 'Pre-entry access requests; reviewed manually by administrators';
