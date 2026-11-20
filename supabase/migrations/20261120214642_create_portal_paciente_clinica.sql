/*
# Portal del paciente para clínica dental

1. New Tables
- `profiles`: perfil del paciente. `id` = cuenta del usuario, `nombres`, `telefono`, `created_at`.
- `staff`: cuentas del personal de la clínica (recepción/dentistas). `user_id` referencia la cuenta, `nombre` y `cargo`.
- `odontologos`: dentistas de la clínica. `nombre`, `especialidad`, `activo`.
- `servicios`: tratamientos que ofrece la clínica. `nombre`, `duracion_min`, `precio`.
- `citas`: citas de los pacientes. `paciente_id` (dueño), `odontologo_id`, `servicio_id`, `fecha_hora`, `estado` (pendiente/confirmada/completada/cancelada), `notas`.
- `tratamientos`: historia clínica. `paciente_id`, `descripcion`, `pieza` (número de diente, opcional), `costo`, `fecha`.
- `pagos`: cobros al paciente. `paciente_id`, `concepto`, `monto`, `pagado`, `fecha`.
- `indicaciones`: indicaciones del dentista. `paciente_id`, `titulo`, `contenido`, `fecha`.

2. Modified Tables
- Ninguna (esquema nuevo).

3. Security
- RLS habilitado en todas las tablas.
- El paciente ve y edita SOLO sus propios datos (auth.uid() = paciente_id).
- El personal (filas en `staff`) puede ver todos los pacientes y sus datos, confirmar/cancelar citas y registrar tratamientos, pagos e indicaciones.
- `odontologos` y `servicios` son catálogos de solo lectura para la app; se llenan por migración.
- Grants de SELECT/INSERT/UPDATE solo para authenticated, según lo que la app usa.

4. Notes
- Se insertan odontólogos y servicios de ejemplo en migración aparte (los nombres son marcadores de posición para que la clínica los cambie).
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT auth.uid(),
  nombres text NOT NULL,
  telefono text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS staff (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre text NOT NULL,
  cargo text NOT NULL DEFAULT 'recepcion'
);

CREATE TABLE IF NOT EXISTS odontologos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  especialidad text NOT NULL,
  activo boolean NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS servicios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  duracion_min integer NOT NULL DEFAULT 30,
  precio numeric(10,2) NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS citas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  odontologo_id uuid REFERENCES odontologos(id) ON DELETE SET NULL,
  servicio_id uuid REFERENCES servicios(id) ON DELETE SET NULL,
  fecha_hora timestamptz NOT NULL,
  estado text NOT NULL DEFAULT 'pendiente',
  notas text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tratamientos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  descripcion text NOT NULL,
  pieza integer,
  costo numeric(10,2) NOT NULL DEFAULT 0,
  fecha date NOT NULL DEFAULT current_date,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pagos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  concepto text NOT NULL,
  monto numeric(10,2) NOT NULL DEFAULT 0,
  pagado boolean NOT NULL DEFAULT false,
  fecha date NOT NULL DEFAULT current_date,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS indicaciones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  paciente_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  titulo text NOT NULL,
  contenido text NOT NULL,
  fecha date NOT NULL DEFAULT current_date,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE odontologos ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicios ENABLE ROW LEVEL SECURITY;
ALTER TABLE citas ENABLE ROW LEVEL SECURITY;
ALTER TABLE tratamientos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos ENABLE ROW LEVEL SECURITY;
ALTER TABLE indicaciones ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON staff, odontologos, servicios TO authenticated;
GRANT SELECT, INSERT, UPDATE ON profiles, citas TO authenticated;
GRANT SELECT, INSERT ON tratamientos, pagos, indicaciones TO authenticated;

DROP POLICY IF EXISTS "perfil_ver_propio" ON profiles;
CREATE POLICY "perfil_ver_propio" ON profiles FOR SELECT
TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "perfil_ver_staff" ON profiles;
CREATE POLICY "perfil_ver_staff" ON profiles FOR SELECT
TO authenticated USING (EXISTS (SELECT 1 FROM staff WHERE staff.user_id = auth.uid()));

DROP POLICY IF EXISTS "perfil_crear_propio" ON profiles;
CREATE POLICY "perfil_crear_propio" ON profiles FOR INSERT
TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "perfil_editar_propio" ON profiles;
CREATE POLICY "perfil_editar_propio" ON profiles FOR UPDATE
TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "staff_ver_propio" ON staff;
CREATE POLICY "staff_ver_propio" ON staff FOR SELECT
TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "catalogo_ver" ON odontologos;
CREATE POLICY "catalogo_ver" ON odontologos FOR SELECT
TO authenticated USING (true);

DROP POLICY IF EXISTS "servicios_ver" ON servicios;
CREATE POLICY "servicios_ver" ON servicios FOR SELECT
TO authenticated USING (true);

DROP POLICY IF EXISTS "citas_ver_propias_o_staff" ON citas;
CREATE POLICY "citas_ver_propias_o_staff" ON citas FOR SELECT
TO authenticated USING (
  auth.uid() = paciente_id
  OR EXISTS (SELECT 1 FROM staff WHERE staff.user_id = auth.uid())
);

DROP POLICY IF EXISTS "citas_crear_propias" ON citas;
CREATE POLICY "citas_crear_propias" ON citas FOR INSERT
TO authenticated WITH CHECK (auth.uid() = paciente_id);

DROP POLICY IF EXISTS "citas_actualizar_propias_o_staff" ON citas;
CREATE POLICY "citas_actualizar_propias_o_staff" ON citas FOR UPDATE
TO authenticated
USING (
  auth.uid() = paciente_id
  OR EXISTS (SELECT 1 FROM staff WHERE staff.user_id = auth.uid())
)
WITH CHECK (
  auth.uid() = paciente_id
  OR EXISTS (SELECT 1 FROM staff WHERE staff.user_id = auth.uid())
);

DROP POLICY IF EXISTS "historial_ver_propio_o_staff" ON tratamientos;
CREATE POLICY "historial_ver_propio_o_staff" ON tratamientos FOR SELECT
TO authenticated USING (
  auth.uid() = paciente_id
  OR EXISTS (SELECT 1 FROM staff WHERE staff.user_id = auth.uid())
);

DROP POLICY IF EXISTS "historial_registra_staff" ON tratamientos;
CREATE POLICY "historial_registra_staff" ON tratamientos FOR INSERT
TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM staff WHERE staff.user_id = auth.uid()));

DROP POLICY IF EXISTS "pagos_ver_propio_o_staff" ON pagos;
CREATE POLICY "pagos_ver_propio_o_staff" ON pagos FOR SELECT
TO authenticated USING (
  auth.uid() = paciente_id
  OR EXISTS (SELECT 1 FROM staff WHERE staff.user_id = auth.uid())
);

DROP POLICY IF EXISTS "pagos_registra_staff" ON pagos;
CREATE POLICY "pagos_registra_staff" ON pagos FOR INSERT
TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM staff WHERE staff.user_id = auth.uid()));

DROP POLICY IF EXISTS "indicaciones_ver_propio_o_staff" ON indicaciones;
CREATE POLICY "indicaciones_ver_propio_o_staff" ON indicaciones FOR SELECT
TO authenticated USING (
  auth.uid() = paciente_id
  OR EXISTS (SELECT 1 FROM staff WHERE staff.user_id = auth.uid())
);

DROP POLICY IF EXISTS "indicaciones_registra_staff" ON indicaciones;
CREATE POLICY "indicaciones_registra_staff" ON indicaciones FOR INSERT
TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM staff WHERE staff.user_id = auth.uid()));
