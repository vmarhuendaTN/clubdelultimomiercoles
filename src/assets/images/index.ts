/**
 * Imágenes estáticas con su texto alternativo (docs/ASSETS.md § 6).
 * import { logoCompleto } from '@/assets/images'
 */
import logoCompletoSrc from './brand/logo-completo.svg';
import logoCompletoOscuroSrc from './brand/logo-completo-oscuro.svg';
import logoSillonSrc from './brand/logo-sillon.svg';

export type StaticImage = { src: typeof logoCompletoSrc; alt: string };

export const logoCompleto: StaticImage = {
  src: logoCompletoSrc,
  alt: 'Club del Último Miércoles',
};

export const logoCompletoOscuro: StaticImage = {
  src: logoCompletoOscuroSrc,
  alt: 'Club del Último Miércoles',
};

/** Isotipo: sillón mostaza con libros. Decorativo cuando acompaña al nombre del club. */
export const logoSillon: StaticImage = {
  src: logoSillonSrc,
  alt: 'Ilustración de un sillón orejero mostaza con libros',
};
