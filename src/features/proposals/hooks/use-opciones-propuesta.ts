'use client';

import { useEffect, useState } from 'react';
import { cargarOpciones, type OpcionesPropuesta } from '../services/opciones';

export type EstadoOpciones =
  { tipo: 'cargando' } | { tipo: 'listas'; opciones: OpcionesPropuesta } | { tipo: 'sin_opciones' };

/** Carga las recomendadas y el tintero. Si falla, el formulario sigue funcionando sin ellas. */
export function useOpcionesPropuesta(activo: boolean): EstadoOpciones {
  const [estado, setEstado] = useState<EstadoOpciones>({ tipo: 'cargando' });
  useEffect(() => {
    if (!activo) return;
    let vivo = true;
    void cargarOpciones().then((r) => {
      if (!vivo) return;
      setEstado(
        r.ok
          ? {
              tipo: 'listas',
              opciones: {
                recomendadas: r.recomendadas,
                tintero: r.tintero,
                porSesion: r.porSesion ?? {},
              },
            }
          : { tipo: 'sin_opciones' },
      );
    });
    return () => {
      vivo = false;
    };
  }, [activo]);
  return estado;
}
