'use client';

import { useId } from 'react';
import { Icon } from '../Icon';
import styles from './SearchField.module.css';

type SearchFieldProps = {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
};

/** Barra de búsqueda estilo iOS. La etiqueta es accesible aunque no se vea. */
export function SearchField({ label, placeholder, value, onChange }: SearchFieldProps) {
  const id = useId();
  return (
    <div className={styles.campo} role="search">
      <label htmlFor={id} className="visually-hidden">
        {label}
      </label>
      <Icon name="buscar" size="sm" className={styles.icono} />
      <input
        id={id}
        type="search"
        className={styles.input}
        placeholder={placeholder ?? label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="off"
        enterKeyHint="search"
      />
    </div>
  );
}
