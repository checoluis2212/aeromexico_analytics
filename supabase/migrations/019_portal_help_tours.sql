-- Tours de ayuda por etapa del flujo cliente

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS pedir_hub_tour_completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS mis_pedidos_tour_completed_at TIMESTAMPTZ;

COMMENT ON COLUMN profiles.pedir_hub_tour_completed_at IS
  'Tour de ayuda completado en /pedir (hub de objetivos)';

COMMENT ON COLUMN profiles.mis_pedidos_tour_completed_at IS
  'Tour de ayuda completado en Mis pedidos';
