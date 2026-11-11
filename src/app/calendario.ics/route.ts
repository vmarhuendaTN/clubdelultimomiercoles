import { calendarioDelClub } from '@/features/books/server';

export const dynamic = 'force-static';

/** /calendario.ics: sesiones del club para suscribirse desde cualquier calendario. */
export function GET() {
  return new Response(calendarioDelClub(), {
    headers: { 'Content-Type': 'text/calendar; charset=utf-8' },
  });
}
