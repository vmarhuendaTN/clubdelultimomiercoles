'use client';

import { useEffect, useState } from 'react';
import { listarEnlaces, type Enlace } from '../services/api';

/** Accesos directos de la pestaña Enlaces (vacío si no hay o el script es antiguo). */
export function useEnlaces(sesion: string): Enlace[] {
  const [enlaces, setEnlaces] = useState<Enlace[]>([]);
  useEffect(() => {
    let vivo = true;
    void listarEnlaces(sesion).then((r) => {
      if (vivo && r.ok) setEnlaces(r.enlaces);
    });
    return () => {
      vivo = false;
    };
  }, [sesion]);
  return enlaces;
}
