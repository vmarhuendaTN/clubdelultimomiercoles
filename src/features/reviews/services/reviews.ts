import { getSupabase, type Supabase } from '@/lib/supabase';
import type { Resumen, Valoracion } from '../types';

const COLUMNAS = 'id, book_slug, estrellas, opinion, autor_nombre, creado_en, actualizado_en';

type Fila = {
  id: string;
  book_slug: string;
  estrellas: number;
  opinion: string | null;
  autor_nombre: string;
  creado_en: string;
  actualizado_en: string;
};

const aValoracion = (f: Fila): Valoracion => ({
  id: f.id,
  bookSlug: f.book_slug,
  estrellas: f.estrellas,
  opinion: f.opinion,
  autorNombre: f.autor_nombre,
  creadoEn: f.creado_en,
  actualizadoEn: f.actualizado_en,
});

function cliente(): Supabase {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Las valoraciones no están disponibles en este momento.');
  return supabase;
}

/** Valoraciones de un libro, de la más reciente a la más antigua. */
export async function listarValoraciones(slug: string): Promise<Valoracion[]> {
  const { data, error } = await cliente()
    .from('valoraciones')
    .select(COLUMNAS)
    .eq('book_slug', slug)
    .order('actualizado_en', { ascending: false });
  if (error) throw new Error('No se pudieron cargar las valoraciones.');
  return data.map(aValoracion);
}

/** La valoración de la persona con sesión (si ya valoró este libro). */
export async function miValoracion(slug: string, userId: string): Promise<Valoracion | null> {
  const { data, error } = await cliente()
    .from('valoraciones')
    .select(COLUMNAS)
    .eq('book_slug', slug)
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw new Error('No se pudo cargar tu valoración.');
  return data ? aValoracion(data) : null;
}

/** Media y número de valoraciones de todos los libros. */
export async function resumenes(): Promise<Map<string, Resumen>> {
  const { data, error } = await cliente()
    .from('valoraciones_resumen')
    .select('book_slug, media, total');
  if (error) throw new Error('No se pudieron cargar las valoraciones.');
  return new Map(
    data
      .filter((r) => r.book_slug && r.total)
      .map((r) => [r.book_slug!, { media: Number(r.media), total: r.total! }]),
  );
}

/** Crea o actualiza la valoración propia (autor y nombre los fija la base de datos). */
export async function guardarValoracion(
  slug: string,
  estrellas: number,
  opinion: string,
): Promise<void> {
  const { error } = await cliente()
    .from('valoraciones')
    .upsert({ book_slug: slug, estrellas, opinion }, { onConflict: 'book_slug,user_id' });
  if (error) throw new Error('No se pudo guardar tu valoración. Inténtalo de nuevo.');
}

export async function borrarValoracion(slug: string, userId: string): Promise<void> {
  const { error } = await cliente()
    .from('valoraciones')
    .delete()
    .eq('book_slug', slug)
    .eq('user_id', userId);
  if (error) throw new Error('No se pudo borrar tu valoración.');
}
