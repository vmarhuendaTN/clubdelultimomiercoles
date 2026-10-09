import { Icon } from '../Icon';
import styles from './StarRating.module.css';

type StarRatingProps = {
  /** De 0 a 5; admite decimales (se pinta redondeado a la media estrella más cercana). */
  valor: number;
  tamano?: 'sm' | 'md';
};

const formato = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 1 });

/** Estrellas de solo lectura, con su valor en texto para tecnologías de apoyo. */
export function StarRating({ valor, tamano = 'md' }: StarRatingProps) {
  const redondeado = Math.round(valor * 2) / 2;
  const icono = tamano === 'sm' ? 'sm' : 'md';
  return (
    <span
      role="img"
      aria-label={`${formato.format(valor)} de 5 estrellas`}
      className={`${styles.estrellas} ${styles[tamano]}`}
    >
      {[1, 2, 3, 4, 5].map((n) => {
        const relleno = redondeado >= n ? styles.llena : redondeado >= n - 0.5 ? styles.media : '';
        return (
          <span key={n} className={styles.estrella}>
            <Icon name="estrella" size={icono} className={styles.fondo} />
            {relleno && (
              <span className={`${styles.relleno} ${relleno}`}>
                <Icon name="estrella" size={icono} />
              </span>
            )}
          </span>
        );
      })}
    </span>
  );
}
