import { readFileSync } from 'node:fs';
import sharp from 'sharp';
import { defineConfig, type Plugin } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

/** Imita el import estático de imágenes de Next ({ src, width, height }). */
function staticImages(): Plugin {
  return {
    name: 'static-images',
    enforce: 'pre',
    async load(id) {
      if (/\.(webp|png|jpe?g)$/.test(id)) {
        const { width, height } = await sharp(id).metadata();
        const src = id.slice(id.indexOf('/src/'));
        return `export default ${JSON.stringify({ src, width, height })};`;
      }
      if (!id.endsWith('.svg')) return null;
      const svg = readFileSync(id, 'utf8');
      const [, , w = '100', h = '100'] =
        /viewBox="([\d.-]+ [\d.-]+) ([\d.]+) ([\d.]+)"/.exec(svg)?.slice(1) ?? [];
      const src = id.slice(id.indexOf('/src/'));
      return `export default ${JSON.stringify({ src, width: Number(w), height: Number(h) })};`;
    },
  };
}

export default defineConfig({
  plugins: [staticImages(), tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['src/**/*.test.{ts,tsx}', 'scripts/**/*.test.ts'],
    css: { modules: { classNameStrategy: 'non-scoped' } },
    // Igual que next.config.ts (trailingSlash: true)
    env: { __NEXT_TRAILING_SLASH: 'true' },
  },
});
