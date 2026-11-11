import type { NextConfig } from 'next';

/**
 * Exportación estática para GitHub Pages (ver docs/PLAN.md § Despliegue).
 * Sin servidor: ni middleware, ni rutas /api, ni optimización de imágenes en tiempo de petición.
 *
 * NEXT_PUBLIC_BASE_PATH = '/clubdelultimomiercoles' en vmarhuendatn.github.io; con dominio propio,
 * vacío o «/» (la raíz; GitHub no admite variables vacías).
 */
const basePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? '').replace(/\/+$/, '');

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
