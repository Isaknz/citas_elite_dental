import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Odontologo {
  id: string;
  nombre: string;
  especialidad: string;
}

export interface Servicio {
  id: string;
  nombre: string;
  duracion_min: number;
  precio: number;
}

export interface Cita {
  id: string;
  paciente_id: string;
  fecha_hora: string;
  estado: string;
  notas: string | null;
  odontologo: Odontologo | null;
  servicio: Servicio | null;
}

export interface Tratamiento {
  id: string;
  descripcion: string;
  pieza: number | null;
  costo: number;
  fecha: string;
}

export interface Pago {
  id: string;
  concepto: string;
  monto: number;
  pagado: boolean;
  fecha: string;
}

export interface Indicacion {
  id: string;
  titulo: string;
  contenido: string;
  fecha: string;
}

export interface PerfilPaciente {
  id: string;
  nombres: string;
  telefono: string | null;
}
