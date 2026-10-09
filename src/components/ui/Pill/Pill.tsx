import type { ReactNode } from 'react';
import styles from './Pill.module.css';

type PillProps = {
  children: ReactNode;
  variant?: 'neutro' | 'acento' | 'mostaza';
};

/** Etiqueta en forma de píldora: metadatos (año · páginas · sesión) y estados. */
export function Pill({ children, variant = 'neutro' }: PillProps) {
  return <span className={`${styles.pill} ${styles[variant]}`}>{children}</span>;
}
