import { readFileSync } from 'node:fs';
import path from 'node:path';
import type { InstagramPost } from './types';

/**
 * Publicaciones guardadas por el workflow de Instagram (Fase 5) en src/generated/instagram.json.
 * Si aún no hay, lista vacía: el carrusel invita a seguir la cuenta.
 */
export function getInstagramPosts(): InstagramPost[] {
  try {
    return JSON.parse(
      readFileSync(path.join(process.cwd(), 'src/generated/instagram.json'), 'utf8'),
    ) as InstagramPost[];
  } catch {
    return [];
  }
}
