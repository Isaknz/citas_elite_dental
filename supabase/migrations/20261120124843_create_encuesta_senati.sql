/*
# Sistema de encuesta SENATI - Uso del celular y redes sociales

1. New Tables
- `encuestas`
  - `id` (uuid, primary key)
  - `nombres` (text, obligatorio): nombres y apellidos del estudiante
  - `estudiante_id` (text, obligatorio): ID del estudiante en SENATI
  - `sede` (text, obligatorio): sede SENATI (fijo: Ucayali-Huanuco)
  - `carrera` (text, obligatorio): carrera que estudia
  - `bloque` (text, opcional): bloque o aula
  - `semestre` (text, obligatorio): semestre actual
  - `respuestas` (jsonb, obligatorio): las 15 respuestas de la encuesta
  - `created_at` (timestamp): fecha y hora de la respuesta
2. Security
- Enable RLS on `encuestas`.
- Grant INSERT and SELECT to anon + authenticated (app without sign-in).
- Policies: anyone can insert a response; anyone can read (needed for the live counter on the projector view).
*/

CREATE TABLE IF NOT EXISTS encuestas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombres text NOT NULL,
  estudiante_id text NOT NULL,
  sede text NOT NULL DEFAULT 'Ucayali-Huanuco',
  carrera text NOT NULL,
  bloque text,
  semestre text NOT NULL,
  respuestas jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE encuestas ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT ON encuestas TO anon, authenticated;

DROP POLICY IF EXISTS "anon_insert_encuestas" ON encuestas;
CREATE POLICY "anon_insert_encuestas" ON encuestas
FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_select_encuestas" ON encuestas;
CREATE POLICY "anon_select_encuestas" ON encuestas
FOR SELECT TO anon, authenticated USING (true);
