import type { ReactNode } from 'react';
import { Icon } from '../Icon';
import styles from './Chip.module.css';

type ChipProps = {
  children: ReactNode;
  /** Chip que se pulsa para elegirlo (p. ej. «añadir esta lectura»). */
  onPulsar?: () => void;
  /** Chip elegido con botón para quitarlo. */
  onQuitar?: () => void;
  /** Nombre accesible del botón (por defecto, «Añadir …» o «Quitar …» con el texto). */
  etiqueta?: string;
};

/** Ficha pequeña y redondeada: para elegir de una lista o mostrar lo elegido. */
export function Chip({ children, onPulsar, onQuitar, etiqueta }: ChipProps) {
  if (onPulsar) {
    return (
      <button
        type="button"
        className={`${styles.chip} ${styles.pulsable}`}
        onClick={onPulsar}
        aria-label={etiqueta}
      >
        <Icon name="anadir" size="sm" />
        <span>{children}</span>
      </button>
    );
  }
  return (
    <span className={`${styles.chip} ${styles.elegido}`}>
      <span>{children}</span>
      {onQuitar && (
        <button
          type="button"
          className={styles.quitar}
          onClick={onQuitar}
          aria-label={etiqueta ?? `Quitar ${typeof children === 'string' ? children : ''}`.trim()}
        >
          <Icon name="cerrar" size="sm" />
        </button>
      )}
    </span>
  );
}
