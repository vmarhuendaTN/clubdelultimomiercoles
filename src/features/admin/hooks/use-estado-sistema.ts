'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Resultado } from '@/lib/apps-script';
import { diagnostico, estadoScript, type Diagnostico } from '../services/api';
import { comprobar, type Comprobacion } from '../services/comprobaciones';

/** Comprueba el script, sus claves, Google Libros y la publicación (al entrar y a petición). */
export function useEstadoSistema(sesion: string): {
  comprobaciones: Comprobacion[];
  recargar: () => Promise<void>;
} {
  const [estado, setEstado] = useState<Resultado<{ version?: number }> | null>(null);
  const [diag, setDiag] = useState<Resultado<Diagnostico> | null>(null);

  const recargar = useCallback(async () => {
    setEstado(null);
    setDiag(null);
    const e = await estadoScript();
    setEstado(e);
    if (e.ok) setDiag(await diagnostico(sesion));
  }, [sesion]);

  useEffect(() => {
    void recargar();
  }, [recargar]);

  return { comprobaciones: comprobar({ estado, diagnostico: diag }), recargar };
}
