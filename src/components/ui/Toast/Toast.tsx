'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Icon, type IconName } from '../Icon';
import styles from './Toast.module.css';

type Tipo = 'info' | 'exito' | 'error';
type ToastItem = { id: number; mensaje: string; tipo: Tipo };
type ToastApi = { mostrar: (mensaje: string, tipo?: Tipo) => void };

const ToastContext = createContext<ToastApi | null>(null);
const DURACION_MS = 5000;
const iconos: Record<Tipo, IconName> = { info: 'info', exito: 'exito', error: 'error' };

/** Proveedor de avisos breves. Región viva siempre presente para que los lectores de pantalla la anuncien. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const nextId = useRef(0);

  const cerrar = useCallback((id: number) => {
    setItems((list) => list.filter((t) => t.id !== id));
  }, []);

  const mostrar = useCallback(
    (mensaje: string, tipo: Tipo = 'info') => {
      const id = nextId.current++;
      setItems((list) => [...list, { id, mensaje, tipo }]);
      window.setTimeout(() => cerrar(id), DURACION_MS);
    },
    [cerrar],
  );

  const api = useMemo(() => ({ mostrar }), [mostrar]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className={styles.region} role="status" aria-live="polite">
        {items.map((t) => (
          <div key={t.id} className={`${styles.toast} ${styles[t.tipo]}`}>
            <Icon name={iconos[t.tipo]} />
            <p className={styles.mensaje}>{t.mensaje}</p>
            <button
              type="button"
              className={styles.cerrar}
              onClick={() => cerrar(t.id)}
              aria-label="Cerrar aviso"
            >
              <Icon name="cerrar" size="sm" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast debe usarse dentro de <ToastProvider>');
  return ctx;
}
