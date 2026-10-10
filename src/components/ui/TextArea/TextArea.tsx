import { useId, type ComponentPropsWithRef } from 'react';
import styles from './TextArea.module.css';

export type TextAreaProps = Omit<ComponentPropsWithRef<'textarea'>, 'id'> & {
  /** Etiqueta siempre visible (nunca solo placeholder). */
  label: string;
  ayuda?: string;
  /** Mensaje de error en línea; se anuncia con aria-live. */
  error?: string;
  id?: string;
};

/** Campo de texto largo con la misma anatomía que `Input`. */
export function TextArea({ label, ayuda, error, id, className, ...rest }: TextAreaProps) {
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
      <textarea
        id={campoId}
        className={styles.textarea}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        rows={4}
        {...rest}
      />
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
