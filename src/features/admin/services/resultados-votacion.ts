import type { Candidata, VotoFila } from '../types';
import { normalizar } from './etiquetas';

export type ResultadoCandidata = {
  candidata: Candidata;
  votos: number;
  total: number;
  /** Media de 1 a 5 (0 sin votos). */
  media: number;
  /** Cuántos votos de 1, 2, 3, 4 y 5 estrellas. */
  reparto: [number, number, number, number, number];
};

export type Resultados = {
  abierta: boolean;
  candidatas: Candidata[];
  votantes: string[];
  ranking: ResultadoCandidata[];
};

const persona = (v: VotoFila) =>
  [v.nombre, v.apellidos]
    .map((t) => t.trim())
    .filter(Boolean)
    .join(' ');

/**
 * Resultados de la votación final de una sesión. Si alguien vota más de una vez, cuenta solo su
 * último voto (por nombre y apellidos, sin tildes ni mayúsculas).
 */
export function resultadosVotacion(
  candidatasTodas: Candidata[],
  votosTodos: VotoFila[],
  sesion: string,
): Resultados {
  const candidatas = candidatasTodas.filter((c) => c.sesion === sesion);
  const ids = new Set(candidatas.map((c) => c.id));
  const votos = votosTodos.filter((v) => v.sesion === sesion && ids.has(v.candidata_id));

  // Último voto (voto_id) de cada persona.
  const ultimo = new Map<string, { votoId: string; fecha: string; nombre: string }>();
  for (const v of votos) {
    const clave = normalizar(persona(v));
    const previo = ultimo.get(clave);
    if (!previo || v.creado_en > previo.fecha) {
      ultimo.set(clave, { votoId: v.voto_id, fecha: v.creado_en, nombre: persona(v) });
    }
  }
  const validos = new Set([...ultimo.values()].map((u) => u.votoId));
  const cuentan = votos.filter((v) => validos.has(v.voto_id));

  const ranking = candidatas.map((candidata) => {
    const suyos = cuentan
      .filter((v) => v.candidata_id === candidata.id)
      .map((v) => Number(v.puntos))
      .filter((n) => n >= 1 && n <= 5);
    const reparto: ResultadoCandidata['reparto'] = [0, 0, 0, 0, 0];
    for (const n of suyos) reparto[n - 1] = (reparto[n - 1] ?? 0) + 1;
    const total = suyos.reduce((s, n) => s + n, 0);
    return {
      candidata,
      votos: suyos.length,
      total,
      media: suyos.length ? total / suyos.length : 0,
      reparto,
    };
  });
  ranking.sort(
    (a, b) =>
      b.media - a.media ||
      b.total - a.total ||
      a.candidata.titulo.localeCompare(b.candidata.titulo, 'es'),
  );

  return {
    abierta: candidatas.some((c) => c.abierta.toLowerCase() === 'si'),
    candidatas,
    votantes: [...ultimo.values()].map((u) => u.nombre).sort((a, b) => a.localeCompare(b, 'es')),
    ranking,
  };
}
