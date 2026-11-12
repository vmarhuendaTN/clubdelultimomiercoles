'use client';

import { useState } from 'react';
import { BottomSheet, Icon } from '@/components/ui';
import { definicion, type GrupoSecciones, type Seccion } from '../../services/secciones';
import styles from './MenuPanel.module.css';

type MenuPanelProps = {
  grupos: GrupoSecciones[];
  actual: Seccion;
  onCambiar: (s: Seccion) => void;
};

function Lista({ grupos, actual, onCambiar }: MenuPanelProps) {
  return (
    <div className={styles.grupos}>
      {grupos.map((g) => (
        <div key={g.titulo} className={styles.grupo}>
          <p className={styles.grupoTitulo}>{g.titulo}</p>
          <ul className={styles.lista}>
            {g.secciones.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  className={styles.item}
                  aria-current={s.id === actual ? 'page' : undefined}
                  onClick={() => onCambiar(s.id)}
                >
                  <Icon name={s.icono} size="sm" />
                  <span>{s.etiqueta}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

/**
 * Navegación del panel, de un solo nivel. En escritorio, columna lateral fija; en móvil, un
 * botón con la sección actual que abre la lista completa en una hoja (nada queda escondido).
 */
export function MenuPanel(props: MenuPanelProps) {
  const [abierto, setAbierto] = useState(false);
  const actual = definicion(props.actual);
  return (
    <>
      <nav aria-label="Secciones del panel" className={styles.lateral}>
        <Lista {...props} />
      </nav>

      <div className={styles.movil}>
        <button
          type="button"
          className={styles.selector}
          onClick={() => setAbierto(true)}
          aria-haspopup="dialog"
          aria-label={`Sección: ${actual.etiqueta}. Cambiar de sección`}
        >
          <Icon name={actual.icono} size="sm" />
          <span className={styles.selectorTexto}>{actual.etiqueta}</span>
          <Icon name="abajo" size="sm" />
        </button>
      </div>
      <BottomSheet open={abierto} onClose={() => setAbierto(false)} titulo="Ir a…">
        {abierto && (
          <nav aria-label="Secciones del panel (móvil)">
            <Lista
              {...props}
              onCambiar={(s) => {
                setAbierto(false);
                props.onCambiar(s);
              }}
            />
          </nav>
        )}
      </BottomSheet>
    </>
  );
}
