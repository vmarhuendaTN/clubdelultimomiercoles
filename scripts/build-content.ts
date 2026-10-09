/**
 * Procesa el contenido subido por GitHub a content/ y genera:
 *   public/generated/…            archivos optimizados que publica la web
 *   src/generated/contenido.json  manifiesto que leen las páginas en el build
 *
 * Se ejecuta antes de `dev` y `build`. Nunca rompe la publicación por un nombre
 * mal puesto: lo normaliza y avisa. Ver content/README.md.
 */
import { mkdir, readdir, rm, stat, writeFile, copyFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { FECHA_SESION, slugify, tituloDesdeNombre } from '../src/lib/content/naming';
import type {
  ContenidoManifest,
  Documento,
  PortadaManual,
  SesionFotos,
} from '../src/lib/content/types';

const ROOT = path.resolve(import.meta.dirname, '..');
const CONTENT = path.join(ROOT, 'content');
const OUT_PUBLIC = path.join(ROOT, 'public/generated');
const OUT_MANIFEST = path.join(ROOT, 'src/generated/contenido.json');

const MB = 1024 * 1024;
const MAX_PDF = 20 * MB;
const MAX_IMAGEN = 25 * MB;
const IMAGEN = new Set(['.jpg', '.jpeg', '.png', '.webp']);

const avisos: string[] = [];
const avisar = (msg: string) => avisos.push(msg);

async function listar(dir: string): Promise<string[]> {
  try {
    return (await readdir(dir)).filter((f) => !f.startsWith('.') && f !== 'README.md').sort();
  } catch {
    return [];
  }
}

async function documentos(): Promise<Documento[]> {
  const dir = path.join(CONTENT, 'documentos');
  const out: Documento[] = [];
  for (const file of await listar(dir)) {
    const ext = path.extname(file).toLowerCase();
    const base = path.basename(file, path.extname(file));
    const src = path.join(dir, file);
    if (ext !== '.pdf') {
      avisar(`documentos/${file}: solo se publican PDF; se ignora.`);
      continue;
    }
    const { size } = await stat(src);
    if (size > MAX_PDF) {
      avisar(`documentos/${file}: pesa ${(size / MB).toFixed(1)} MB (máximo 20 MB); se ignora.`);
      continue;
    }
    const nombre = `${slugify(base)}.pdf`;
    if (nombre !== file) avisar(`documentos/${file}: se publica como ${nombre}.`);
    await copyFile(src, path.join(OUT_PUBLIC, 'documentos', nombre));
    out.push({
      titulo: tituloDesdeNombre(base),
      url: `/generated/documentos/${nombre}`,
      bytes: size,
    });
  }
  return out.sort((a, b) => a.titulo.localeCompare(b.titulo, 'es'));
}

async function imagenValida(src: string, rel: string): Promise<boolean> {
  if (!IMAGEN.has(path.extname(src).toLowerCase())) {
    avisar(`${rel}: formato no admitido (usa JPG, PNG o WebP); se ignora.`);
    return false;
  }
  const { size } = await stat(src);
  if (size > MAX_IMAGEN) {
    avisar(`${rel}: pesa ${(size / MB).toFixed(1)} MB (máximo 25 MB); se ignora.`);
    return false;
  }
  return true;
}

async function fotos(): Promise<SesionFotos[]> {
  const dir = path.join(CONTENT, 'fotos');
  const out: SesionFotos[] = [];
  for (const fecha of await listar(dir)) {
    const carpeta = path.join(dir, fecha);
    if (!(await stat(carpeta)).isDirectory()) {
      avisar(`fotos/${fecha}: las fotos van dentro de una carpeta con la fecha (AAAA-MM-DD).`);
      continue;
    }
    if (!FECHA_SESION.test(fecha)) {
      avisar(`fotos/${fecha}/: el nombre de la carpeta debe ser la fecha AAAA-MM-DD; se ignora.`);
      continue;
    }
    const destino = path.join(OUT_PUBLIC, 'fotos', fecha);
    await mkdir(destino, { recursive: true });
    const sesion: SesionFotos = { fecha, fotos: [] };
    let n = 0;
    for (const file of await listar(carpeta)) {
      const src = path.join(carpeta, file);
      if (!(await imagenValida(src, `fotos/${fecha}/${file}`))) continue;
      n++;
      const nn = String(n).padStart(2, '0');
      // rotate() aplica la orientación EXIF; al no pedir withMetadata, se eliminan EXIF y GPS.
      const base = sharp(src).rotate();
      const grande = await base
        .clone()
        .resize(1600, 1600, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(path.join(destino, `${nn}.webp`));
      await base
        .clone()
        .resize(600, 600, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 75 })
        .toFile(path.join(destino, `${nn}-mini.webp`));
      sesion.fotos.push({
        url: `/generated/fotos/${fecha}/${nn}.webp`,
        miniatura: `/generated/fotos/${fecha}/${nn}-mini.webp`,
        ancho: grande.width,
        alto: grande.height,
      });
    }
    if (sesion.fotos.length) out.push(sesion);
  }
  return out.sort((a, b) => b.fecha.localeCompare(a.fecha));
}

async function portadas(): Promise<PortadaManual[]> {
  const dir = path.join(CONTENT, 'portadas');
  const out: PortadaManual[] = [];
  for (const file of await listar(dir)) {
    const src = path.join(dir, file);
    if (!(await imagenValida(src, `portadas/${file}`))) continue;
    const slug = slugify(path.basename(file, path.extname(file)));
    const img = sharp(src).rotate();
    await img
      .clone()
      .resize({ height: 800, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(path.join(OUT_PUBLIC, 'portadas', `${slug}.webp`));
    const lqip = await img.clone().resize(16).webp({ quality: 40 }).toBuffer();
    const { dominant } = await img.clone().stats();
    out.push({
      slug,
      url: `/generated/portadas/${slug}.webp`,
      lqip: `data:image/webp;base64,${lqip.toString('base64')}`,
      colorDominante: `rgb(${dominant.r} ${dominant.g} ${dominant.b})`,
    });
  }
  return out;
}

async function main() {
  await rm(OUT_PUBLIC, { recursive: true, force: true });
  for (const sub of ['documentos', 'fotos', 'portadas']) {
    await mkdir(path.join(OUT_PUBLIC, sub), { recursive: true });
  }
  const manifest: ContenidoManifest = {
    documentos: await documentos(),
    sesiones: await fotos(),
    portadas: await portadas(),
  };
  await mkdir(path.dirname(OUT_MANIFEST), { recursive: true });
  await writeFile(OUT_MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);

  const fotosTotal = manifest.sesiones.reduce((n, s) => n + s.fotos.length, 0);
  console.log(
    `Contenido: ${manifest.documentos.length} documentos, ${fotosTotal} fotos en ${manifest.sesiones.length} sesiones, ${manifest.portadas.length} portadas.`,
  );
  for (const aviso of avisos) {
    // En GitHub Actions aparece como aviso en el resumen de la ejecución
    console.log(process.env.GITHUB_ACTIONS ? `::warning::${aviso}` : `Aviso: ${aviso}`);
  }
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
