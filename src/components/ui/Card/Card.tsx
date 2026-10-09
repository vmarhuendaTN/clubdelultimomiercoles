import type { ElementType, ReactNode } from 'react';
import styles from './Card.module.css';

type CardProps = {
  children: ReactNode;
  as?: ElementType;
  /** Tarjeta pulsable (contiene un enlace que la cubre): aplica la escala al pulsar. */
  interactiva?: boolean;
  destacada?: boolean;
  className?: string;
};

export function Card({
  children,
  as: Tag = 'div',
  interactiva = false,
  destacada = false,
  className,
}: CardProps) {
  const classes = [
    styles.card,
    interactiva && styles.interactiva,
    destacada && styles.destacada,
    className,
  ]
    .filter(Boolean)
    .join(' ');
  return <Tag className={classes}>{children}</Tag>;
}
