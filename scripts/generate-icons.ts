/**
 * Genera todas las versiones del logo a partir del original (docs/ASSETS.md § 7):
 *
 *   pnpm icons
 *
 * Fuente: assets-src/brand/logo-original-transparente.png (PNG con transparencia).
 * Salidas:
 *   src/assets/images/brand/  logo-completo.webp · logo-completo-oscuro.webp · logo-sillon.webp
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
const BRAND = path.join(ROOT, 'src/assets/images/brand');
const PUBLIC = path.join(ROOT, 'public/brand');
const PAPEL = '#FBF7EF';
const CREMA = { r: 0xf5, g: 0xef, b: 0xe4 };

/**
 * Zona del texto manuscrito en el original (fracciones del lienzo). Se usa para
 * aclarar el texto en la versión oscura y para separar el sillón (isotipo).
 */
const TEXTO = { x0: 0.59, y0: 0.22, x1: 1, y1: 0.535 };

type Raw = { data: Buffer; width: number; height: number };

async function raw(input: Sharp): Promise<Raw> {
  const { data, info } = await input.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height };
}

function enTexto(x: number, y: number, { width, height }: Raw): boolean {
  return (
    x >= TEXTO.x0 * width &&
    x <= TEXTO.x1 * width &&
    y >= TEXTO.y0 * height &&
    y <= TEXTO.y1 * height
  );
}

/** Aplica `fn` a cada píxel de la zona de texto. */
function editarTexto(img: Raw, fn: (d: Buffer, i: number) => void): Raw {
  const data = Buffer.from(img.data);
  for (let y = 0; y < img.height; y++) {
    for (let x = 0; x < img.width; x++) {
      if (enTexto(x, y, img)) fn(data, (y * img.width + x) * 4);
    }
  }
  return { ...img, data };
}

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
  const oscuro = editarTexto(original, (d, i) => {
    const lum = 0.2126 * d[i]! + 0.7152 * d[i + 1]! + 0.0722 * d[i + 2]!;
    if (d[i + 3]! > 0 && lum < 110) {
      d[i] = CREMA.r;
      d[i + 1] = CREMA.g;
      d[i + 2] = CREMA.b;
    }
  });
  // Isotipo: se borra la zona del texto.
  const sillon = editarTexto(original, (d, i) => {
    d[i + 3] = 0;
  });

  const completoBuf = await webp(toSharp(original), 840);
  await write(path.join(BRAND, 'logo-completo.webp'), completoBuf);
  await write(path.join(BRAND, 'logo-completo-oscuro.webp'), await webp(toSharp(oscuro), 840));
  const sillonPng = await toSharp(sillon).trim({ threshold: 1 }).png().toBuffer();
  await write(path.join(BRAND, 'logo-sillon.webp'), await webp(sharp(sillonPng), 480));

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
