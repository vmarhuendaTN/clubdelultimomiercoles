/**
 * Imágenes estáticas con su texto alternativo (docs/ASSETS.md § 6).
 * import { logoCompleto } from '@/assets/images'
 */
import logoCompletoSrc from './brand/logo-completo.webp';
import logoCompletoOscuroSrc from './brand/logo-completo-oscuro.webp';
import logoCabeceraSrc from './brand/logo-cabecera.webp';
import logoCabeceraOscuroSrc from './brand/logo-cabecera-oscuro.webp';
import logoPieSrc from './brand/logo-pie.webp';
import logoPieOscuroSrc from './brand/logo-pie-oscuro.webp';
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

/** Cabecera de escritorio: sillón y nombre manuscrito en una línea. */
export const logoCabecera: StaticImage = { src: logoCabeceraSrc, alt: 'Club del Último Miércoles' };
export const logoCabeceraOscuro: StaticImage = {
  src: logoCabeceraOscuroSrc,
  alt: 'Club del Último Miércoles',
};

/** Solo el nombre manuscrito en una línea (pie). */
export const logoPie: StaticImage = { src: logoPieSrc, alt: 'Club del Último Miércoles' };
export const logoPieOscuro: StaticImage = {
  src: logoPieOscuroSrc,
  alt: 'Club del Último Miércoles',
};
