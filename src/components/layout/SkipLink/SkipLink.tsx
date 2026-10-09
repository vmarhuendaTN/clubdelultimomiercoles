import styles from './SkipLink.module.css';

export const MAIN_ID = 'contenido';

/** Primer elemento enfocable de la página (DISENO § 5). */
export function SkipLink() {
  return (
    <a href={`#${MAIN_ID}`} className={styles.skip}>
      Saltar al contenido
    </a>
  );
}
