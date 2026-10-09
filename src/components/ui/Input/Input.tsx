import { useId, type ComponentPropsWithRef, type ReactNode } from 'react';
import styles from './Input.module.css';

export type InputProps = Omit<ComponentPropsWithRef<'input'>, 'id'> & {
  /** Etiqueta siempre visible (nunca solo placeholder). */
  label: string;
  ayuda?: string;
  /** Mensaje de error en línea; se anuncia con aria-live. */
  error?: string;
  id?: string;
  /** Elemento al final del campo (p. ej. botón de mostrar contraseña). */
  accesorio?: ReactNode;
};

export function Input({ label, ayuda, error, id, accesorio, className, ...rest }: InputProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const ayudaId = `${inputId}-ayuda`;
  const errorId = `${inputId}-error`;
  const describedBy = [ayuda && ayudaId, error && errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={[styles.field, className].filter(Boolean).join(' ')}>
      <label className={styles.label} htmlFor={inputId}>
        {label}
        {rest.required && <span aria-hidden="true"> *</span>}
      </label>
      <div className={styles.control}>
        <input
          id={inputId}
          className={styles.input}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          {...rest}
        />
        {accesorio && <div className={styles.accesorio}>{accesorio}</div>}
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
