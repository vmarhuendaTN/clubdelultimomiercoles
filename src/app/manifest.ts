import type { MetadataRoute } from 'next';
import { site } from '@/config/site';
import { withBasePath } from '@/lib/env';

export const dynamic = 'force-static';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.nombre,
    short_name: site.nombreCorto,
    description: site.descripcion,
    lang: 'es',
    start_url: withBasePath('/'),
    scope: withBasePath('/'),
    display: 'standalone',
    orientation: 'portrait',
    background_color: site.colores.tema,
    theme_color: site.colores.tema,
    icons: [
      { src: withBasePath('/brand/pwa/icon-192.png'), sizes: '192x192', type: 'image/png' },
      { src: withBasePath('/brand/pwa/icon-512.png'), sizes: '512x512', type: 'image/png' },
      {
        src: withBasePath('/brand/pwa/icon-maskable-512.png'),
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
