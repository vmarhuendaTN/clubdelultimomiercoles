import { consultar, enviar, type Dependencias } from '@/lib/apps-script';
import type { LibroOpcion } from './opciones';
import { MESES } from '@/lib/format';

export type VotacionAbierta = {
  sesion: string;
  candidatas: LibroOpcion[];
  /** Notas del club para la sesión. */
  nota?: string;
};

export type DatosVoto = {
  nombre: string;
  apellidos: string;
  /** Candidatas elegidas (1 por id), como en una encuesta de WhatsApp con varias respuestas. */
  puntos: Record<string, number>;
  /** Si eligió su nombre de la lista del club. */
  inscrita_id?: string;
};

/** ¿Hay votación final abierta? Si la hay, sus candidatas. */
export async function cargarVotacion(deps?: Dependencias) {
  const r = await consultar<{
    abierta: boolean;
    sesion?: string;
    candidatas?: LibroOpcion[];
    nota?: string;
  }>('votacion.publica', {}, deps);
  if (!r.ok) return r;
  return {
    ok: true as const,
    votacion:
      r.abierta && r.sesion
        ? { sesion: r.sesion, candidatas: r.candidatas ?? [], nota: r.nota ?? '' }
        : null,
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
