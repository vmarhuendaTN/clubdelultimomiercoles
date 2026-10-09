import { StarRating } from '@/components/ui';
import { formatFecha } from '@/lib/format';
import type { Valoracion } from '../../types';
import styles from './ReviewList.module.css';

/** Opiniones publicadas: nombre, estrellas, fecha y texto. */
export function ReviewList({ valoraciones }: { valoraciones: readonly Valoracion[] }) {
  return (
    <ul role="list" className={styles.lista}>
      {valoraciones.map((v) => (
        <li key={v.id}>
          <article className={styles.opinion}>
            <header className={styles.cabecera}>
              <h3 className={styles.autor}>{v.autorNombre}</h3>
              <StarRating valor={v.estrellas} tamano="sm" />
              <time dateTime={v.actualizadoEn} className={styles.fecha}>
                {formatFecha(v.actualizadoEn.slice(0, 10))}
              </time>
            </header>
            {v.opinion && <p className={styles.texto}>{v.opinion}</p>}
          </article>
        </li>
      ))}
    </ul>
  );
}
