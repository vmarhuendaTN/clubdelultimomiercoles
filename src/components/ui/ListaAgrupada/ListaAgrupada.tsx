import Link from 'next/link';
import type { ReactNode } from 'react';
import { Icon, type IconName } from '../Icon';
import styles from './ListaAgrupada.module.css';

export type FilaLista = {
  icono: IconName;
  /** Color del cuadradito del icono. */
  tono?: 'mostaza' | 'granate' | 'tinta';
  titulo: string;
  detalle?: ReactNode;
  /** Con enlace, la fila entera se pulsa. Externo: se abre fuera y lleva su icono. */
  href?: string;
  externo?: boolean;
};

type ListaAgrupadaProps = {
  filas: FilaLista[];
  /** Nombre accesible de la lista (si no hay un título visible que la nombre). */
  etiqueta?: string;
};

function Contenido({ fila }: { fila: FilaLista }) {
  return (
    <>
      <span className={`${styles.icono} ${styles[fila.tono ?? 'mostaza']}`} aria-hidden="true">
        <Icon name={fila.icono} size="sm" />
      </span>
      <span className={styles.textos}>
        <span className={styles.titulo}>{fila.titulo}</span>
        {fila.detalle && <span className={styles.detalle}>{fila.detalle}</span>}
      </span>
      {fila.href && (
        <Icon name={fila.externo ? 'externo' : 'siguiente'} size="sm" className={styles.flecha} />
      )}
    </>
  );
}

/** Lista agrupada al estilo de Ajustes de iOS: filas con icono, título, detalle y enlace. */
export function ListaAgrupada({ filas, etiqueta }: ListaAgrupadaProps) {
  return (
    <ul className={styles.lista} aria-label={etiqueta}>
      {filas.map((fila) => (
        <li key={fila.titulo}>
          {fila.href ? (
            fila.externo ? (
              <a href={fila.href} className={styles.fila} rel="noopener noreferrer">
                <Contenido fila={fila} />
              </a>
            ) : (
              <Link href={fila.href} className={styles.fila}>
                <Contenido fila={fila} />
              </Link>
            )
          ) : (
            <div className={styles.fila}>
              <Contenido fila={fila} />
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
