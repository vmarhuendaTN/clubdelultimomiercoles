import type { NextConfig } from 'next';

/**
 * Exportación estática para GitHub Pages (ver docs/PLAN.md § Despliegue).
 * Sin servidor: ni middleware, ni rutas /api, ni optimización de imágenes en tiempo de petición.
 *
 * NEXT_PUBLIC_BASE_PATH vacío: la web se sirve en la raíz de clubdelultimomiercoles.es.
 * Solo haría falta ('/clubdelultimomiercoles') si se volviera a servir en vmarhuendatn.github.io.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

const nextConfig: NextConfig = {
  output: 'export',
  basePath,
  trailingSlash: true,
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // GitHub Pages no tiene optimizador: las imágenes se sirven ya optimizadas (pnpm assets / sync).
    unoptimized: true,
  },
};

export default nextConfig;
