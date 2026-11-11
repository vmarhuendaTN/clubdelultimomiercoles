import styles from './Cifra.module.css';

type CifraProps = {
  valor: number | string;
  etiqueta: string;
  /** Aclaración pequeña bajo la etiqueta. */
  detalle?: string;
  /** Con esto la cifra es un botón (p. ej. para filtrar lo que hay debajo). */
  onPulsar?: () => void;
  /** Botón seleccionado (aria-pressed). */
  activa?: boolean;
};

/** Dato destacado: número grande en serif y su etiqueta. Pulsable para filtrar. */
export function Cifra({ valor, etiqueta, detalle, onPulsar, activa = false }: CifraProps) {
  const contenido = (
    <>
      <span className={styles.valor}>{valor}</span>
      <span className={styles.etiqueta}>{etiqueta}</span>
      {detalle && <span className={styles.detalle}>{detalle}</span>}
    </>
  );
  if (!onPulsar) return <div className={styles.cifra}>{contenido}</div>;
  return (
    <button
      type="button"
      className={`${styles.cifra} ${styles.pulsable}`}
      aria-pressed={activa}
      onClick={onPulsar}
    >
      {contenido}
    </button>
  );
}
