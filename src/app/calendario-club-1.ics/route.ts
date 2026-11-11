import { calendarioDelClub } from '@/features/books/server';

export const dynamic = 'force-static';

/** /calendario-club-1.ics: quedadas del Club 1 para suscribirse desde cualquier calendario. */
export function GET() {
  return new Response(calendarioDelClub('1'), {
    headers: { 'Content-Type': 'text/calendar; charset=utf-8' },
  });
}
