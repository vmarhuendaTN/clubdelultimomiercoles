import { routes } from '@/config/routes';
import { env } from '@/lib/env';
import { lineaDetalles } from '@/lib/format';
import type { Candidata } from '../types';

/** Enlace público completo (con el dominio y la ruta base de la web). */
export const enlace = (ruta: string, base: string = env.siteUrl) =>
  `${base.replace(/\/$/, '')}${ruta}`;

const texto = (c: Pick<Candidata, 'titulo' | 'autor'>) =>
  c.autor ? `${c.titulo}, ${c.autor}` : c.titulo;

/** «· Crimen y castigo, Fiódor Dostoievski (1866 · 832 págs.)». */
const lineaCandidata = (c: Pick<Candidata, 'titulo' | 'autor' | 'anio' | 'paginas'>) => {
  const detalles = lineaDetalles(c);
  return `· ${texto(c)}${detalles ? ` (${detalles})` : ''}`;
};

/** Mensaje para abrir la votación por WhatsApp. */
export function mensajeVotacion(
  etiqueta: string,
  candidatas: Pick<Candidata, 'titulo' | 'autor' | 'anio' | 'paginas'>[],
  base?: string,
): string {
  return [
    `Votación de la próxima lectura · ${etiqueta}`,
    '',
    'Candidatas:',
    ...candidatas.map(lineaCandidata),
    '',
    'Marca todas las que te apetezcan (puedes elegir varias) aquí, con el código del club:',
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
