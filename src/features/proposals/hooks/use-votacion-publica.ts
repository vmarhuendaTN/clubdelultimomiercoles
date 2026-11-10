'use client';

import { useEffect, useState } from 'react';
import { cargarVotacion, type VotacionAbierta } from '../services/votacion';

/** Votación final abierta (o null). Si no se puede consultar, se comporta como cerrada. */
export function useVotacionPublica(activo: boolean): VotacionAbierta | null {
  const [votacion, setVotacion] = useState<VotacionAbierta | null>(null);
  useEffect(() => {
    if (!activo) return;
    let vivo = true;
    void cargarVotacion().then((r) => {
      if (vivo && r.ok) setVotacion(r.votacion);
    });
    return () => {
      vivo = false;
    };
  }, [activo]);
  return votacion;
}
