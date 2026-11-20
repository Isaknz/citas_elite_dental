import { useEffect, useState } from 'react';
import { supabase, Cita, PerfilPaciente } from './supabase';
import { fmtFecha, fmtHora, estadoCita } from './format';

interface Fila extends Cita {
  paciente: PerfilPaciente | null;
}

const input =
  'w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-200';

export default function Panel() {
  const [filas, setFilas] = useState<Fila[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [formTrat, setFormTrat] = useState({ paciente: '', descripcion: '', pieza: '', costo: '' });
  const [formPago, setFormPago] = useState({ paciente: '', concepto: '', monto: '' });
  const [formInd, setFormInd] = useState({ paciente: '', titulo: '', contenido: '' });
  const [aviso, setAviso] = useState('');

  useEffect(() => {
    async function cargar() {
      const { data, error: err } = await supabase
        .from('citas')
        .select('*, paciente:profiles(id, nombres, telefono), odontologo:odontologos(id, nombre, especialidad), servicio:servicios(id, nombre, duracion_min, precio)')
        .order('fecha_hora', { ascending: false });
      if (err) {
        setError('No se pudo cargar la agenda. Verifica que tu cuenta sea del personal de la clínica.');
      }
      if (data) setFilas(data as unknown as Fila[]);
      setCargando(false);
    }
    cargar();
  }, []);

  async function actualizarEstado(id: string, estado: string) {
    await supabase.from('citas').update({ estado }).eq('id', id);
    setFilas((fs) => fs.map((f) => (f.id === id ? { ...f, estado } : f)));
  }

  async function guardarTratamiento(e: React.FormEvent) {
    e.preventDefault();
    setAviso('');
    const { error: err } = await supabase.from('tratamientos').insert({
      paciente_id: formTrat.paciente,
      descripcion: formTrat.descripcion.trim(),
      pieza: formTrat.pieza ? Number(formTrat.pieza) : null,
      costo: formTrat.costo ? Number(formTrat.costo) : 0,
    });
    if (err) {
      setAviso('Error al registrar el tratamiento.');
      return;
    }
    setFormTrat({ paciente: '', descripcion: '', pieza: '', costo: '' });
    setAviso('Tratamiento registrado en el portal del paciente.');
  }

  async function guardarPago(e: React.FormEvent) {
    e.preventDefault();
    setAviso('');
    const { error: err } = await supabase.from('pagos').insert({
      paciente_id: formPago.paciente,
      concepto: formPago.concepto.trim(),
      monto: Number(formPago.monto || 0),
    });
    if (err) {
      setAviso('Error al registrar el pago.');
      return;
    }
    setFormPago({ paciente: '', concepto: '', monto: '' });
    setAviso('Pago registrado. El paciente lo verá en su portal.');
  }

  async function guardarIndicacion(e: React.FormEvent) {
    e.preventDefault();
    setAviso('');
    const { error: err } = await supabase.from('indicaciones').insert({
      paciente_id: formInd.paciente,
      titulo: formInd.titulo.trim(),
      contenido: formInd.contenido.trim(),
    });
    if (err) {
      setAviso('Error al registrar la indicación.');
      return;
    }
    setFormInd({ paciente: '', titulo: '', contenido: '' });
    setAviso('Indicación enviada al portal del paciente.');
  }

  const pacientes = filas
    .map((f) => f.paciente)
    .filter((p, i, arr) => p && arr.findIndex((x) => x?.id === p.id) === i);

  const seccion = 'rounded-3xl bg-white p-5 shadow-sm md:p-6';
  const etiqueta = 'mb-1 block text-xs font-semibold text-slate-600';

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-slate-900 text-white">
        <div className="mx-auto max-w-5xl px-4 py-4 md:px-6">
          <h1 className="text-lg font-bold">Panel de la clínica</h1>
          <p className="text-xs text-slate-400">Agenda, tratamientos, pagos e indicaciones de los pacientes</p>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-4 pb-16 pt-5 md:px-6">
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}
        {aviso && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{aviso}</div>
        )}

        <section className={seccion}>
          <h2 className="text-base font-bold text-slate-900">Agenda de citas</h2>
          {cargando ? (
            <p className="py-8 text-center text-sm text-slate-400">Cargando...</p>
          ) : filas.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">Aún no hay citas.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {filas.map((f) => {
                const e = estadoCita[f.estado] ?? { texto: f.estado, clase: 'bg-slate-100 text-slate-600' };
                return (
                  <div key={f.id} className="rounded-2xl border border-slate-200 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-slate-900">{f.paciente?.nombres ?? 'Paciente'}</p>
                        <p className="text-sm text-slate-600">
                          {f.servicio?.nombre ?? 'Consulta'} · {f.odontologo?.nombre ?? 'Sin dentista'}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-teal-700">
                          {fmtFecha(f.fecha_hora)} · {fmtHora(f.fecha_hora)}
                        </p>
                        {f.paciente?.telefono && (
                          <p className="text-xs text-slate-500">Tel: {f.paciente.telefono}</p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${e.clase}`}>{e.texto}</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => actualizarEstado(f.id, 'confirmada')}
                            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                          >
                            Confirmar
                          </button>
                          <button
                            onClick={() => actualizarEstado(f.id, 'completada')}
                            className="rounded-lg bg-slate-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
                          >
                            Completar
                          </button>
                          <button
                            onClick={() => actualizarEstado(f.id, 'cancelada')}
                            className="rounded-lg bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-200"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <div className="grid gap-6 md:grid-cols-3">
          <form onSubmit={guardarTratamiento} className={seccion}>
            <h2 className="text-sm font-bold text-slate-900">Registrar tratamiento</h2>
            <div className="mt-3 space-y-3">
              <select required className={input} value={formTrat.paciente} onChange={(e) => setFormTrat({ ...formTrat, paciente: e.target.value })}>
                <option value="">Paciente *</option>
                {pacientes.map((p) => p && <option key={p.id} value={p.id}>{p.nombres}</option>)}
              </select>
              <input required className={input} value={formTrat.descripcion} onChange={(e) => setFormTrat({ ...formTrat, descripcion: e.target.value })} placeholder="Descripción *" />
              <div className="grid grid-cols-2 gap-2">
                <input className={input} value={formTrat.pieza} onChange={(e) => setFormTrat({ ...formTrat, pieza: e.target.value })} placeholder="Pieza dental" inputMode="numeric" />
                <input className={input} value={formTrat.costo} onChange={(e) => setFormTrat({ ...formTrat, costo: e.target.value })} placeholder="Costo S/" inputMode="decimal" />
              </div>
              <button className="w-full rounded-xl bg-teal-600 py-2.5 text-sm font-semibold text-white hover:bg-teal-700">Guardar</button>
            </div>
          </form>

          <form onSubmit={guardarPago} className={seccion}>
            <h2 className="text-sm font-bold text-slate-900">Registrar pago</h2>
            <div className="mt-3 space-y-3">
              <select required className={input} value={formPago.paciente} onChange={(e) => setFormPago({ ...formPago, paciente: e.target.value })}>
                <option value="">Paciente *</option>
                {pacientes.map((p) => p && <option key={p.id} value={p.id}>{p.nombres}</option>)}
              </select>
              <input required className={input} value={formPago.concepto} onChange={(e) => setFormPago({ ...formPago, concepto: e.target.value })} placeholder="Concepto *" />
              <input required className={input} value={formPago.monto} onChange={(e) => setFormPago({ ...formPago, monto: e.target.value })} placeholder="Monto S/ *" inputMode="decimal" />
              <button className="w-full rounded-xl bg-teal-600 py-2.5 text-sm font-semibold text-white hover:bg-teal-700">Guardar</button>
            </div>
          </form>

          <form onSubmit={guardarIndicacion} className={seccion}>
            <h2 className="text-sm font-bold text-slate-900">Enviar indicación</h2>
            <div className="mt-3 space-y-3">
              <select required className={input} value={formInd.paciente} onChange={(e) => setFormInd({ ...formInd, paciente: e.target.value })}>
                <option value="">Paciente *</option>
                {pacientes.map((p) => p && <option key={p.id} value={p.id}>{p.nombres}</option>)}
              </select>
              <input required className={input} value={formInd.titulo} onChange={(e) => setFormInd({ ...formInd, titulo: e.target.value })} placeholder="Título *" />
              <textarea required className={input} rows={3} value={formInd.contenido} onChange={(e) => setFormInd({ ...formInd, contenido: e.target.value })} placeholder="Indicaciones *" />
              <button className="w-full rounded-xl bg-teal-600 py-2.5 text-sm font-semibold text-white hover:bg-teal-700">Enviar</button>
            </div>
          </form>
        </div>

        <section className={seccion}>
          <h2 className="text-base font-bold text-slate-900">Pacientes registrados</h2>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {pacientes.length === 0 ? (
              <p className="text-sm text-slate-400">Aún no hay pacientes con cuenta creada.</p>
            ) : (
              pacientes.map((p) => p && (
                <div key={p.id} className="rounded-xl border border-slate-200 px-4 py-3">
                  <p className="text-sm font-semibold text-slate-800">{p.nombres}</p>
                  <p className="text-xs text-slate-500">{p.telefono ?? 'Sin teléfono'}</p>
                </div>
              ))
            )}
          </div>
        </section>

        <p className="text-center text-xs text-slate-400">
          Los pacientes acceden desde la pantalla principal de la app. El personal accede añadiendo <strong>#/panel</strong> a la dirección.
        </p>
      </main>
    </div>
  );
}
