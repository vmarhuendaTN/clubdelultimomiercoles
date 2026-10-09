'use client';

import { useEffect, useId, useRef, type ReactNode } from 'react';
import { Icon } from '../Icon';
import styles from './BottomSheet.module.css';

type BottomSheetProps = {
  open: boolean;
  onClose: () => void;
  titulo: string;
  children: ReactNode;
  /** Acciones al pie (botones). */
  acciones?: ReactNode;
};

/**
 * Hoja modal: sube desde abajo en móvil y es un diálogo centrado en escritorio.
 * `<dialog>` nativo: trampa de foco, Esc y devolución del foco los gestiona el navegador.
 */
export function BottomSheet({ open, onClose, titulo, children, acciones }: BottomSheetProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    // El clic en el fondo (el propio <dialog>) cierra; el teclado ya cierra con Esc.
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
    <dialog
      ref={ref}
      className={styles.sheet}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className={styles.panel}>
        <div className={styles.asa} aria-hidden="true" />
        <header className={styles.cabecera}>
          <h2 id={titleId} className={styles.titulo}>
            {titulo}
          </h2>
          <button type="button" className={styles.cerrar} onClick={onClose} aria-label="Cerrar">
            <Icon name="cerrar" />
          </button>
        </header>
        <div className={styles.contenido}>{children}</div>
        {acciones && <footer className={styles.acciones}>{acciones}</footer>}
      </div>
    </dialog>
  );
}
