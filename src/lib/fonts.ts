import localFont from 'next/font/local';

/*
 * Fuentes alojadas en el repositorio (src/assets/fonts, subconjunto latino, licencia OFL).
 * Antes se descargaban de Google Fonts en cada build y la descarga fallaba a veces, rompiendo
 * la compilación. Son las mismas fuentes; para actualizarlas, ver src/assets/fonts/README.md.
 */

/** Inter: cuerpo e interfaz. CLAUDE.md § Identidad visual. */
export const inter = localFont({
  src: '../assets/fonts/inter-latin.woff2',
  weight: '400 700',
  style: 'normal',
  display: 'swap',
  variable: '--font-inter',
});

/**
 * Newsreader: serif editorial para títulos de página, secciones y títulos de libro
 * (el toque clásico, como la «New York» de Apple Libros).
 */
export const newsreader = localFont({
  src: [
    { path: '../assets/fonts/newsreader-latin.woff2', weight: '400 700', style: 'normal' },
    { path: '../assets/fonts/newsreader-italic-latin.woff2', weight: '400 700', style: 'italic' },
  ],
  display: 'swap',
  variable: '--font-newsreader',
  fallback: ['Iowan Old Style', 'Georgia', 'serif'],
});

/** Caveat: solo acentos manuscritos ≥ 24 px (citas, nota del club, portadas ilustradas). */
export const caveat = localFont({
  src: '../assets/fonts/caveat-latin.woff2',
  weight: '500 700',
  style: 'normal',
  display: 'swap',
  variable: '--font-caveat',
  preload: false,
});
