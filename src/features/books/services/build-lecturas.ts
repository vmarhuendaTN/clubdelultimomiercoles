import { createHash } from 'node:crypto';
import { separarCitas, type BookData } from '@/lib/books-api';
import type { PortadaManual } from '@/lib/content';
import { slugify } from '@/lib/content/naming';
import type { FilaLectura } from '@/lib/sheets';
import type { Lectura } from '../types';

/** hash_origen (GOOGLE-BOOKS § 7): solo se vuelve a consultar Google si cambia. */
export function hashOrigen(fila: FilaLectura): string {
  return createHash('sha1')
    .update(
      [
        fila.titulo,
        fila.autor,
        fila.isbn,
        fila.google_books_id,
        fila.portada_manual,
        fila.descripcion_manual,
      ].join('\u0000'),
    )
    .digest('hex');
}

/** Lecturas públicas: visibles y ya clasificadas (PLAN § Fase 2, RLS público). */
export function esPublica(fila: FilaLectura): fila is FilaLectura & { estado: Lectura['estado'] } {
  return fila.visible && fila.estado !== 'por_clasificar';
}

/** Slugs únicos: si dos títulos coinciden se añade el apellido del autor. */
export function asignarSlugs(filas: readonly FilaLectura[]): string[] {
  const usados = new Map<string, number>();
  return filas.map((f) => {
    let slug = slugify(f.titulo) || 'libro';
    if (usados.has(slug)) slug = `${slug}-${slugify(f.autor.split(' ').at(-1) ?? '')}`;
    const n = usados.get(slug) ?? 0;
    usados.set(slug, n + 1);
    return n ? `${slug}-${n + 1}` : slug;
  });
}

const parrafos = (texto: string) =>
  texto
    .split(/\n\s*\n|\r?\n/)
    .map((p) => p.trim())
    .filter(Boolean);

const ORDEN_ESTADO: Record<Lectura['estado'], number> = { proximo: 0, leido: 1, propuesta: 2 };

type Entrada = {
  filas: readonly FilaLectura[];
  /** Ficha de Google por hash_origen (null si no se encontró o aún no se ha consultado). */
  fichas: (hash: string) => BookData | null | undefined;
  portadas: readonly PortadaManual[];
};

/**
 * Combina la Sheet, las fichas de Google y las portadas subidas.
 * Prioridad (CLAUDE.md § Principios): lo manual siempre gana a lo automático.
 */
export function buildLecturas({ filas, fichas, portadas }: Entrada): Lectura[] {
  const publicas = filas.filter(esPublica);
  const slugs = asignarSlugs(publicas);
  const portadaSubida = new Map(portadas.map((p) => [p.slug, p]));

  const lecturas = publicas.map((fila, i): Lectura => {
    const slug = slugs[i]!;
    const g = fichas(hashOrigen(fila)) ?? undefined;
    const subida = portadaSubida.get(slug);
    const texto = fila.descripcion_manual
      ? { sinopsis: parrafos(fila.descripcion_manual), citas: [] }
      : separarCitas(g?.descripcion ?? []);
    return {
      slug,
      titulo: fila.titulo,
      autor: fila.autor,
      estado: fila.estado,
      orden: fila.orden,
      fechaSesion: fila.fecha_sesion,
      notaClub: fila.nota_club,
      anio: g?.anio,
      paginas: g?.paginas,
      subtitulo: g?.subtitulo,
      editorial: g?.editorial,
      isbn: fila.isbn ?? g?.isbn,
      categorias: g?.categorias ?? [],
      idioma: g?.idioma && g.idioma !== 'es' ? g.idioma : undefined,
      descripcion: texto.sinopsis,
      citas: texto.citas,
      idiomaEdicion: g?.idioma,
      enlaceGoogle: g?.enlaceGoogle,
      fuenteGoogle: Boolean(g),
      portadaUrl: subida?.url ?? fila.portada_manual ?? g?.portadaUrl,
      portadaLqip: subida?.lqip,
      colorDominante: subida?.colorDominante,
    };
  });

  // Próximo primero; luego leídos del más reciente al más antiguo; luego propuestas.
  return lecturas.sort(
    (a, b) =>
      ORDEN_ESTADO[a.estado] - ORDEN_ESTADO[b.estado] ||
      (b.fechaSesion ?? '').localeCompare(a.fechaSesion ?? '') ||
      (b.orden ?? 0) - (a.orden ?? 0),
  );
}
