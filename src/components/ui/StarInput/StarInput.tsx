'use client';

import { useId } from 'react';
import { Icon } from '../Icon';
import styles from './StarInput.module.css';

type StarInputProps = {
  legend: string;
  value: number;
  onChange: (value: number) => void;
  name?: string;
};

const ETIQUETAS = ['1 estrella', '2 estrellas', '3 estrellas', '4 estrellas', '5 estrellas'];

/**
 * Selector de 1 a 5 estrellas con radios nativos: flechas, Tab y lectores de pantalla
 * funcionan sin código extra. Visualmente, estrellas grandes (≥ 44 px de área táctil).
 */
export function StarInput({ legend, value, onChange, name }: StarInputProps) {
  const autoName = useId();
  const grupo = name ?? autoName;
  return (
    <fieldset className={styles.campo}>
      <legend className={styles.legend}>{legend}</legend>
      <div className={styles.estrellas}>
        {ETIQUETAS.map((etiqueta, i) => {
          const n = i + 1;
          return (
            <label key={n} className={`${styles.estrella} ${value >= n ? styles.activa : ''}`}>
              <input
                type="radio"
                name={grupo}
                value={n}
                checked={value === n}
                onChange={() => onChange(n)}
                className="visually-hidden"
              />
              <Icon name="estrella" size="lg" />
              <span className="visually-hidden">{etiqueta}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
