'use client';

import { useCallback, useEffect, useState } from 'react';
import type { ErrorApi } from '@/lib/apps-script';
import { borrarPreferencia, guardarPreferencia, leerPreferencia } from '@/lib/dom/preferencias';
import { entrar, quienSoy, salir as salirApi } from '../services/api';
import type { Persona } from '../types';

/** Sesión del Equipo en este navegador (token de Apps Script, 6 h). */
const CLAVE = 'club:sesion-equipo';

type Guardada = { sesion: string; caduca: number; persona: Persona };

export type EstadoSesion =
  | { tipo: 'cargando' }
  | { tipo: 'fuera'; error?: ErrorApi }
  | { tipo: 'comprobando' }
  | { tipo: 'dentro'; sesion: string; persona: Persona };

function leerGuardada(): Guardada | null {
  const texto = leerPreferencia(CLAVE);
  if (!texto) return null;
  try {
    const g = JSON.parse(texto) as Guardada;
    return g.sesion && g.caduca > Date.now() ? g : null;
  } catch {
    return null;
  }
}

export function useSesionEquipo() {
  const [estado, setEstado] = useState<EstadoSesion>({ tipo: 'cargando' });

  // Al abrir el panel, se recupera la sesión guardada y se confirma con el script (rol al día).
  useEffect(() => {
    const guardada = leerGuardada();
    if (!guardada) {
      setEstado({ tipo: 'fuera' });
      return;
    }
    setEstado({ tipo: 'dentro', sesion: guardada.sesion, persona: guardada.persona });
    void quienSoy(guardada.sesion).then((r) => {
      if (r.ok) {
        const persona = { email: r.email, nombre: r.nombre, rol: r.rol };
        guardarPreferencia(CLAVE, JSON.stringify({ ...guardada, persona }));
        setEstado({ tipo: 'dentro', sesion: guardada.sesion, persona });
      } else if (r.error === 'sesion_no_valida') {
        borrarPreferencia(CLAVE);
        setEstado({ tipo: 'fuera', error: 'sesion_no_valida' });
      }
      // Sin conexión: se sigue con la sesión guardada; cada llamada vuelve a comprobarla.
    });
  }, []);

  const entrarConGoogle = useCallback(async (idToken: string) => {
    setEstado({ tipo: 'comprobando' });
    const r = await entrar(idToken);
    if (!r.ok) {
      setEstado({ tipo: 'fuera', error: r.error });
      return;
    }
    const persona: Persona = { email: r.email, nombre: r.nombre, rol: r.rol };
    guardarPreferencia(CLAVE, JSON.stringify({ sesion: r.sesion, caduca: r.caduca, persona }));
    setEstado({ tipo: 'dentro', sesion: r.sesion, persona });
  }, []);

  const salir = useCallback((error?: ErrorApi) => {
    const guardada = leerGuardada();
    if (guardada && !error) void salirApi(guardada.sesion);
    borrarPreferencia(CLAVE);
    setEstado({ tipo: 'fuera', error });
  }, []);

  return { estado, entrarConGoogle, salir };
}
