import type { NextConfig } from 'next';

/**
 * Exportación estática para GitHub Pages (ver docs/PLAN.md § Despliegue).
 * Sin servidor: ni middleware, ni rutas /api, ni optimización de imágenes en tiempo de petición.
 *
 * NEXT_PUBLIC_BASE_PATH = '/clubdelultimomiercoles' mientras se sirva en
 * vmarhuendatn.github.io/clubdelultimomiercoles; vacío con dominio propio.
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
