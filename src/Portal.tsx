import { useEffect, useState } from 'react';
import { supabase, Cita, Tratamiento, Pago, Indicacion, PerfilPaciente } from './supabase';
import { CLINICA, fmtFecha, fmtHora, fmtMoneda, estadoCita } from './format';

type Pestana = 'citas' | 'historial' | 'pagos' | 'indicaciones';

function Badge({ estado }: { estado: string }) {
  const e = estadoCita[estado] ?? { texto: estado, clase: 'bg-slate-100 text-slate-600' };
  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${e.clase}`}>{e.texto}</span>;
}

export default function Portal({ onSalir }: { onSalir: () => void }) {
  const [pestana, setPestana] = useState<Pestana>('citas');
  const [perfil, setPerfil] = useState<PerfilPaciente | null>(null);
  const [citas, setCitas] = useState<Cita[]>([]);
  const [tratamientos, setTratamientos] = useState<Tratamiento[]>([]);
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [indicaciones, setIndicaciones] = useState<Indicacion[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargar() {
      const [{ data: sesion }, { data: perfilData }] = await Promise.all([
        supabase.auth.getSession(),
        supabase.from('profiles').select('id, nombres, telefono').maybeSingle(),
      ]);
      const uid = sesion.session?.user.id;
      if (perfilData) setPerfil(perfilData);
      if (!uid) {
        setCargando(false);
        return;
      }
      const [citasRes, tratRes, pagosRes, indRes] = await Promise.all([
        supabase
          .from('citas')
          .select('*, odontologo:odontologos(id, nombre, especialidad), servicio:servicios(id, nombre, duracion_min, precio)')
          .eq('paciente_id', uid)
          .order('fecha_hora', { ascending: false }),
        supabase.from('tratamientos').select('*').eq('paciente_id', uid).order('fecha', { ascending: false }),
        supabase.from('pagos').select('*').eq('paciente_id', uid).order('fecha', { ascending: false }),
        supabase.from('indicaciones').select('*').eq('paciente_id', uid).order('fecha', { ascending: false }),
      ]);
      if (citasRes.data) setCitas(citasRes.data as unknown as Cita[]);
      if (tratRes.data) setTratamientos(tratRes.data);
      if (pagosRes.data) setPagos(pagosRes.data);
      if (indRes.data) setIndicaciones(indRes.data);
      setCargando(false);
    }
    cargar();
  }, []);

  async function cancelarCita(id: string) {
    await supabase.from('citas').update({ estado: 'cancelada' }).eq('id', id);
    setCitas((cs) => cs.map((c) => (c.id === id ? { ...c, estado: 'cancelada' } : c)));
  }

  const proximas = citas
    .filter((c) => new Date(c.fecha_hora) >= new Date() && c.estado !== 'cancelada' && c.estado !== 'completada')
    .sort((a, b) => +new Date(a.fecha_hora) - +new Date(b.fecha_hora));
  const pasadas = citas
    .filter((c) => !proximas.some((p) => p.id === c.id));
  const deuda = pagos.filter((p) => !p.pagado).reduce((s, p) => s + Number(p.monto), 0);

  const pestanas: { id: Pestana; texto: string }[] = [
    { id: 'citas', texto: 'Mis citas' },
    { id: 'historial', texto: 'Tratamientos' },
    { id: 'pagos', texto: 'Pagos' },
    { id: 'indicaciones', texto: 'Indicaciones' },
  ];

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-gradient-to-r from-teal-800 to-teal-700 text-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 md:px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-xl">🦷</span>
            <div>
              <p className="text-sm font-bold">{CLINICA.nombre}</p>
              <p className="text-xs text-teal-200">Hola, {perfil?.nombres ?? 'paciente'}</p>
            </div>
          </div>
          <button
            onClick={onSalir}
            className="rounded-lg border border-white/30 px-3 py-1.5 text-xs font-semibold transition hover:bg-white/10"
          >
            Salir
          </button>
        </div>
      </header>

      {deuda > 0 && (
        <div className="mx-auto mt-4 max-w-4xl px-4 md:px-6">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
            Tienes pagos pendientes por {fmtMoneda(deuda)}. Revisa la pestaña "Pagos".
          </div>
        </div>
      )}

      <nav className="mx-auto mt-4 max-w-4xl px-4 md:px-6">
        <div className="grid grid-cols-4 gap-1 rounded-2xl bg-white p-1 shadow-sm">
          {pestanas.map((p) => (
            <button
              key={p.id}
              onClick={() => setPestana(p.id)}
              className={`rounded-xl px-2 py-2.5 text-xs font-semibold transition sm:text-sm ${
                pestana === p.id ? 'bg-teal-600 text-white shadow' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {p.texto}
            </button>
          ))}
        </div>
      </nav>

      <main className="mx-auto max-w-4xl px-4 pb-16 pt-5 md:px-6">
        {cargando ? (
          <p className="py-16 text-center text-slate-400">Cargando tu información...</p>
        ) : (
          <>
            {pestana === 'citas' && (
              <div className="space-y-6">
                <section>
                  <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">Próximas citas</h2>
                  {proximas.length === 0 ? (
                    <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
                      <p className="text-slate-500">No tienes citas próximas. Pide una cita en recepción o por teléfono.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {proximas.map((c) => (
                        <div key={c.id} className="rounded-2xl bg-white p-5 shadow-sm">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-bold text-slate-900">{c.servicio?.nombre ?? 'Consulta'}</p>
                              <p className="mt-0.5 text-sm text-slate-600">
                                {c.odontologo?.nombre ?? 'Dentista por asignar'} · {c.odontologo?.especialidad}
                              </p>
                              <p className="mt-2 text-sm font-semibold text-teal-700">
                                {fmtFecha(c.fecha_hora)} · {fmtHora(c.fecha_hora)}
                              </p>
                            </div>
                            <Badge estado={c.estado} />
                          </div>
                          <button
                            onClick={() => cancelarCita(c.id)}
                            className="mt-4 text-xs font-semibold text-red-600 hover:text-red-700"
                          >
                            Cancelar esta cita
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
                {pasadas.length > 0 && (
                  <section>
                    <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">Historial de citas</h2>
                    <div className="space-y-2">
                      {pasadas.map((c) => (
                        <div key={c.id} className="flex items-center justify-between gap-3 rounded-xl bg-white px-4 py-3 shadow-sm">
                          <div>
                            <p className="text-sm font-semibold text-slate-800">{c.servicio?.nombre ?? 'Consulta'}</p>
                            <p className="text-xs text-slate-500">
                              {fmtFecha(c.fecha_hora)} · {c.odontologo?.nombre ?? '—'}
                            </p>
                          </div>
                          <Badge estado={c.estado} />
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}

            {pestana === 'historial' && (
              <div>
                {tratamientos.length === 0 ? (
                  <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
                    <p className="text-slate-500">Aún no tienes tratamientos registrados.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {tratamientos.map((t) => (
                      <div key={t.id} className="rounded-2xl bg-white p-5 shadow-sm">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-bold text-slate-900">{t.descripcion}</p>
                            <p className="mt-1 text-sm text-slate-600">
                              {fmtFecha(t.fecha)}
                              {t.pieza ? ` · Pieza dental ${t.pieza}` : ''}
                            </p>
                          </div>
                          <span className="text-sm font-bold text-teal-700">{fmtMoneda(Number(t.costo))}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {pestana === 'pagos' && (
              <div>
                <div className="mb-4 rounded-2xl bg-white p-5 shadow-sm">
                  <p className="text-sm text-slate-500">Saldo pendiente</p>
                  <p className={`text-3xl font-extrabold ${deuda > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                    {fmtMoneda(deuda)}
                  </p>
                </div>
                {pagos.length === 0 ? (
                  <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
                    <p className="text-slate-500">No tienes pagos registrados.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {pagos.map((p) => (
                      <div key={p.id} className="flex items-center justify-between gap-3 rounded-xl bg-white px-4 py-3 shadow-sm">
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{p.concepto}</p>
                          <p className="text-xs text-slate-500">{fmtFecha(p.fecha)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-slate-900">{fmtMoneda(Number(p.monto))}</p>
                          {p.pagado ? (
                            <span className="text-xs font-semibold text-emerald-600">Pagado</span>
                          ) : (
                            <span className="text-xs font-semibold text-amber-600">Pendiente</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {pestana === 'indicaciones' && (
              <div>
                {indicaciones.length === 0 ? (
                  <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
                    <p className="text-slate-500">
                      Tu dentista no te ha dejado indicaciones. Después de tu consulta aparecerán aquí.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {indicaciones.map((i) => (
                      <div key={i.id} className="rounded-2xl bg-white p-5 shadow-sm">
                        <p className="font-bold text-slate-900">{i.titulo}</p>
                        <p className="mt-1 text-xs text-slate-500">{fmtFecha(i.fecha)}</p>
                        <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-700">{i.contenido}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
