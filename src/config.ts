import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const META = {
  titulo: 'Uso excesivo del celular y las redes sociales durante las clases y su impacto en el aprendizaje',
  instituto: 'Instituto de Educación Superior Tecnológico Público SENATI',
  sede: 'Ucayali - Huánuco',
  meta: 300,
};

export const CARRERAS = [
  'Administración de Empresas',
  'Contabilidad',
  'Electricidad y Electrónica Industrial',
  'Enfermería Técnica',
  'Farmacia Técnica',
  'Guía Oficial de Turismo',
  'Ingeniería de Sistemas',
  'Mecánica de Producción Industrial',
  'Mecatrónica Industrial',
  'Producción y Gestión Industrial',
  'Procesamiento de Alimentos',
  'Otra',
];

export const SEMESTRES = ['I', 'II', 'III', 'IV', 'V', 'VI'];

export interface Pregunta {
  id: number;
  texto: string;
  opciones: string[];
}

const ESCALA = ['Siempre', 'Casi siempre', 'A veces', 'Casi nunca', 'Nunca'];

export const PREGUNTAS: Pregunta[] = [
  { id: 1, texto: '¿Cuántas horas al día pasas en redes sociales (TikTok, WhatsApp, Instagram, Facebook, etc.)?', opciones: ['Menos de 1 hora', 'De 1 a 3 horas', 'De 3 a 5 horas', 'Más de 5 horas'] },
  { id: 2, texto: '¿Revisas tu celular durante las clases o prácticas?', opciones: ESCALA },
  { id: 3, texto: '¿Cuántas veces revisas tu celular aproximadamente en una hora de clase?', opciones: ['Ninguna vez', 'De 1 a 3 veces', 'De 4 a 6 veces', 'Más de 6 veces'] },
  { id: 4, texto: '¿Para qué revisas principalmente el celular en clase?', opciones: ['Redes sociales', 'Mensajes personales (WhatsApp)', 'Música o videos', 'Juegos', 'Fines académicos (buscar información, apuntar)'] },
  { id: 5, texto: '¿Te distrae el celular aunque no lo estés usando (notificaciones, vibración)?', opciones: ESCALA },
  { id: 6, texto: '¿Usas el celular con fines académicos durante la clase (buscar información, grabar, tomar fotos de la pizarra)?', opciones: ESCALA },
  { id: 7, texto: '¿Se te olvida o pierdes información de la clase por revisar el celular?', opciones: ESCALA },
  { id: 8, texto: '¿Te cuesta concentrarte más de 20 minutos sin revisar tu celular?', opciones: ESCALA },
  { id: 9, texto: '¿Has bajado tus notas o dejado de entregar tareas por el tiempo que dedicas al celular?', opciones: ESCALA },
  { id: 10, texto: '¿Has recibido una llamada de atención de tu profesor o tenido un incidente por usar el celular en talleres o prácticas?', opciones: ESCALA },
  { id: 11, texto: '¿Consideras que tu uso del celular es excesivo?', opciones: ['Sí', 'No', 'No estoy seguro'] },
  { id: 12, texto: '¿Has intentado reducir el tiempo que pasas en el celular? ¿Lo lograste?', opciones: ['Lo intenté y lo logré', 'Lo intenté y no lo logré', 'Nunca lo he intentado'] },
  { id: 13, texto: '¿Aceptarías una normativa del instituto sobre el uso del celular en clases?', opciones: ['Sí, totalmente', 'Sí, con condiciones', 'No'] },
  { id: 14, texto: '¿Qué ayuda necesitarías para controlar mejor tu tiempo frente a la pantalla?', opciones: ['Charlas o talleres sobre uso responsable', 'Normativas del instituto', 'Aplicaciones de control de tiempo', 'Apoyo de mi familia', 'Ninguna, controlo mi tiempo solo'] },
  { id: 15, texto: '¿Crees que tu uso del celular afecta tu aprendizaje?', opciones: ['Sí, mucho', 'Sí, un poco', 'No afecta', 'No estoy seguro'] },
];
