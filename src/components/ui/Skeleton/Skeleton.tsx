import styles from './Skeleton.module.css';

type SkeletonProps = {
  /** `texto`: una línea; `portada`: proporción 2:3; `bloque`: rectángulo libre. */
  forma?: 'texto' | 'portada' | 'bloque' | 'circulo';
  /** Ancho relativo de la línea de texto (para alternar líneas). */
  ancho?: 'completo' | 'medio' | 'corto';
};

/**
 * Marcador de carga con brillo suave. Es decorativo: el contenedor que carga
 * debe llevar `aria-busy="true"` y un texto accesible ("Cargando lecturas…").
 */
export function Skeleton({ forma = 'texto', ancho = 'completo' }: SkeletonProps) {
  return (
    <span aria-hidden="true" className={`${styles.skeleton} ${styles[forma]} ${styles[ancho]}`} />
  );
}
