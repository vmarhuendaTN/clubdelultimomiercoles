'use client';

import { useEffect } from 'react';
import { withBasePath } from '@/lib/env';

/** Registra el service worker de caché ligera (solo en producción). */
export function ServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) return;
    navigator.serviceWorker
      .register(withBasePath('/sw.js'), { scope: withBasePath('/') })
      .catch(() => {
        // Sin service worker la web funciona igual; no se molesta a quien visita.
      });
  }, []);
  return null;
}
