import { routes } from '@/config/routes';
import { env } from '@/lib/env';
import type { Candidata } from '../types';

/** Enlace público completo (con el dominio y la ruta base de la web). */
export const enlace = (ruta: string, base: string = env.siteUrl) =>
  `${base.replace(/\/$/, '')}${ruta}`;

const texto = (c: Pick<Candidata, 'titulo' | 'autor'>) =>
  c.autor ? `${c.titulo}, ${c.autor}` : c.titulo;

/** Mensaje para abrir la votación por WhatsApp. */
export function mensajeVotacion(
  etiqueta: string,
  candidatas: Pick<Candidata, 'titulo' | 'autor'>[],
  base?: string,
): string {
  return [
    `Votación de la próxima lectura · ${etiqueta}`,
    '',
    'Candidatas:',
    ...candidatas.map((c) => `· ${texto(c)}`),
    '',
    'Puntúa cada una de 1 a 5 estrellas aquí, con el código del club:',
    enlace(routes.votar, base),
  ].join('\n');
}

/** Mensaje para pedir propuestas por WhatsApp. */
export function mensajePropuestas(etiqueta: string, base?: string): string {
  return [
    `Propuestas para ${etiqueta ? etiqueta.toLowerCase() : 'la próxima sesión'}`,
    '',
    '¿Qué te gustaría leer con el club? Propón tres lecturas aquí, con el código del club:',
    enlace(routes.proponer, base),
  ].join('\n');
}
