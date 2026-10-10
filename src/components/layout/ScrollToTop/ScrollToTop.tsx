'use client';

import { logoPie, logoPieOscuro } from '@/assets/images';
import { Icon, ThemedImage } from '@/components/ui';
import { volverArriba } from '@/lib/dom/scroll';
import { MAIN_ID } from '../SkipLink';
import styles from './ScrollToTop.module.css';

/** Botón con el nombre manuscrito del club que devuelve al principio de la página actual. */
export function ScrollToTop() {
  return (
    <button
      type="button"
      className={styles.boton}
      aria-label={`${logoPie.alt}: volver arriba`}
      onClick={() => volverArriba(MAIN_ID)}
    >
      <ThemedImage
        claro={logoPie.src}
        oscuro={logoPieOscuro.src}
        alt=""
        sizes="280px"
        className={styles.logo}
      />
      <Icon name="arriba" size="sm" />
    </button>
  );
}
