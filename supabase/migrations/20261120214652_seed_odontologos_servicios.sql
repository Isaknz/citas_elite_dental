/*
# Datos iniciales: odontólogos y servicios

1. Tables modified
- `odontologos`: se insertan 3 dentistas de ejemplo (nombres marcadores de posición; la clínica los cambia después).
- `servicios`: se insertan tratamientos dentales comunes con duración y precio de referencia.

2. Security
- Sin cambios.
*/

INSERT INTO odontologos (nombre, especialidad) VALUES
  ('Dra. María Torres', 'Odontología General'),
  ('Dr. Jorge Salas', 'Ortodoncia'),
  ('Dra. Lucía Ramos', 'Endodoncia');

INSERT INTO servicios (nombre, duracion_min, precio) VALUES
  ('Consulta y evaluación', 30, 40.00),
  ('Limpieza dental', 45, 80.00),
  ('Empaste / restauración', 60, 120.00),
  ('Extracción simple', 45, 100.00),
  ('Tratamiento de conducto', 90, 350.00),
  ('Blanqueamiento', 60, 250.00);
