import type { Book } from '@/features/books';

/** Paleta documentada (valores de src/styles/tokens.css) para la tabla claro/oscuro. */
export const paleta = [
  { token: 'mostaza', uso: 'Color principal, botones', claro: '#F2B84B', oscuro: '#F2B84B' },
  { token: 'naranja', uso: 'Hover y acentos', claro: '#E8892B', oscuro: '#E8892B' },
  {
    token: 'granate',
    uso: 'Enlaces, etiquetas, pestaña activa',
    claro: '#8E2B26',
    oscuro: '#E07A72',
  },
  { token: 'fondo', uso: 'Fondo (papel)', claro: '#FBF7EF', oscuro: '#141210' },
  { token: 'superficie', uso: 'Tarjetas y hojas', claro: '#FFFFFF', oscuro: '#1E1B18' },
  { token: 'superficie-2', uso: 'Controles y pie', claro: '#F4EEE3', oscuro: '#2A2622' },
  { token: 'texto', uso: 'Texto', claro: '#1C1A17', oscuro: '#F5EFE4' },
  { token: 'texto-2', uso: 'Texto secundario', claro: '#6B645A', oscuro: '#B9B0A2' },
  { token: 'texto-3', uso: 'Texto terciario', claro: '#6F685E', oscuro: '#A39A8D' },
  { token: 'exito', uso: 'Estado correcto', claro: '#2F7D4F', oscuro: '#6FCF97' },
  { token: 'error', uso: 'Errores', claro: '#B3261E', oscuro: '#F2948C' },
] as const;

export type TokenColor = (typeof paleta)[number]['token'];

export const escalaTipografica = [
  { token: 'display', muestra: 'Club del Último Miércoles', fuente: 'Caveat 700 · 44 → 72 px' },
  { token: 'large-title', muestra: 'Lecturas', fuente: 'Caveat 700 · 36 → 52 px' },
  { token: 'title-1', muestra: 'Próxima sesión', fuente: 'Inter 700 · 26 → 32 px' },
  { token: 'title-2', muestra: 'Lo último que hemos leído', fuente: 'Inter 600 · 21 → 24 px' },
  { token: 'headline', muestra: 'La maldición de Hill House', fuente: 'Inter 600 · 17 px' },
  {
    token: 'body',
    muestra: 'Nos reunimos el último miércoles del mes a las 19:30.',
    fuente: 'Inter 400 · 17 px',
  },
  {
    token: 'callout',
    muestra: 'Trae el libro leído y ganas de hablar.',
    fuente: 'Inter 400 · 16 px',
  },
  { token: 'subhead', muestra: 'Shirley Jackson · 1959', fuente: 'Inter 400 · 15 px' },
  { token: 'footnote', muestra: 'Datos de libros: Google Libros', fuente: 'Inter 400 · 13 px' },
  { token: 'caption', muestra: 'LEÍDO', fuente: 'Inter 500 · 12 px' },
] as const;

export type TokenTexto = (typeof escalaTipografica)[number]['token'];

/** Libros de ejemplo del club (sin portada: muestran el placeholder ilustrado). */
export const librosEjemplo: Book[] = [
  { slug: 'no-todo-el-mundo', titulo: 'No todo el mundo', autor: 'Marta Jiménez Serrano' },
  { slug: 'los-astronautas', titulo: 'Los astronautas', autor: 'Laura Ferrero' },
  { slug: 'nunca-me-abandones', titulo: 'Nunca me abandones', autor: 'Kazuo Ishiguro' },
  { slug: 'soy-leyenda', titulo: 'Soy leyenda', autor: 'Richard Matheson' },
  { slug: 'lecciones-de-quimica', titulo: 'Lecciones de química', autor: 'Bonnie Garmus' },
  { slug: 'amarilla', titulo: 'Amarilla', autor: 'R. F. Kuang' },
  {
    slug: 'historia-de-dos-ciudades',
    titulo: 'Historia de dos ciudades',
    autor: 'Charles Dickens',
  },
  { slug: 'plegarias-atendidas', titulo: 'Plegarias atendidas', autor: 'Truman Capote' },
];

/** Clase CSS en camelCase para un token: ('c', 'superficie-2') → 'cSuperficie2'. */
export function claseDe(prefijo: 'c' | 't', token: string): string {
  return (
    prefijo + token.replace(/(^|-)([a-z0-9])/g, (_, _sep: string, ch: string) => ch.toUpperCase())
  );
}
