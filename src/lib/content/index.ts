import { readFileSync } from 'node:fs';
import path from 'node:path';
import { MANIFEST_VACIO, type ContenidoManifest } from './types';

export * from './types';

let cache: ContenidoManifest | undefined;

/**
 * Lee el manifiesto generado por `scripts/build-content.ts` (solo en build, Server Components).
 * Si no existe (nadie ha subido nada todavía), devuelve un manifiesto vacío.
 */
export function getContenido(): ContenidoManifest {
  if (cache) return cache;
  try {
    const file = path.join(process.cwd(), 'src/generated/contenido.json');
    cache = JSON.parse(readFileSync(file, 'utf8')) as ContenidoManifest;
  } catch {
    cache = MANIFEST_VACIO;
  }
  return cache;
}
