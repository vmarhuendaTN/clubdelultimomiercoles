import styles from './Cifra.module.css';

type CifraProps = {
  valor: number | string;
  etiqueta: string;
  /** Aclaración pequeña bajo la etiqueta. */
  detalle?: string;
};

/** Dato destacado: número grande en serif y su etiqueta (tableros del panel). */
export function Cifra({ valor, etiqueta, detalle }: CifraProps) {
  return (
    <div className={styles.cifra}>
      <span className={styles.valor}>{valor}</span>
      <span className={styles.etiqueta}>{etiqueta}</span>
      {detalle && <span className={styles.detalle}>{detalle}</span>}
    </div>
  );
}
