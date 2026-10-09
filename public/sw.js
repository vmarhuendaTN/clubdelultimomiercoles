/*
 * Service worker de caché ligera — Club del Último Miércoles.
 * - Estáticos versionados (_next/static, fuentes, iconos): primero caché.
 * - Portadas (Supabase Storage / Google Libros): caché y revalidación en segundo plano.
 * - Páginas: primero red; sin conexión, la última copia guardada.
 */
const VERSION = 'v1';
const STATIC = `estaticos-${VERSION}`;
const COVERS = `portadas-${VERSION}`;
const PAGES = `paginas-${VERSION}`;
const MAX_COVERS = 200;

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  const keep = new Set([STATIC, COVERS, PAGES]);
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => !keep.has(k)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

const isStatic = (url) =>
  url.origin === self.location.origin &&
  (url.pathname.includes('/_next/static/') || url.pathname.includes('/brand/'));

const isCover = (url) =>
  /\.supabase\.co$/.test(url.hostname) && url.pathname.includes('/covers/')
    ? true
    : url.hostname === 'books.google.com';

async function trim(cacheName, max) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  await Promise.all(keys.slice(0, Math.max(0, keys.length - max)).map((k) => cache.delete(k)));
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  if (isStatic(url)) {
    event.respondWith(
      caches.open(STATIC).then(async (cache) => {
        const hit = await cache.match(request);
        if (hit) return hit;
        const res = await fetch(request);
        if (res.ok) cache.put(request, res.clone());
        return res;
      }),
    );
    return;
  }

  if (isCover(url)) {
    event.respondWith(
      caches.open(COVERS).then(async (cache) => {
        const hit = await cache.match(request);
        const network = fetch(request)
          .then((res) => {
            if (res.ok || res.type === 'opaque') {
              cache.put(request, res.clone());
              trim(COVERS, MAX_COVERS);
            }
            return res;
          })
          .catch(() => hit);
        return hit || network;
      }),
    );
    return;
  }

  if (request.mode === 'navigate' && url.origin === self.location.origin) {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(PAGES).then((cache) => cache.put(request, copy));
          return res;
        })
        .catch(() => caches.match(request).then((hit) => hit || Response.error())),
    );
  }
});
