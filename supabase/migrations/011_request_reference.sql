-- Referencia legible para pedidos (ej. PED-2026-0042)

CREATE SEQUENCE IF NOT EXISTS request_reference_seq START 1;

ALTER TABLE requests ADD COLUMN IF NOT EXISTS reference_code TEXT;

DO $$
DECLARE
  r RECORD;
  n INT := 0;
  yr TEXT := to_char(NOW(), 'YYYY');
BEGIN
  FOR r IN SELECT id FROM requests WHERE reference_code IS NULL ORDER BY created_at LOOP
    n := n + 1;
    UPDATE requests
    SET reference_code = 'PED-' || yr || '-' || LPAD(n::text, 4, '0')
    WHERE id = r.id;
  END LOOP;
  IF n > 0 THEN
    PERFORM setval('request_reference_seq', n);
  END IF;
END $$;

CREATE OR REPLACE FUNCTION generate_request_reference_code()
RETURNS TRIGGER AS $$
DECLARE
  seq_num BIGINT;
  yr TEXT;
BEGIN
  IF NEW.reference_code IS NOT NULL AND NEW.reference_code <> '' THEN
    RETURN NEW;
  END IF;
  yr := to_char(NOW(), 'YYYY');
  seq_num := nextval('request_reference_seq');
  NEW.reference_code := 'PED-' || yr || '-' || LPAD(seq_num::text, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_requests_reference_code ON requests;
CREATE TRIGGER trg_requests_reference_code
  BEFORE INSERT ON requests
  FOR EACH ROW EXECUTE FUNCTION generate_request_reference_code();

ALTER TABLE requests ALTER COLUMN reference_code SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_requests_reference_code ON requests(reference_code);

-- Solo usuarios autenticados pueden insertar (la API usa service role; esto protege acceso directo)
DROP POLICY IF EXISTS "Anyone can submit requests" ON requests;
CREATE POLICY "Authenticated users submit requests" ON requests
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
