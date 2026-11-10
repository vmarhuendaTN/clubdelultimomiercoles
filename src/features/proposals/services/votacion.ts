import { consultar, enviar, type Dependencias } from '@/lib/apps-script';
import type { LibroOpcion } from './opciones';
import { MESES } from './periodo';

export type VotacionAbierta = { sesion: string; candidatas: LibroOpcion[] };

export type DatosVoto = {
  nombre: string;
  apellidos: string;
  /** Estrellas (1 a 5) por id de candidata; las que no se puntúan no se envían. */
  puntos: Record<string, number>;
};

/** ¿Hay votación final abierta? Si la hay, sus candidatas. */
export async function cargarVotacion(deps?: Dependencias) {
  const r = await consultar<{ abierta: boolean; sesion?: string; candidatas?: LibroOpcion[] }>(
    'votacion.publica',
    {},
    deps,
  );
  if (!r.ok) return r;
  return {
    ok: true as const,
    votacion: r.abierta && r.sesion ? { sesion: r.sesion, candidatas: r.candidatas ?? [] } : null,
  };
}

export function enviarVoto(datos: DatosVoto, codigo: string, deps?: Dependencias) {
  return enviar<object>('votacion.votar', { datos: { ...datos, codigo } }, deps);
}

/** «2027-01» → «enero de 2027». */
export function textoSesion(sesion: string): string {
  const [anio, mes] = sesion.split('-');
  const nombre = MESES[Number(mes) - 1];
  return nombre ? `${nombre} de ${anio}` : sesion;
}
