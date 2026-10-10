/**
 * Los embeds de Instagram avisan de su altura con postMessage
 * (`{"type":"MEASURE","details":{"height":…}}`). Devuelve esa altura si el mensaje
 * viene de Instagram y es válido; si no, `null`.
 */
const ORIGEN = 'https://www.instagram.com';

export function alturaDeMensaje(evento: Pick<MessageEvent, 'origin' | 'data'>): number | null {
  if (evento.origin !== ORIGEN) return null;
  try {
    const datos: unknown = typeof evento.data === 'string' ? JSON.parse(evento.data) : evento.data;
    if (typeof datos !== 'object' || datos === null) return null;
    const { type, details } = datos as { type?: unknown; details?: { height?: unknown } };
    const altura = Number(details?.height);
    return type === 'MEASURE' && Number.isFinite(altura) && altura > 0 ? Math.ceil(altura) : null;
  } catch {
    return null;
  }
}
