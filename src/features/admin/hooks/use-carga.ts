'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { ErrorApi, Resultado } from '@/lib/apps-script';

export type Carga<T> =
  { tipo: 'cargando' } | { tipo: 'error'; error: ErrorApi } | { tipo: 'lista'; datos: T };

/**
 * Carga datos del script al montar y con `recargar()`. Si la sesión ha caducado, avisa
 * con `alCaducar` (el panel vuelve a la pantalla de entrada).
 */
export function useCarga<T>(
  pedir: () => Promise<Resultado<T>>,
  alCaducar: () => void,
): { carga: Carga<T>; recargar: () => Promise<void>; fijar: (datos: T) => void } {
  const [carga, setCarga] = useState<Carga<T>>({ tipo: 'cargando' });
  const pedirRef = useRef(pedir);
  const caducarRef = useRef(alCaducar);
  pedirRef.current = pedir;
  caducarRef.current = alCaducar;

  const recargar = useCallback(async () => {
    setCarga((c) => (c.tipo === 'lista' ? c : { tipo: 'cargando' }));
    const r = await pedirRef.current();
    if (r.ok) {
      setCarga({ tipo: 'lista', datos: r as T });
    } else {
      if (r.error === 'sesion_no_valida') caducarRef.current();
      setCarga({ tipo: 'error', error: r.error });
    }
  }, []);

  useEffect(() => {
    void recargar();
  }, [recargar]);

  const fijar = useCallback((datos: T) => setCarga({ tipo: 'lista', datos }), []);
  return { carga, recargar, fijar };
}
