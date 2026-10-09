'use client';

import { useState } from 'react';
import { Icon } from '../Icon';
import { Input, type InputProps } from '../Input';
import styles from './PasswordField.module.css';

type PasswordFieldProps = Omit<InputProps, 'type' | 'accesorio' | 'autoComplete'> & {
  /** `current-password` al entrar, `new-password` al crear o cambiar. */
  autoComplete: 'current-password' | 'new-password';
};

export function PasswordField(props: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  return (
    <Input
      {...props}
      type={visible ? 'text' : 'password'}
      autoCapitalize="none"
      spellCheck={false}
      accesorio={
        <button
          type="button"
          className={styles.toggle}
          aria-pressed={visible}
          aria-label="Mostrar contraseña"
          onClick={() => setVisible((v) => !v)}
        >
          <Icon name={visible ? 'ocultar' : 'ver'} />
        </button>
      }
    />
  );
}
