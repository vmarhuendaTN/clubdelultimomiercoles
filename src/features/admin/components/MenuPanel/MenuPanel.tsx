'use client';

import { useState } from 'react';
import { BottomSheet, Icon } from '@/components/ui';
import type { Enlace } from '../../services/api';
import { definicion, type GrupoSecciones, type Seccion } from '../../services/secciones';
import styles from './MenuPanel.module.css';

type MenuPanelProps = {
  grupos: GrupoSecciones[];
  actual: Seccion;
  onCambiar: (s: Seccion) => void;
  /** Accesos directos (pestaña Enlaces de la hoja): se abren en otra pestaña. */
  enlaces?: Enlace[];
  /** Cosas que revisar en Estado (se muestra el número junto a «Estado»). */
  avisos?: number;
};

function Lista({ grupos, actual, onCambiar, enlaces = [], avisos = 0 }: MenuPanelProps) {
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
                  <span className={styles.etiqueta}>{s.etiqueta}</span>
                  {s.id === 'estado' && avisos > 0 && (
                    <span className={styles.contador}>
                      {avisos}
                      <span className="visually-hidden"> que revisar</span>
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
      {enlaces.length > 0 && (
        <div className={styles.grupo}>
          <p className={styles.grupoTitulo}>Drive</p>
          <ul className={styles.lista}>
            {enlaces.map((e) => (
              <li key={e.url}>
                <a
                  href={e.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.item}
                  title={e.descripcion || undefined}
                >
                  <Icon name="externo" size="sm" />
                  <span className={styles.etiqueta}>{e.nombre}</span>
                  <span className="visually-hidden"> (se abre en otra pestaña)</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
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
          aria-label={`Sección: ${actual.etiqueta}. Cambiar de sección${props.avisos ? ` (${props.avisos} que revisar en Estado)` : ''}`}
        >
          <Icon name={actual.icono} size="sm" />
          <span className={styles.selectorTexto}>{actual.etiqueta}</span>
          {!!props.avisos && <span className={styles.contador}>{props.avisos}</span>}
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
