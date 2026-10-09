/**
 * Optimiza y valida los recursos estáticos según docs/ASSETS.md.
 *
 *   pnpm assets          optimiza (SVGO, quita EXIF, recomprime) y valida
 *   pnpm assets:check    solo valida; sale con error si algo no cumple (CI)
 */
import { readdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { optimize } from 'svgo';

const ROOT = path.resolve(import.meta.dirname, '..');
const CHECK = process.argv.includes('--check');
const DIRS = ['src/assets/images', 'public/brand', 'public/images', 'public/documents'];
const IGNORE = new Set(['README.md', 'index.ts', '.gitkeep']);

const KB = 1024;

/** Excepciones justificadas al peso objetivo. Mantener corta y con motivo. */
const EXCEPCIONES: Record<string, { maxKB: number; motivo: string }> = {
  'src/assets/images/brand/logo-completo.svg': {
    maxKB: 100,
    motivo: 'trazo a mano vectorizado (ASSETS § 8)',
  },
  'src/assets/images/brand/logo-completo-oscuro.svg': {
    maxKB: 100,
    motivo: 'trazo a mano vectorizado',
  },
  'src/assets/images/brand/logo-sillon.svg': { maxKB: 100, motivo: 'trazo a mano vectorizado' },
  'public/brand/logo/logo.svg': { maxKB: 100, motivo: 'copia de logo-completo para terceros' },
};

const NOMBRE = /^[a-z0-9]+(?:-[a-z0-9]+)*(?:@2x)?\.(?:svg|webp|jpg|png|ico|pdf)$/;
const GENERICO = /^(?:imagen|image|img|foto|photo|final|untitled|captura|screenshot)[-\d]*\./;

type Regla = { maxKB?: number; formatos: string[] };

/** Peso máximo y formatos por carpeta (ASSETS § 4). */
function reglaPara(rel: string): Regla {
  if (rel.startsWith('src/assets/images/backgrounds/')) return { maxKB: 40, formatos: ['.webp'] };
  if (rel.startsWith('src/assets/images/photos/')) return { maxKB: 400, formatos: ['.jpg'] };
  if (rel.startsWith('src/assets/images/illustrations/'))
    return { maxKB: 120, formatos: ['.svg', '.webp'] };
  if (rel.startsWith('src/assets/images/brand/')) return { maxKB: 15, formatos: ['.svg'] };
  if (rel.startsWith('public/brand/og/')) return { maxKB: 200, formatos: ['.jpg'] };
  if (rel.startsWith('public/brand/')) return { formatos: ['.svg', '.png', '.ico', '.jpg'] };
  if (rel.startsWith('public/images/')) return { maxKB: 15, formatos: ['.svg'] };
  if (rel.startsWith('public/documents/')) return { formatos: ['.pdf'] };
  return { formatos: [] };
}

async function* walk(dir: string): AsyncGenerator<string> {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (!IGNORE.has(entry.name)) yield full;
  }
}

async function optimizar(file: string, ext: string): Promise<void> {
  if (ext === '.svg') {
    const src = await readFile(file, 'utf8');
    const out = optimize(src, {
      path: file,
      multipass: true,
      plugins: ['preset-default', 'removeDimensions'],
    }).data;
    if (out.length < src.length) await writeFile(file, out);
  } else if (ext === '.jpg') {
    // Recomprime a calidad 82 sin metadatos (EXIF/GPS)
    const out = await sharp(file).rotate().jpeg({ quality: 82, mozjpeg: true }).toBuffer();
    await writeFile(file, out);
  } else if (ext === '.webp') {
    const meta = await sharp(file).metadata();
    if (meta.exif || meta.xmp)
      await writeFile(file, await sharp(file).webp({ quality: 82 }).toBuffer());
  }
}

async function validar(file: string, rel: string, ext: string): Promise<string[]> {
  const errores: string[] = [];
  const name = path.basename(file);
  if (!NOMBRE.test(name)) errores.push('nombre: minúsculas, sin tildes, palabras con guiones');
  if (GENERICO.test(name)) errores.push('nombre genérico no permitido');

  const regla = reglaPara(rel);
  if (!regla.formatos.includes(ext)) errores.push(`formato ${ext} no permitido aquí`);

  const kb = (await stat(file)).size / KB;
  const max = EXCEPCIONES[rel]?.maxKB ?? regla.maxKB;
  if (max !== undefined && kb > max) errores.push(`pesa ${kb.toFixed(1)} KB (máximo ${max} KB)`);

  if (ext === '.svg') {
    const svg = await readFile(file, 'utf8');
    const root = /<svg\b[^>]*>/.exec(svg)?.[0] ?? '';
    if (!/\sviewBox=/.test(root)) errores.push('SVG sin viewBox');
    if (/\s(width|height)=/.test(root)) errores.push('SVG con width/height fijos');
  }
  if (ext === '.jpg' || ext === '.webp') {
    const meta = await sharp(file).metadata();
    if (meta.exif) errores.push('contiene metadatos EXIF');
    const lado = Math.max(meta.width ?? 0, meta.height ?? 0);
    if (rel.includes('/photos/') && lado > 2400) errores.push(`lado largo ${lado}px (máximo 2400)`);
  }
  if (rel === 'public/brand/og/og-default.jpg') {
    const { width, height } = await sharp(file).metadata();
    if (width !== 1200 || height !== 630) errores.push('og-image debe medir 1200 × 630');
  }
  return errores;
}

async function main() {
  let fallos = 0;
  let total = 0;
  for (const dir of DIRS) {
    for await (const file of walk(path.join(ROOT, dir))) {
      const rel = path.relative(ROOT, file).split(path.sep).join('/');
      const ext = path.extname(file).toLowerCase();
      total++;
      if (!CHECK) await optimizar(file, ext);
      const errores = await validar(file, rel, ext);
      if (errores.length) {
        fallos++;
        console.error(`✗ ${rel}\n  - ${errores.join('\n  - ')}`);
      }
    }
  }
  console.log(`${total} recursos revisados, ${fallos} con problemas.`);
  if (fallos) process.exit(1);
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
