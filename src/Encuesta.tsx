import { useState } from 'react';
import { supabase, META, CARRERAS, SEMESTRES, PREGUNTAS } from './config';

interface DatosAlumno {
  nombres: string;
  estudianteId: string;
  carrera: string;
  bloque: string;
  semestre: string;
}

const campo = 'w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-200';

export default function Encuesta() {
  const [paso, setPaso] = useState(0);
  const [alumno, setAlumno] = useState<DatosAlumno>({ nombres: '', estudianteId: '', carrera: '', bloque: '', semestre: '' });
  const [respuestas, setRespuestas] = useState<Record<number, string>>({});
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [enviada, setEnviada] = useState(false);

  function actualizarAlumno(campo: keyof DatosAlumno, valor: string) {
    setAlumno((a) => ({ ...a, [campo]: valor }));
    setError('');
  }

  function responder(preguntaId: number, valor: string) {
    setRespuestas((r) => ({ ...r, [preguntaId]: valor }));
    setError('');
  }

  const datosCompletos =
    alumno.nombres.trim() !== '' &&
    alumno.estudianteId.trim() !== '' &&
    alumno.carrera !== '' &&
    alumno.semestre !== '';

  async function enviar() {
    if (!datosCompletos) {
      setError('Completa tus datos antes de enviar.');
      setPaso(0);
      return;
    }
    const sinResponder = PREGUNTAS.filter((p) => !respuestas[p.id]);
    if (sinResponder.length > 0) {
      setError(`Faltan ${sinResponder.length} pregunta(s) por responder.`);
      setPaso(sinResponder[0].id);
      return;
    }
    setEnviando(true);
    const { error: err } = await supabase.from('encuestas').insert({
      nombres: alumno.nombres.trim(),
      estudiante_id: alumno.estudianteId.trim(),
      sede: META.sede,
      carrera: alumno.carrera,
      bloque: alumno.bloque.trim() || null,
      semestre: alumno.semestre,
      respuestas,
    });
    setEnviando(false);
    if (err) {
      setError('Ocurrió un error al enviar tu encuesta. Revisa tu conexión e inténtalo de nuevo.');
      return;
    }
    setEnviada(true);
  }

  if (enviada) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-950 via-brand-900 to-slate-900 px-6">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-2xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <svg className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="mt-5 text-2xl font-bold text-slate-900">¡Gracias por tu respuesta!</h1>
          <p className="mt-3 text-slate-600">
            Tu encuesta quedó registrada. Con tu aporte ayudamos a mejorar el aprendizaje en SENATI {META.sede}.
          </p>
        </div>
      </div>
    );
  }

  const progreso = paso === 0 ? 0 : Math.round((respuestasCompletadas() / PREGUNTAS.length) * 100);

  function respuestasCompletadas() {
    return PREGUNTAS.filter((p) => respuestas[p.id]).length;
  }

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-6 md:py-10">
      <div className="mx-auto w-full max-w-2xl">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-700">
            {META.instituto} — Sede {META.sede}
          </p>
          <h1 className="mt-2 text-xl font-bold leading-snug text-slate-900 md:text-2xl">
            {META.titulo}
          </h1>
        </div>

        <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-brand-600 transition-all duration-300"
            style={{ width: `${paso === 0 ? 0 : Math.max(progreso, 4)}%` }}
          />
        </div>

        {error && (
          <div className="mt-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {paso === 0 ? (
          <div className="mt-5 rounded-3xl bg-white p-6 shadow-lg md:p-8">
            <h2 className="text-lg font-bold text-slate-900">Tus datos</h2>
            <p className="mt-1 text-sm text-slate-500">Todos los campos son obligatorios, excepto bloque.</p>
            <div className="mt-6 space-y-5">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Nombres y apellidos *</label>
                <input
                  className={campo}
                  value={alumno.nombres}
                  onChange={(e) => actualizarAlumno('nombres', e.target.value)}
                  placeholder="Ej. María Fernanda Ríos Pérez"
                  autoComplete="name"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">ID de estudiante *</label>
                <input
                  className={campo}
                  value={alumno.estudianteId}
                  onChange={(e) => actualizarAlumno('estudianteId', e.target.value)}
                  placeholder="Ej. 1234567890"
                  inputMode="numeric"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Carrera *</label>
                <select className={campo} value={alumno.carrera} onChange={(e) => actualizarAlumno('carrera', e.target.value)}>
                  <option value="">Selecciona tu carrera</option>
                  {CARRERAS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">Bloque (opcional)</label>
                  <input
                    className={campo}
                    value={alumno.bloque}
                    onChange={(e) => actualizarAlumno('bloque', e.target.value)}
                    placeholder="Ej. B"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">Semestre *</label>
                  <select className={campo} value={alumno.semestre} onChange={(e) => actualizarAlumno('semestre', e.target.value)}>
                    <option value="">Selecciona</option>
                    {SEMESTRES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Sede *</label>
                <input className={`${campo} bg-slate-50 text-slate-500`} value={META.sede} disabled />
              </div>
            </div>
            <button
              onClick={() => {
                if (!datosCompletos) {
                  setError('Completa todos los campos obligatorios (*).');
                  return;
                }
                setPaso(1);
              }}
              className="mt-7 w-full rounded-xl bg-brand-600 px-4 py-3.5 text-base font-semibold text-white transition hover:bg-brand-700 active:scale-[0.99]"
            >
              Comenzar encuesta
            </button>
          </div>
        ) : (
          <div className="mt-5 space-y-4 pb-32">
            {PREGUNTAS.map((p) => (
              <div key={p.id} className="rounded-3xl bg-white p-5 shadow-sm md:p-6">
                <p className="text-sm font-semibold text-brand-700">Pregunta {p.id} de {PREGUNTAS.length}</p>
                <p className="mt-1 text-base font-semibold leading-snug text-slate-900">{p.texto}</p>
                <div className="mt-4 space-y-2">
                  {p.opciones.map((op) => {
                    const seleccionada = respuestas[p.id] === op;
                    return (
                      <button
                        key={op}
                        onClick={() => responder(p.id, op)}
                        className={`w-full rounded-xl border px-4 py-3 text-left text-sm font-medium transition ${
                          seleccionada
                            ? 'border-brand-600 bg-brand-50 text-brand-900'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-brand-300 hover:bg-brand-50/40'
                        }`}
                      >
                        <span className={`mr-2 inline-block h-2.5 w-2.5 rounded-full ${seleccionada ? 'bg-brand-600' : 'bg-slate-300'}`} />
                        {op}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {paso === 1 && (
          <div className="fixed inset-x-0 bottom-0 border-t border-slate-200 bg-white/95 px-4 py-4 backdrop-blur">
            <div className="mx-auto flex w-full max-w-2xl gap-3">
              <button
                onClick={() => setPaso(0)}
                className="rounded-xl border border-slate-300 px-5 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Volver
              </button>
              <button
                onClick={enviar}
                disabled={enviando}
                className="flex-1 rounded-xl bg-emerald-600 px-4 py-3.5 text-base font-semibold text-white transition hover:bg-emerald-700 active:scale-[0.99] disabled:opacity-60"
              >
                {enviando ? 'Enviando...' : `Enviar respuestas (${respuestasCompletadas()}/${PREGUNTAS.length})`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
