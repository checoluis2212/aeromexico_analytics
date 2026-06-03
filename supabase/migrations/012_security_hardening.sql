-- Endurecimiento de seguridad: perfiles, comentarios, activity_logs

-- Impedir escalada de privilegios vía UPDATE directo en profiles (cliente Supabase)
CREATE OR REPLACE FUNCTION protect_profile_sensitive_columns()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role
     OR NEW.acc_role IS DISTINCT FROM OLD.acc_role
     OR NEW.email IS DISTINCT FROM OLD.email THEN
    RAISE EXCEPTION 'protected_profile_fields';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_profiles_protect_sensitive ON profiles;
CREATE TRIGGER trg_profiles_protect_sensitive
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION protect_profile_sensitive_columns();

-- Comentarios: solo en pedidos propios (email desde auth.users, no perfil editable)
DROP POLICY IF EXISTS "Authenticated users can comment" ON request_comments;
DROP POLICY IF EXISTS "Comment on accessible requests" ON request_comments;

CREATE POLICY "Comment on accessible requests" ON request_comments
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM requests r
      WHERE r.id = request_id
      AND (
        r.user_id = auth.uid()
        OR r.requester_email = (SELECT email FROM auth.users WHERE id = auth.uid())
        OR is_internal_user()
      )
    )
    AND (NOT is_internal OR is_internal_user())
  );

-- Activity logs: solo equipo interno inserta (evita logs falsos)
DROP POLICY IF EXISTS "acc_activity_insert" ON activity_logs;
CREATE POLICY "acc_activity_insert" ON activity_logs
  FOR INSERT TO authenticated
  WITH CHECK (is_internal_user());
