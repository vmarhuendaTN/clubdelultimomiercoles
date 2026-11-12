'use client';

import { useEffect, useState } from 'react';
import { cargarPersonas, type PersonaClub } from '../services/personas';

export type EstadoPersonas =
  | { tipo: 'cargando' }
  | { tipo: 'lista'; personas: PersonaClub[] }
  /** Sin lista (script antiguo, error o nadie inscrito): se escribe el nombre a mano. */
  | { tipo: 'sin_lista' };

/** Personas del club para «¿Quién eres?» (con el código ya comprobado). */
export function usePersonasClub(codigo: string | null): EstadoPersonas {
  const [estado, setEstado] = useState<EstadoPersonas>({ tipo: 'cargando' });
  useEffect(() => {
    if (!codigo) return;
    let vivo = true;
    void cargarPersonas(codigo).then((r) => {
      if (!vivo) return;
      setEstado(
        r.ok && r.personas.length > 0
          ? { tipo: 'lista', personas: r.personas }
          : { tipo: 'sin_lista' },
      );
    });
    return () => {
      vivo = false;
    };
  }, [codigo]);
  return estado;
}
