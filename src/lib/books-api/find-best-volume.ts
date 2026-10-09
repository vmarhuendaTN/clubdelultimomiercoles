import type { BooksClient } from './client';
import { pickCoverUrl } from './cover';
import { mapVolume, toCandidate } from './map-volume';
import { authorMatches, titleSimilarity } from './normalize';
import { buildAttempts } from './query-builder';
import { ACEPTADO, DUDOSO, scoreVolume } from './score';
import type { BookQuery, Candidate, EnrichResult, ImageLinks, Volume } from './types';

const MAX_CANDIDATOS = 5;
/** Ediciones alternativas que se piden por id buscando una portada grande. */
const MAX_EDICIONES_PORTADA = 3;

/** ¿Hay algo mejor que la miniatura (~128 px)? Los tamaños grandes solo llegan por id. */
function tienePortadaGrande(links: ImageLinks | undefined): boolean {
  return Boolean(links?.small || links?.medium || links?.large || links?.extraLarge);
}

/** Misma obra en español: título casi idéntico y mismo autor. */
function esMismaObra(query: BookQuery, volume: Volume): boolean {
  const info = volume.volumeInfo;
  return (
    info.language === 'es' &&
    titleSimilarity(query.titulo, info.title ?? '') > 0.9 &&
    authorMatches(query.autor, info.authors)
  );
}

/**
 * Portada grande de otra edición de la misma obra (p. ej. el ebook de la editorial, que
 * suele traer todos los tamaños, cuando la edición en papel solo tiene miniatura).
 * Usa los candidatos ya vistos o, si no hay, busca por título y autor.
 */
async function portadaDeOtraEdicion(
  query: BookQuery,
  client: BooksClient,
  excluir: string,
  vistos: readonly Volume[] = [],
): Promise<string | undefined> {
  let candidatos = vistos.filter((v) => v.id !== excluir && esMismaObra(query, v));
  if (!candidatos.length) {
    for (const attempt of buildAttempts({ titulo: query.titulo, autor: query.autor })) {
      candidatos = (await client.search(attempt)).filter(
        (v) => v.id !== excluir && esMismaObra(query, v),
      );
      if (candidatos.length) break;
    }
  }
  for (const candidato of candidatos.slice(0, MAX_EDICIONES_PORTADA)) {
    const completo = await client.getVolume(candidato.id);
    const links = completo?.volumeInfo?.imageLinks;
    if (tienePortadaGrande(links)) return pickCoverUrl(links);
  }
  return undefined;
}

/**
 * Busca la mejor edición de un libro (GOOGLE-BOOKS § 3–6):
 * volumen fijado → intentos de búsqueda → puntuación → ficha completa por id.
 */
export async function findBestVolume(query: BookQuery, client: BooksClient): Promise<EnrichResult> {
  const antes = client.requests;
  const consultas = () => client.requests - antes;

  if (query.googleBooksId) {
    const volume = await client.getVolume(query.googleBooksId);
    const data = volume ? mapVolume(volume) : null;
    // La edición fijada manda en los datos; la portada puede venir de otra edición si es mejor.
    if (volume && data && !tienePortadaGrande(volume.volumeInfo.imageLinks)) {
      data.portadaUrl = (await portadaDeOtraEdicion(query, client, volume.id)) ?? data.portadaUrl;
    }
    return {
      data,
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
  if (!tienePortadaGrande(completo.volumeInfo?.imageLinks)) {
    data.portadaUrl =
      (await portadaDeOtraEdicion(
        query,
        client,
        completo.id,
        ordenados.map((o) => o.volume),
      )) ??
      data.portadaUrl ??
      mapVolume(mejor.volume).portadaUrl ??
      fiables.find((f) => f.portadaUrl)?.portadaUrl;
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
