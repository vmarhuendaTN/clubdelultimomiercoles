import { Caveat, Inter, Newsreader } from 'next/font/google';

/** Inter: cuerpo e interfaz. CLAUDE.md § Identidad visual. */
export const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-inter',
});

/**
 * Newsreader: serif editorial para títulos de página, secciones y títulos de libro
 * (el toque clásico, como la «New York» de Apple Libros).
 */
export const newsreader = Newsreader({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-newsreader',
});

/** Caveat: solo acentos manuscritos ≥ 24 px (citas, nota del club, portadas ilustradas). */
export const caveat = Caveat({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  display: 'swap',
  variable: '--font-caveat',
});
