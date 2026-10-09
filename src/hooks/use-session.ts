'use client';

import type { Session } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { getSupabase } from '@/lib/supabase';

/** Sesión actual de Supabase. Al volver del login de Google limpia el `?code=` de la URL. */
export function useSession(): { session: Session | null; cargando: boolean } {
  const [session, setSession] = useState<Session | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      setCargando(false);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setCargando(false);
    });
    const { data } = supabase.auth.onAuthStateChange((evento, nueva) => {
      setSession(nueva);
      if (evento === 'SIGNED_IN') {
        const url = new URL(window.location.href);
        if (url.searchParams.has('code')) {
          url.searchParams.delete('code');
          window.history.replaceState(null, '', url.toString());
        }
      }
    });
    return () => data.subscription.unsubscribe();
  }, []);

  return { session, cargando };
}
