/**
 * Variables de entorno públicas (se incrustan en el build estático).
 * Los secretos (service_role, Google, Instagram) solo existen en GitHub Actions, nunca aquí.
 */
export const env = {
  basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? '',
  siteUrl:
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://vmarhuendatn.github.io/clubdelultimomiercoles',
  siteMode: process.env.NEXT_PUBLIC_SITE_MODE === 'public' ? 'public' : 'private',
} as const;

/** Prefija el basePath a rutas de public/ (manifest, iconos, service worker). */
export function withBasePath(path: string): string {
  return `${env.basePath}${path.startsWith('/') ? path : `/${path}`}`;
}
