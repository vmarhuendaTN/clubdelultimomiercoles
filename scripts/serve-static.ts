/**
 * Sirve out/ como lo haría GitHub Pages (para Playwright y para probar en local).
 *
 *   pnpm serve:out [puerto]
 *
 * Respeta NEXT_PUBLIC_BASE_PATH, resuelve carpetas a index.html y responde 404.html.
 */
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '../out');
const PORT = Number(process.argv[2] ?? 3100);
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.pdf': 'application/pdf',
};

async function resolve(urlPath: string): Promise<string | null> {
  const clean = decodeURIComponent(urlPath.split('?')[0] ?? '/');
  const file = path.normalize(path.join(ROOT, clean));
  if (!file.startsWith(ROOT)) return null;
  for (const candidate of [file, path.join(file, 'index.html'), `${file}.html`]) {
    const info = await stat(candidate).catch(() => null);
    if (info?.isFile()) return candidate;
  }
  return null;
}

createServer(async (req, res) => {
  let url = req.url ?? '/';
  if (BASE) {
    if (url === BASE) {
      res.writeHead(301, { Location: `${BASE}/` }).end();
      return;
    }
    url = url.startsWith(`${BASE}/`) ? url.slice(BASE.length) : '/__fuera_de_base__';
  }
  const file = await resolve(url);
  const target = file ?? path.join(ROOT, '404.html');
  res.writeHead(file ? 200 : 404, {
    'Content-Type': TYPES[path.extname(target)] ?? 'application/octet-stream',
  });
  createReadStream(target).pipe(res);
}).listen(PORT, () => {
  console.log(`Sirviendo out/ en http://localhost:${PORT}${BASE}/`);
});
