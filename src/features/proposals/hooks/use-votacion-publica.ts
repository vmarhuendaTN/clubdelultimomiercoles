'use client';

import { useEffect, useState } from 'react';
import { cargarVotacion, type VotacionAbierta } from '../services/votacion';

export type EstadoVotacion =
  { tipo: 'cargando' } | { tipo: 'cerrada' } | { tipo: 'abierta'; votacion: VotacionAbierta };

/** ¿Hay votación final abierta? Si no se puede consultar, se comporta como cerrada. */
export function useVotacionPublica(activo: boolean): EstadoVotacion {
  const [estado, setEstado] = useState<EstadoVotacion>({ tipo: 'cargando' });
  useEffect(() => {
    if (!activo) return;
    let vivo = true;
    void cargarVotacion().then((r) => {
      if (!vivo) return;
      setEstado(
        r.ok && r.votacion ? { tipo: 'abierta', votacion: r.votacion } : { tipo: 'cerrada' },
      );
    });
    return () => {
      vivo = false;
    };
  }, [activo]);
  return estado;
}
