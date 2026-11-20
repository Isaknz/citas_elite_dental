import { useState } from 'react';
import { supabase } from './supabase';
import { CLINICA } from './format';

const input =
  'w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-200';

export default function Auth({ onListo }: { onListo: () => void }) {
  const [modo, setModo] = useState<'login' | 'registro'>('login');
  const [email, setEmail] = useState('');
  const [clave, setClave] = useState('');
  const [nombres, setNombres] = useState('');
  const [telefono, setTelefono] = useState('');
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setCargando(true);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password: clave });
    setCargando(false);
    if (err) {
      setError('Correo o contraseña incorrectos. Si no tienes cuenta, crea una abajo.');
      return;
    }
    onListo();
  }

  async function registrarse(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setMensaje('');
    if (nombres.trim().length < 3) {
      setError('Escribe tu nombre completo.');
      return;
    }
    if (clave.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    setCargando(true);
    const { data, error: err } = await supabase.auth.signUp({ email, password: clave });
    if (err) {
      setCargando(false);
      if (err.message.includes('already registered')) {
        setError('Ya existe una cuenta con este correo. Inicia sesión.');
      } else {
        setError('No se pudo crear la cuenta. Revisa tus datos e inténtalo de nuevo.');
      }
      return;
    }
    if (data.user) {
      const { error: errPerfil } = await supabase
        .from('profiles')
        .insert({ id: data.user.id, nombres: nombres.trim(), telefono: telefono.trim() || null });
      if (errPerfil) {
        setError('Tu cuenta se creó pero hubo un problema guardando tu nombre. Intenta iniciar sesión.');
        setCargando(false);
        return;
      }
    }
    if (data.session) {
      setCargando(false);
      onListo();
    } else {
      setCargando(false);
      setModo('login');
      setMensaje('Cuenta creada. Ahora inicia sesión con tu correo y contraseña.');
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-teal-900 via-teal-800 to-slate-900 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center text-white">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-4xl">
            🦷
          </div>
          <h1 className="mt-4 text-2xl font-bold">{CLINICA.nombre}</h1>
          <p className="mt-1 text-sm text-teal-200">{CLINICA.lema}</p>
        </div>

        <div className="mt-8 rounded-3xl bg-white p-6 shadow-2xl md:p-8">
          <div className="mb-6 grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1">
            {(['login', 'registro'] as const).map((m) => (
              <button
                key={m}
                onClick={() => {
                  setModo(m);
                  setError('');
                  setMensaje('');
                }}
                className={`rounded-lg py-2 text-sm font-semibold transition ${
                  modo === m ? 'bg-white text-teal-700 shadow' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {m === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
              </button>
            ))}
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
          {mensaje && (
            <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {mensaje}
            </div>
          )}

          <form onSubmit={modo === 'login' ? entrar : registrarse} className="space-y-4">
            {modo === 'registro' && (
              <>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">Nombres y apellidos *</label>
                  <input className={input} value={nombres} onChange={(e) => setNombres(e.target.value)} placeholder="Ej. Ana Lucía Vela" required />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">Teléfono</label>
                  <input className={input} value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="Ej. 987 654 321" inputMode="tel" />
                </div>
              </>
            )}
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">Correo electrónico *</label>
              <input className={input} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tucorreo@ejemplo.com" required />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">Contraseña *</label>
              <input className={input} type="password" value={clave} onChange={(e) => setClave(e.target.value)} placeholder="Mínimo 6 caracteres" required />
            </div>
            <button
              type="submit"
              disabled={cargando}
              className="w-full rounded-xl bg-teal-600 px-4 py-3.5 text-base font-semibold text-white transition hover:bg-teal-700 active:scale-[0.99] disabled:opacity-60"
            >
              {cargando ? 'Un momento...' : modo === 'login' ? 'Entrar a mi portal' : 'Crear mi cuenta'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-teal-200/70">
          En tu portal puedes ver tus citas, tratamientos, pagos pendientes e indicaciones de tu dentista.
        </p>
      </div>
    </div>
  );
}
