'use client';

import { Icon } from '@/components/ui';
import { volverArriba } from '@/lib/dom/scroll';
import { MAIN_ID } from '../SkipLink';
import styles from './ScrollToTop.module.css';

type ScrollToTopProps = { texto: string };

/** Botón con el nombre del club que devuelve al principio de la página actual. */
export function ScrollToTop({ texto }: ScrollToTopProps) {
  return (
    <button
      type="button"
      className={styles.boton}
      aria-label={`${texto}: volver arriba`}
      onClick={() => volverArriba(MAIN_ID)}
    >
      {texto}
      <Icon name="arriba" size="sm" />
    </button>
  );
}
