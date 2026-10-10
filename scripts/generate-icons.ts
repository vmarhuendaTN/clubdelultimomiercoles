/**
 * Genera todas las versiones del logo a partir del original (docs/ASSETS.md § 7):
 *
 *   pnpm icons
 *
 * Fuentes (PNG con transparencia, en assets-src/brand/):
 *   logo-original-transparente.png  logo completo (sillón + texto)
 *   logo-original-sillon.png        solo el sillón (isotipo)
 *   logo-cabecera-transparente.png  sillón + nombre en una línea (cabecera de escritorio)
 *   logo-footer-transparente.png    solo el nombre manuscrito en una línea (pie)
 * Salidas:
 *   src/assets/images/brand/  logo-completo(-oscuro).webp · logo-sillon.webp ·
 *                             logo-cabecera(-oscuro).webp · logo-pie(-oscuro).webp
 *   public/brand/favicon/     favicon.ico · favicon-32.png · apple-touch-icon.png
 *   public/brand/pwa/         icon-192.png · icon-512.png · icon-maskable-512.png
 *   public/brand/og/          og-default.jpg (1200 × 630, para WhatsApp y redes)
 *   public/brand/logo/        logo.png · logo-email.png · logo-email@2x.png
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import pngToIco from 'png-to-ico';
import sharp, { type Sharp } from 'sharp';

const ROOT = path.resolve(import.meta.dirname, '..');
const SRC = path.join(ROOT, 'assets-src/brand/logo-original-transparente.png');
const SRC_SILLON = path.join(ROOT, 'assets-src/brand/logo-original-sillon.png');
const SRC_CABECERA = path.join(ROOT, 'assets-src/brand/logo-cabecera-transparente.png');
const SRC_PIE = path.join(ROOT, 'assets-src/brand/logo-footer-transparente.png');
const BRAND = path.join(ROOT, 'src/assets/images/brand');
const PUBLIC = path.join(ROOT, 'public/brand');
const PAPEL = '#FBF7EF';
const CREMA = { r: 0xf5, g: 0xef, b: 0xe4 };
const PAPEL_RGB = { r: 0xfb, g: 0xf7, b: 0xef };

type Zona = { x0: number; y0: number; x1: number; y1: number };

/** Zona del texto manuscrito en cada original (fracciones del lienzo), para aclararlo en modo oscuro. */
const TEXTO: Zona = { x0: 0.567, y0: 0.2, x1: 1, y1: 0.485 };
const TEXTO_CABECERA: Zona = { x0: 0.3, y0: 0, x1: 1, y1: 1 };
const TODO: Zona = { x0: 0, y0: 0, x1: 1, y1: 1 };

type Raw = { data: Buffer; width: number; height: number };

async function raw(input: Sharp): Promise<Raw> {
  const { data, info } = await input.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height };
}

function enZona(x: number, y: number, { width, height }: Raw, zona: Zona): boolean {
  return (
    x >= zona.x0 * width && x <= zona.x1 * width && y >= zona.y0 * height && y <= zona.y1 * height
  );
}

/** Aplica `fn` a cada píxel de la zona. */
function editarZona(img: Raw, zona: Zona, fn: (d: Buffer, i: number) => void): Raw {
  const data = Buffer.from(img.data);
  for (let y = 0; y < img.height; y++) {
    for (let x = 0; x < img.width; x++) {
      if (enZona(x, y, img, zona)) fn(data, (y * img.width + x) * 4);
    }
  }
  return { ...img, data };
}

const luminancia = (d: Buffer, i: number) =>
  0.2126 * d[i]! + 0.7152 * d[i + 1]! + 0.0722 * d[i + 2]!;

/** Versión oscura: la tinta casi negra de la zona pasa a crema. */
const aclararTinta = (img: Raw, zona: Zona) =>
  editarZona(img, zona, (d, i) => {
    if (d[i + 3]! > 0 && luminancia(d, i) < 110) {
      d[i] = CREMA.r;
      d[i + 1] = CREMA.g;
      d[i + 2] = CREMA.b;
    }
  });

/**
 * Rellena con papel los huecos transparentes encerrados por el dibujo (las páginas de los
 * libros): sobre fondo oscuro se verían como agujeros. Lo exterior, alcanzable desde el borde,
 * sigue transparente, y la zona del texto no se toca (los ojos de las letras son huecos).
 */
function rellenarHuecos(img: Raw, texto: Zona): Raw {
  const { width, height } = img;
  const data = Buffer.from(img.data);
  const transparente = (p: number) => data[p * 4 + 3]! < 128;
  const exterior = new Uint8Array(width * height);
  const pila: number[] = [];
  for (let x = 0; x < width; x++) pila.push(x, (height - 1) * width + x);
  for (let y = 0; y < height; y++) pila.push(y * width, y * width + width - 1);
  while (pila.length) {
    const p = pila.pop()!;
    if (exterior[p] || !transparente(p)) continue;
    exterior[p] = 1;
    const x = p % width;
    if (x > 0) pila.push(p - 1);
    if (x < width - 1) pila.push(p + 1);
    if (p >= width) pila.push(p - width);
    if (p < width * (height - 1)) pila.push(p + width);
  }
  for (let p = 0; p < width * height; p++) {
    if (!exterior[p] && transparente(p) && !enZona(p % width, Math.floor(p / width), img, texto)) {
      data[p * 4] = PAPEL_RGB.r;
      data[p * 4 + 1] = PAPEL_RGB.g;
      data[p * 4 + 2] = PAPEL_RGB.b;
      data[p * 4 + 3] = 255;
    }
  }
  return { ...img, data };
}

