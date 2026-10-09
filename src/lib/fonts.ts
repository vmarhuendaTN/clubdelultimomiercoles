import { Caveat, Inter } from 'next/font/google';

/** Inter: cuerpo e interfaz. CLAUDE.md § Identidad visual. */
export const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-inter',
});

/** Caveat: solo titulares ≥ 24 px (display, large title, citas). */
export const caveat = Caveat({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  display: 'swap',
  variable: '--font-caveat',
});
