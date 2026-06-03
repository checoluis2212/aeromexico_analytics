-- Tour de bienvenida en Pregúntale (independiente del tour del home)

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS preguntale_tour_completed_at TIMESTAMPTZ;

COMMENT ON COLUMN profiles.preguntale_tour_completed_at IS
  'Cuándo el usuario completó o saltó el tour contextual de Pregúntale';
