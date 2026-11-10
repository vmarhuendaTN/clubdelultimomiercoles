'use client';

import { useState, type FormEvent } from 'react';
import { Button, PasswordField } from '@/components/ui';
import { mensajeDeError } from '@/lib/apps-script';
import { comprobarCodigo } from '../../services/comprobar-codigo';
import styles from './CodigoClub.module.css';

type CodigoClubProps = {
  onCorrecto: (codigo: string) => void;
  /** Error que llega de fuera (p. ej. el script rechazó un código recordado). */
  errorInicial?: string;
};

/** Pide el código de acceso del club antes de mostrar el formulario. */
export function CodigoClub({ onCorrecto, errorInicial }: CodigoClubProps) {
  const [codigo, setCodigo] = useState('');
  const [error, setError] = useState(errorInicial);
  const [comprobando, setComprobando] = useState(false);

  async function entrar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setComprobando(true);
    const r = await comprobarCodigo(codigo);
    setComprobando(false);
    if (r.ok) onCorrecto(codigo.trim());
    else if (r.error === 'codigo_incorrecto') {
      setError('El código no es correcto. Revísalo e inténtalo de nuevo.');
    } else setError(mensajeDeError(r.error, r.detalle));
  }

  return (
    <form onSubmit={(e) => void entrar(e)} className={styles.acceso} noValidate>
      <p className={styles.texto}>
        El formulario es solo para el club. Escribe el código de acceso para abrirlo.
      </p>
      <PasswordField
        label="Código de acceso"
        autoComplete="current-password"
        value={codigo}
        onChange={(e) => {
          setCodigo(e.target.value);
          setError(undefined);
        }}
        error={error}
        required
      />
      <div>
        <Button type="submit" disabled={comprobando || !codigo.trim()}>
          {comprobando ? 'Comprobando…' : 'Abrir el formulario'}
        </Button>
      </div>
    </form>
  );
}
