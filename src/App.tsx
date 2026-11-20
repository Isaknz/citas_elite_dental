import { useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from './supabase';
import Auth from './Auth';
import Portal from './Portal';
import Panel from './Panel';

function usarRutaHash() {
  const [hash, setHash] = useState(window.location.hash);
  useEffect(() => {
    const onHash = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  return hash;
}

export default function App() {
  const hash = usarRutaHash();
  const [sesion, setSesion] = useState<Session | null>(null);
  const [listo, setListo] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSesion(data.session);
      setListo(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setSesion(session);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function salir() {
    await supabase.auth.signOut();
    setSesion(null);
  }

  if (!listo) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-400">Cargando...</div>;
  }

  if (hash.startsWith('#/panel')) {
    return <Panel />;
  }

  if (sesion) {
    return <Portal onSalir={salir} />;
  }

  return <Auth onListo={() => {}} />;
}
