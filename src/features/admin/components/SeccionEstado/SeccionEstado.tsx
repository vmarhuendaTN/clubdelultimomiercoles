import { Button, Icon, type IconName } from '@/components/ui';
import type { Comprobacion, EstadoComprobacion } from '../../services/comprobaciones';
import { definicion, type Seccion } from '../../services/secciones';
import styles from './SeccionEstado.module.css';

type SeccionEstadoProps = {
  comprobaciones: Comprobacion[];
  onRecargar: () => void;
  onIrA: (s: Seccion) => void;
};

const ICONO: Record<EstadoComprobacion, IconName> = {
  ok: 'exito',
  aviso: 'info',
  error: 'error',
  cargando: 'recargar',
};
const ETIQUETA: Record<EstadoComprobacion, string> = {
  ok: 'Funciona',
  aviso: 'Revisar',
  error: 'No funciona',
  cargando: 'Comprobando',
};

/** Estado del sistema: cada cosa que puede fallar, si funciona y cómo arreglarla. */
export function SeccionEstado({ comprobaciones, onRecargar, onIrA }: SeccionEstadoProps) {
  return (
    <div className={styles.seccion}>
      <div>
        <Button variant="secundario" size="sm" icono="recargar" onClick={onRecargar}>
          Volver a comprobar
        </Button>
      </div>
      <ul className={styles.lista} aria-label="Comprobaciones">
        {comprobaciones.map((c) => (
          <li key={c.id} className={styles.fila} data-estado={c.estado}>
            <span className={styles.icono}>
              <Icon name={ICONO[c.estado]} label={ETIQUETA[c.estado]} />
            </span>
            <div className={styles.cuerpo}>
              <h3 className={styles.titulo}>{c.titulo}</h3>
              <p className={styles.detalle}>{c.detalle}</p>
              {c.solucion && (
                <p className={styles.solucion}>
                  <strong>Cómo arreglarlo:</strong> {c.solucion}
                </p>
              )}
              {(c.enlace || c.irA) && (
                <div className={styles.acciones}>
                  {c.enlace && (
                    <Button href={c.enlace.url} variant="secundario" size="sm" icono="externo">
                      {c.enlace.texto}
                    </Button>
                  )}
                  {c.irA && (
                    <Button variant="primario" size="sm" onClick={() => c.irA && onIrA(c.irA)}>
                      Ir a {definicion(c.irA).etiqueta}
                    </Button>
                  )}
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
