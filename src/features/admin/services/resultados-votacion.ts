import type { Candidata, VotoFila } from '../types';
import { normalizar } from './etiquetas';

export type ResultadoCandidata = {
  candidata: Candidata;
  /** Cuántas personas la han marcado. */
  votos: number;
  /** Porcentaje de votantes que la han marcado (0 a 100). */
  porcentaje: number;
  /** Quién la ha marcado (como en las encuestas de WhatsApp). */
  personas: string[];
};

export type Resultados = {
  abierta: boolean;
  /** La votación está archivada (cerrada y fuera de la web). */
  archivada: boolean;
  candidatas: Candidata[];
  votantes: string[];
  /** Cada persona que ha votado con todos sus envíos (para borrar votos por error). */
  votosPorPersona: { nombre: string; votoIds: string[] }[];
  ranking: ResultadoCandidata[];
};

const persona = (v: VotoFila) =>
  [v.nombre, v.apellidos]
    .map((t) => t.trim())
    .filter(Boolean)
    .join(' ');

/**
 * Resultados de la votación final de una sesión, como una encuesta de WhatsApp con varias
 * respuestas: cada persona marca las que quiere y gana la más marcada. Si alguien vota más de
 * una vez, cuenta solo su último voto (por nombre y apellidos, sin tildes ni mayúsculas). Los
 * votos antiguos con estrellas (1 a 5) cuentan como marcados.
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
  const envios = new Map<string, { nombre: string; votoIds: Set<string> }>();
  for (const v of votos) {
    const clave = normalizar(persona(v));
    const actual = envios.get(clave) ?? {
      nombre: ultimo.get(clave)?.nombre ?? persona(v),
      votoIds: new Set(),
    };
    actual.votoIds.add(v.voto_id);
    envios.set(clave, actual);
  }
  const validos = new Set([...ultimo.values()].map((u) => u.votoId));
  const cuentan = votos.filter((v) => validos.has(v.voto_id));

  const votantes = [...ultimo.values()]
    .map((u) => u.nombre)
    .sort((a, b) => a.localeCompare(b, 'es'));
  const ranking = candidatas.map((candidata) => {
    const personas = [
      ...new Set(
        cuentan
          .filter((v) => v.candidata_id === candidata.id && Number(v.puntos) >= 1)
          .map((v) => ultimo.get(normalizar(persona(v)))?.nombre ?? persona(v)),
      ),
    ].sort((a, b) => a.localeCompare(b, 'es'));
    return {
      candidata,
      votos: personas.length,
      porcentaje: votantes.length ? Math.round((personas.length / votantes.length) * 100) : 0,
      personas,
    };
  });
  ranking.sort(
    (a, b) => b.votos - a.votos || a.candidata.titulo.localeCompare(b.candidata.titulo, 'es'),
  );

  return {
    abierta: candidatas.some((c) => c.abierta.toLowerCase() === 'si'),
    archivada:
      candidatas.length > 0 &&
      candidatas.every((c) => (c.votacion_archivada ?? '').toLowerCase() === 'si'),
    candidatas,
    votantes,
    votosPorPersona: [...envios.values()]
      .map((e) => ({ nombre: e.nombre, votoIds: [...e.votoIds] }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')),
    ranking,
  };
}
