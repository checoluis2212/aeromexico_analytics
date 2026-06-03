-- RPC para que el admin (vía service role) actualice roles sin chocar con el trigger de protección

CREATE OR REPLACE FUNCTION admin_update_profile_roles(
  p_profile_id uuid,
  p_role user_role,
  p_acc_role acc_role DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE profiles
  SET
    role = p_role,
    acc_role = CASE
      WHEN p_role IN ('client', 'viewer') THEN NULL
      ELSE p_acc_role
    END,
    updated_at = NOW()
  WHERE id = p_profile_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'profile_not_found';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION admin_update_profile_roles(uuid, user_role, acc_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION admin_update_profile_roles(uuid, user_role, acc_role) TO service_role;
