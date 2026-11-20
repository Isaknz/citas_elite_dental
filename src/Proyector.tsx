import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { supabase, META } from './config';

function urlEncuesta() {
  return `${window.location.origin}${window.location.pathname}#/encuesta`;
}

export default function Proyector() {
  const [total, setTotal] = useState<number | null>(null);

  useEffect(() => {
    async function cargar() {
      const { count, error } = await supabase
        .from('encuestas')
        .select('id', { count: 'exact', head: true });
      if (!error && count !== null) setTotal(count);
    }
    cargar();
    const canal = supabase
      .channel('encuestas-proyector')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'encuestas' },
        () => setTotal((t) => (t === null ? t : t + 1))
      )
      .subscribe();
    return () => {
      supabase.removeChannel(canal);
    };
  }, []);

  const porcentaje = total === null ? 0 : Math.min(100, (total / META.meta) * 100);
  const faltan = Math.max(0, META.meta - (total ?? 0));

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-950 via-brand-900 to-slate-900 px-6 py-10 text-white">
      <div className="mx-auto flex min-h-[80vh] max-w-6xl flex-col items-center justify-center text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-300 md:text-base">
          {META.instituto} — Sede {META.sede}
        </p>

        <h1 className="mt-6 max-w-5xl text-3xl font-bold leading-snug md:text-5xl md:leading-tight">
          Encuesta: {META.titulo}
        </h1>

        <p className="mt-6 text-lg text-brand-100 md:text-2xl">
          Escanea el código QR con tu celular y responde la encuesta
        </p>

        <div className="mt-8 rounded-3xl bg-white p-6 shadow-2xl md:p-8">
          <QRCodeSVG value={urlEncuesta()} size={220} level="M" />
        </div>

        <div className="mt-10 w-full max-w-2xl">
          <div className="flex items-end justify-between text-left">
            <div>
              <span className="text-5xl font-extrabold tabular-nums md:text-7xl">
                {total ?? '—'}
              </span>
              <span className="ml-2 text-xl font-semibold text-brand-300 md:text-3xl">
                / {META.meta} encuestas
              </span>
            </div>
            <p className="text-sm text-brand-200 md:text-base">
              {total === null ? '' : faltan === 0 ? '¡Meta alcanzada!' : `Faltan ${faltan}`}
            </p>
          </div>
          <div className="mt-4 h-5 w-full overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-300 transition-all duration-700"
              style={{ width: `${porcentaje}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