/** Quita restos blancos opacos (borrones) de la zona: sobre el papel se verían como manchas. */
const quitarBlancos = (img: Raw, zona: Zona) =>
  editarZona(img, zona, (d, i) => {
    if (d[i]! > 225 && d[i + 1]! > 225 && d[i + 2]! > 225) d[i + 3] = 0;
  });

const toSharp = (img: Raw) =>
  sharp(img.data, { raw: { width: img.width, height: img.height, channels: 4 } });

async function write(file: string, data: Buffer): Promise<void> {
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, data);
  console.log(`${path.relative(ROOT, file)}: ${(data.length / 1024).toFixed(1)} KB`);
}

const webp = (img: Sharp, width: number) =>
  img
    .trim({ threshold: 1 })
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: 70, alphaQuality: 80, effort: 6 })
    .toBuffer();

/** Centra `art` (cabe en `box`) en un lienzo cuadrado `size`. */
async function icono(
  art: Buffer,
  size: number,
  box: number,
  fondo: string | null,
): Promise<Buffer> {
  const centrado = await sharp(art).resize(box, box, { fit: 'inside' }).png().toBuffer();
  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: fondo ?? { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: centrado, gravity: 'centre' }])
    .png({ compressionLevel: 9 })
    .toBuffer();
}

async function main() {
  const original = await raw(sharp(SRC));

  // Versión oscura: el texto (tinta casi negra) pasa a crema; el sillón no cambia.
  const oscuro = rellenarHuecos(aclararTinta(original, TEXTO), TEXTO);

  const completoBuf = await webp(toSharp(original), 840);
  await write(path.join(BRAND, 'logo-completo.webp'), completoBuf);
  await write(path.join(BRAND, 'logo-completo-oscuro.webp'), await webp(toSharp(oscuro), 840));
  const sillonPng = await sharp(SRC_SILLON).trim({ threshold: 1 }).png().toBuffer();
  await write(path.join(BRAND, 'logo-sillon.webp'), await webp(sharp(sillonPng), 480));

  // Cabecera de escritorio (sillón + nombre en una línea) y nombre manuscrito del pie
  const cabecera = quitarBlancos(await raw(sharp(SRC_CABECERA)), TEXTO_CABECERA);
  await write(path.join(BRAND, 'logo-cabecera.webp'), await webp(toSharp(cabecera), 480));
  await write(
    path.join(BRAND, 'logo-cabecera-oscuro.webp'),
    await webp(
      toSharp(rellenarHuecos(aclararTinta(cabecera, TEXTO_CABECERA), TEXTO_CABECERA)),
      480,
    ),
  );
  const pie = await raw(sharp(SRC_PIE));
  await write(path.join(BRAND, 'logo-pie.webp'), await webp(toSharp(pie), 560));
  await write(
    path.join(BRAND, 'logo-pie-oscuro.webp'),
    await webp(toSharp(aclararTinta(pie, TODO)), 560),
  );

  // Favicons e iconos de app: el sillón sobre papel
  const fav = await Promise.all([16, 32, 48].map((s) => icono(sillonPng, s, s, null)));
  await write(path.join(PUBLIC, 'favicon/favicon.ico'), await pngToIco(fav));
  await write(path.join(PUBLIC, 'favicon/favicon-32.png'), fav[1]!);
  await write(
    path.join(PUBLIC, 'favicon/apple-touch-icon.png'),
    await icono(sillonPng, 180, 144, PAPEL),
  );
  await write(path.join(PUBLIC, 'pwa/icon-192.png'), await icono(sillonPng, 192, 160, PAPEL));
  await write(path.join(PUBLIC, 'pwa/icon-512.png'), await icono(sillonPng, 512, 432, PAPEL));
  // Maskable: el dibujo dentro del círculo de seguridad del 80 %
  await write(
    path.join(PUBLIC, 'pwa/icon-maskable-512.png'),
    await icono(sillonPng, 512, 290, PAPEL),
  );

  // og-image (WhatsApp, redes): logo completo sobre papel, 1200 × 630
  const completoPng = await toSharp(original).trim({ threshold: 1 }).png().toBuffer();
  const logoOg = await sharp(completoPng).resize(1000, 540, { fit: 'inside' }).png().toBuffer();
  const og = await sharp({ create: { width: 1200, height: 630, channels: 3, background: PAPEL } })
    .composite([{ input: logoOg, gravity: 'centre' }])
    .jpeg({ quality: 85, mozjpeg: true })
    .toBuffer();
  await write(path.join(PUBLIC, 'og/og-default.jpg'), og);

  // Logo para terceros y emails (los clientes de correo no muestran WebP de forma fiable)
  await write(
    path.join(PUBLIC, 'logo/logo.png'),
    await sharp(completoPng)
      .resize({ width: 800 })
      .png({ compressionLevel: 9, palette: true })
      .toBuffer(),
  );
  for (const [name, width] of [
    ['logo-email.png', 240],
    ['logo-email@2x.png', 480],
  ] as const) {
    const png = await sharp(completoPng)
      .resize({ width })
      .flatten({ background: '#FFFFFF' })
      .png({ compressionLevel: 9, palette: true })
      .toBuffer();
    await write(path.join(PUBLIC, 'logo', name), png);
  }
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
