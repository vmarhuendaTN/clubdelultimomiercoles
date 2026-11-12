import { Button, Icon } from '@/components/ui';
import { problemas, type Comprobacion } from '../../services/comprobaciones';
import styles from './AlertasSistema.module.css';

type AlertasSistemaProps = {
  comprobaciones: Comprobacion[];
  /** Lleva a la sección Estado, con los pasos para arreglarlo. */
  onVer: () => void;
};

/** Aviso arriba del panel si algo no funciona. Sin problemas, no se ve. */
export function AlertasSistema({ comprobaciones, onVer }: AlertasSistemaProps) {
  const lista = problemas(comprobaciones);
  if (lista.length === 0) return null;
  const hayErrores = lista.some((c) => c.estado === 'error');
  return (
    <div className={hayErrores ? styles.error : styles.aviso} role="alert">
      <Icon name={hayErrores ? 'error' : 'info'} />
      <div className={styles.texto}>
        <p className={styles.titulo}>
          {hayErrores
            ? lista.length === 1
              ? 'Hay algo que no funciona'
              : `Hay ${lista.length} cosas que revisar`
            : lista.length === 1
              ? 'Hay algo que revisar'
              : `Hay ${lista.length} cosas que revisar`}
        </p>
        <ul className={styles.lista}>
          {lista.slice(0, 3).map((c) => (
            <li key={c.id}>{c.titulo}</li>
          ))}
        </ul>
      </div>
      <Button variant="secundario" size="sm" onClick={onVer}>
        Cómo arreglarlo
      </Button>
    </div>
  );
}
