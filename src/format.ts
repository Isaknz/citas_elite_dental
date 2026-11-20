export const CLINICA = {
  nombre: 'Clínica Dental Sonrisa',
  lema: 'Tu sonrisa, nuestra prioridad',
};

export const fmtFecha = (iso: string) =>
  new Date(iso + (iso.length === 10 ? 'T12:00:00' : '')).toLocaleDateString('es-PE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

export const fmtHora = (iso: string) =>
  new Date(iso).toLocaleTimeString('es-PE', { hour: 'numeric', minute: '2-digit', hour12: true });

export const fmtMoneda = (n: number) => `S/ ${Number(n).toFixed(2)}`;

export const estadoCita: Record<string, { texto: string; clase: string }> = {
  pendiente: { texto: 'Pendiente de confirmar', clase: 'bg-amber-100 text-amber-800' },
  confirmada: { texto: 'Confirmada', clase: 'bg-emerald-100 text-emerald-800' },
  completada: { texto: 'Completada', clase: 'bg-slate-200 text-slate-700' },
  cancelada: { texto: 'Cancelada', clase: 'bg-red-100 text-red-700' },
};
