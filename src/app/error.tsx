'use client';

import { ReadingPause } from '@/features/errors';

/** Si una página falla en el navegador, se ve «Estamos leyendo» en lugar del error. */
export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return <ReadingPause onReintentar={reset} />;
}
