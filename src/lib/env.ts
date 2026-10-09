/**
 * Variables de entorno públicas (se incrustan en el build estático).
 * Los secretos (service_role, Google, Instagram) solo existen en GitHub Actions, nunca aquí.
 */
export const env = {
  basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? '',
  siteUrl:
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://vmarhuendatn.github.io/clubdelultimomiercoles',
  siteMode: process.env.NEXT_PUBLIC_SITE_MODE === 'public' ? 'public' : 'private',
  /** Supabase: URL y clave publicable (públicas por diseño; la seguridad la da RLS). */
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? '',
} as const;

/** Prefija el basePath a rutas de public/ (manifest, iconos, service worker). */
export function withBasePath(path: string): string {
  return `${env.basePath}${path.startsWith('/') ? path : `/${path}`}`;
}
