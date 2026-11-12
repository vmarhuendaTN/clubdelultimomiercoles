import { Button, Skeleton } from '@/components/ui';
import { mensajeDeError, type ErrorApi } from '@/lib/apps-script';
import styles from './EstadoCarga.module.css';

type EstadoCargaProps =
  | { tipo: 'cargando'; texto: string }
  | { tipo: 'error'; error: ErrorApi; onReintentar: () => void };

/** Esqueleto mientras carga una lista, o el error con «Reintentar». */
export function EstadoCarga(props: EstadoCargaProps) {
  if (props.tipo === 'cargando') {
    return (
      <div className={styles.cargando} aria-busy="true">
        <p className="visually-hidden">{props.texto}</p>
        <Skeleton ancho="completo" />
        <Skeleton ancho="medio" />
        <Skeleton ancho="corto" />
      </div>
    );
  }
  return (
    <div className={styles.error} role="alert">
      <p>{mensajeDeError(props.error)} Si sigue, mira «Estado» en el menú.</p>
      <Button variant="secundario" size="sm" icono="recargar" onClick={props.onReintentar}>
        Reintentar
      </Button>
    </div>
  );
}
