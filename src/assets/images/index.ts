/**
 * Imágenes estáticas con su texto alternativo (docs/ASSETS.md § 6).
 * import { logoCompleto } from '@/assets/images'
 */
import logoCompletoSrc from './brand/logo-completo.webp';
import logoCompletoOscuroSrc from './brand/logo-completo-oscuro.webp';
import logoSillonSrc from './brand/logo-sillon.webp';

export type StaticImage = { src: typeof logoCompletoSrc; alt: string };

export const logoCompleto: StaticImage = {
  src: logoCompletoSrc,
  alt: 'Club del Último Miércoles',
};

export const logoCompletoOscuro: StaticImage = {
  src: logoCompletoOscuroSrc,
  alt: 'Club del Último Miércoles',
};

/** Isotipo: sillón mostaza con libros y la cola del gato. Decorativo junto al nombre del club. */
export const logoSillon: StaticImage = {
  src: logoSillonSrc,
  alt: 'Ilustración de un sillón orejero mostaza con un libro abierto y una pila de libros',
};
