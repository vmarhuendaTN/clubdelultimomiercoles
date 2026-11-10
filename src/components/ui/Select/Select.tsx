import { useId, type ComponentPropsWithRef } from 'react';
import { Icon } from '../Icon';
import styles from './Select.module.css';

export type Opcion = { value: string; label: string };

export type SelectProps = Omit<ComponentPropsWithRef<'select'>, 'id' | 'children'> & {
  /** Etiqueta siempre visible. */
  label: string;
  opciones: readonly Opcion[];
  ayuda?: string;
  error?: string;
  id?: string;
};

/** Desplegable nativo con el aspecto de los campos de la web. */
export function Select({ label, opciones, ayuda, error, id, className, ...rest }: SelectProps) {
  const autoId = useId();
  const campoId = id ?? autoId;
  const ayudaId = `${campoId}-ayuda`;
  const errorId = `${campoId}-error`;
  const describedBy = [ayuda && ayudaId, error && errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={[styles.field, className].filter(Boolean).join(' ')}>
      <label className={styles.label} htmlFor={campoId}>
        {label}
        {rest.required && <span aria-hidden="true"> *</span>}
      </label>
      <div className={styles.control}>
        <select
          id={campoId}
          className={styles.select}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          {...rest}
        >
          {opciones.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <Icon name="abajo" size="sm" className={styles.flecha} />
      </div>
      {ayuda && (
        <p id={ayudaId} className={styles.ayuda}>
          {ayuda}
        </p>
      )}
      <p id={errorId} className={styles.error} aria-live="polite">
        {error}
      </p>
    </div>
  );
}
