import type { Candidata, Propuesta, VotoFila } from '../types';
import { resultadosVotacion } from './resultados-votacion';
import { clavePeriodo, etiquetaPeriodo, resumir } from './resumen-propuestas';

/** Una sesión del club (año-mes) con lo esencial para el archivo. */
export type SesionClub = {
  clave: string;
  etiqueta: string;
  anio: string;
  archivada: boolean;
  propuestas: number;
  personas: number;
  libros: number;
  candidatas: number;
  votantes: number;
  votacionAbierta: boolean;
  /** Candidata con mejor media, si hubo votos. */
  ganadora?: { titulo: string; autor: string; votos: number };
};

const si = (v?: string) => (v ?? '').trim().toLowerCase() === 'si';

/**
 * Todas las sesiones que aparecen en propuestas o votación, de la más reciente a la más antigua.
 * Una sesión está archivada si alguna de sus filas lo está (el script las marca todas a la vez).
 */
export function sesionesClub(
  propuestas: Propuesta[],
  candidatas: Candidata[],
  votos: VotoFila[],
): SesionClub[] {
  const claves = new Set<string>();
  for (const p of propuestas) {
    const c = clavePeriodo(p);
    if (c) claves.add(c);
  }
  for (const c of candidatas) if (/^\d{4}-\d{2}$/.test(c.sesion)) claves.add(c.sesion);

  return [...claves]
    .sort()
    .reverse()
    .map((clave) => {
      const suyas = propuestas.filter((p) => clavePeriodo(p) === clave);
      const resumen = resumir(propuestas, clave);
      const votacion = resultadosVotacion(candidatas, votos, clave);
      const primera = votacion.ranking[0];
      return {
        clave,
        etiqueta: etiquetaPeriodo(clave),
        anio: clave.slice(0, 4),
        archivada:
          suyas.some((p) => si(p.archivada)) || votacion.candidatas.some((c) => si(c.archivada)),
        propuestas: suyas.length,
        personas: resumen.personas,
        libros: resumen.libros.length,
        candidatas: votacion.candidatas.length,
        votantes: votacion.votantes.length,
        votacionAbierta: votacion.abierta,
        ganadora:
          primera && primera.votos > 0
            ? {
                titulo: primera.candidata.titulo,
                autor: primera.candidata.autor,
                votos: primera.votos,
              }
            : undefined,
      };
    });
}

/** Agrupa sesiones por año (del más reciente al más antiguo). */
export function porAnio(sesiones: SesionClub[]): { anio: string; sesiones: SesionClub[] }[] {
  const grupos = new Map<string, SesionClub[]>();
  for (const s of sesiones) grupos.set(s.anio, [...(grupos.get(s.anio) ?? []), s]);
  return [...grupos.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([anio, lista]) => ({ anio, sesiones: lista }));
}
