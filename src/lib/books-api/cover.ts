import type { ImageLinks } from './types';

const ORDEN: (keyof ImageLinks)[] = [
  'extraLarge',
  'large',
  'medium',
  'small',
  'thumbnail',
  'smallThumbnail',
];

/** Limpia la URL de portada: https y sin el borde doblado (`edge=curl`). */
export function cleanCoverUrl(url: string): string {
  const u = new URL(url.replace(/^http:\/\//, 'https://'));
  u.searchParams.delete('edge');
  return u.toString();
}

/** Mayor tamaño disponible (GOOGLE-BOOKS § 6). */
export function pickCoverUrl(links: ImageLinks | undefined): string | undefined {
  if (!links) return undefined;
  const url = ORDEN.map((k) => links[k]).find(Boolean);
  return url ? cleanCoverUrl(url) : undefined;
}
