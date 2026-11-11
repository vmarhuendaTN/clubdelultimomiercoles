import { calendarioDelClub } from '@/features/books/server';

export const dynamic = 'force-static';

/** /calendario-club-2.ics: quedadas del Club 2 para suscribirse desde cualquier calendario. */
export function GET() {
  return new Response(calendarioDelClub('2'), {
    headers: { 'Content-Type': 'text/calendar; charset=utf-8' },
  });
}
