'use client';

import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import styles from './ExpandableText.module.css';

/** Texto recortado a 6 líneas con "Leer más" si no cabe (DISENO § 4, ficha de libro). */
export function ExpandableText({ children }: { children: ReactNode }) {
  const id = useId();
  const ref = useRef<HTMLDivElement>(null);
  const [abierto, setAbierto] = useState(false);
  const [recortado, setRecortado] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (el) setRecortado(el.scrollHeight > el.clientHeight + 1);
  }, []);

  return (
    <div>
      <div id={id} ref={ref} className={abierto ? undefined : styles.recortado}>
        {children}
      </div>
      {(recortado || abierto) && (
        <button
          type="button"
          className={styles.boton}
          aria-expanded={abierto}
          aria-controls={id}
          onClick={() => setAbierto((v) => !v)}
        >
          {abierto ? 'Leer menos' : 'Leer más'}
        </button>
      )}
    </div>
  );
}
