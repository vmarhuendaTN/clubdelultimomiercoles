/**
 * Genera favicons, iconos PWA, og-image y logo para emails (docs/ASSETS.md § 7).
 *
 *   pnpm icons
 *
 * Fuentes: src/assets/images/brand/logo-sillon.svg (isotipo) y logo-completo.svg.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import pngToIco from 'png-to-ico';
import sharp from 'sharp';

const ROOT = path.resolve(import.meta.dirname, '..');
const BRAND = path.join(ROOT, 'src/assets/images/brand');
const PUBLIC = path.join(ROOT, 'public/brand');
const PAPEL = '#FBF7EF';

const sillon = path.join(BRAND, 'logo-sillon.svg');
const completo = path.join(BRAND, 'logo-completo.svg');

/** Rasteriza un SVG para que quepa en `box` px y lo centra en un lienzo `size` con fondo. */
async function icon(
  svg: string,
  size: number,
  box: number,
  background: string | null,
): Promise<Buffer> {
  const art = await sharp(svg, { density: 600 })
    .resize(box, box, { fit: 'inside' })
    .png()
    .toBuffer();
  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: background ?? { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: art, gravity: 'centre' }])
    .png({ compressionLevel: 9 })
    .toBuffer();
}

async function write(file: string, data: Buffer): Promise<void> {
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, data);
  console.log(`${path.relative(ROOT, file)}: ${(data.length / 1024).toFixed(1)} KB`);
}

async function main() {
  // Favicons: el isotipo ocupa casi todo el lienzo y sin fondo
  const fav = await Promise.all([16, 32, 48].map((s) => icon(sillon, s, s, null)));
  await write(path.join(PUBLIC, 'favicon/favicon.ico'), await pngToIco(fav));
  await write(path.join(PUBLIC, 'favicon/favicon-32.png'), fav[1]!);
  // iOS pone sus propias esquinas; fondo papel y margen del 12 %
  await write(
    path.join(PUBLIC, 'favicon/apple-touch-icon.png'),
    await icon(sillon, 180, 140, PAPEL),
  );

  // PWA
  await write(path.join(PUBLIC, 'pwa/icon-192.png'), await icon(sillon, 192, 160, PAPEL));
  await write(path.join(PUBLIC, 'pwa/icon-512.png'), await icon(sillon, 512, 432, PAPEL));
  // Maskable: todo el dibujo dentro del círculo de seguridad (80 % → caja de ~56 %)
  await write(path.join(PUBLIC, 'pwa/icon-maskable-512.png'), await icon(sillon, 512, 290, PAPEL));

  // og-image 1200 × 630, JPG
  const logo = await sharp(completo, { density: 600 })
    .resize(980, 500, { fit: 'inside' })
    .png()
    .toBuffer();
  const og = await sharp({ create: { width: 1200, height: 630, channels: 3, background: PAPEL } })
    .composite([{ input: logo, gravity: 'centre' }])
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();
  await write(path.join(PUBLIC, 'og/og-default.jpg'), og);

  // Logo para emails (los clientes de correo no muestran SVG)
  for (const [name, width] of [
    ['logo-email.png', 240],
    ['logo-email@2x.png', 480],
  ] as const) {
    const png = await sharp(completo, { density: 600 })
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
