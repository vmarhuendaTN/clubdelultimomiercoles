import type { BooksClient } from './client';
import { mapVolume, toCandidate } from './map-volume';
import { authorMatches, titleSimilarity } from './normalize';
import { buildAttempts } from './query-builder';
import { ACEPTADO, DUDOSO, scoreVolume } from './score';
import type { BookQuery, Candidate, EnrichResult, Volume } from './types';

const MAX_CANDIDATOS = 5;

/**
 * Busca la mejor edición de un libro (GOOGLE-BOOKS § 3–6):
 * volumen fijado → intentos de búsqueda → puntuación → ficha completa por id.
 */
export async function findBestVolume(query: BookQuery, client: BooksClient): Promise<EnrichResult> {
  const antes = client.requests;
  const consultas = () => client.requests - antes;

  if (query.googleBooksId) {
    const volume = await client.getVolume(query.googleBooksId);
    return {
      data: volume ? mapVolume(volume) : null,
      puntuacion: volume ? 100 : 0,
      revisar: !volume,
      candidatos: [],
      consultas: consultas(),
    };
  }

  const vistos = new Map<string, { volume: Volume; puntuacion: number }>();
  for (const attempt of buildAttempts(query)) {
    const items = await client.search(attempt);
    for (const volume of items) {
      if (!vistos.has(volume.id))
        vistos.set(volume.id, { volume, puntuacion: scoreVolume(query, volume) });
    }
    const mejor = Math.max(0, ...[...vistos.values()].map((v) => v.puntuacion));
    if (mejor >= ACEPTADO) break;
  }

  const ordenados = [...vistos.values()].sort((a, b) => b.puntuacion - a.puntuacion);
  const candidatos: Candidate[] = ordenados
    .slice(0, MAX_CANDIDATOS)
    .map(({ volume, puntuacion }) => toCandidate(volume, puntuacion));
  const mejor = ordenados[0];

  if (!mejor || mejor.puntuacion < DUDOSO) {
    return {
      data: null,
      puntuacion: mejor?.puntuacion ?? 0,
      revisar: true,
      candidatos,
      consultas: consultas(),
    };
  }

  // La búsqueda solo trae miniaturas: la ficha por id trae los tamaños grandes.
  const completo = (await client.getVolume(mejor.volume.id)) ?? mejor.volume;
  const data = mapVolume(completo);

  // Sin portada o sin sinopsis: tomarlas de otra edición fiable del mismo título y autor.
  const fiables = ordenados
    .filter(
      ({ volume, puntuacion }) =>
        volume.id !== mejor.volume.id &&
        puntuacion >= ACEPTADO &&
        titleSimilarity(query.titulo, volume.volumeInfo.title ?? '') > 0.9 &&
        authorMatches(query.autor, volume.volumeInfo.authors),
    )
    .map(({ volume }) => mapVolume(volume));
  if (!data.portadaUrl) {
    data.portadaUrl =
      mapVolume(mejor.volume).portadaUrl ?? fiables.find((f) => f.portadaUrl)?.portadaUrl;
  }
  if (!data.descripcion.length) {
    data.descripcion = fiables.find((f) => f.descripcion.length)?.descripcion ?? [];
  }

  return {
    data,
    puntuacion: mejor.puntuacion,
    revisar: mejor.puntuacion < ACEPTADO || !data.portadaUrl,
    candidatos,
    consultas: consultas(),
  };
}
