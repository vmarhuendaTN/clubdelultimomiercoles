'use client';

import { useState } from 'react';
import { Button, TextArea } from '@/components/ui';
import { leerMensajeLibros, lineaDetalles, type MensajeLeido } from '@/lib/format';
import type { LibroConDetalles } from '../../types';
import styles from './PegarMensaje.module.css';

type PegarMensajeProps = {
  /** «Añadir a la votación», «Recomendar»… */
  textoBoton: string;
  ocupado: boolean;
  onImportar: (libros: LibroConDetalles[], notas: string) => Promise<boolean>;
};

/**
 * Pegar el mensaje que se manda al grupo («1. Título, de Autor (año) - páginas» + sinopsis, y
 * «NOTA 1: …») y añadir todos los libros con sus detalles de una vez.
 */
export function PegarMensaje({ textoBoton, ocupado, onImportar }: PegarMensajeProps) {
  const [texto, setTexto] = useState('');
  const [leido, setLeido] = useState<MensajeLeido | null>(null);
  const [error, setError] = useState<string>();

  function leer() {
    const r = leerMensajeLibros(texto);
    if (r.libros.length === 0) {
      setLeido(null);
      setError('No encuentro libros. Cada uno debe empezar por un número: «1. Título, de Autor».');
      return;
    }
    setError(undefined);
    setLeido(r);
  }

  async function importar() {
    if (!leido) return;
    if (await onImportar(leido.libros, leido.notas)) {
      setTexto('');
      setLeido(null);
    }
  }

  return (
    <div className={styles.pegar}>
      <TextArea
        label="Pega aquí el mensaje de WhatsApp"
        ayuda="Cada libro empieza por un número («1. Crimen y castigo, de Fiódor Dostoievski (1866) - 832 págs.») con la sinopsis debajo. Lo que empiece por «NOTA» se guarda como nota de la sesión."
        rows={5}
        value={texto}
        error={error}
        onChange={(e) => {
          setTexto(e.target.value);
          setLeido(null);
          setError(undefined);
        }}
      />
      <div>
        <Button variant="secundario" icono="documento" disabled={!texto.trim()} onClick={leer}>
          Leer el mensaje
        </Button>
      </div>
      {leido && (
        <div className={styles.vista} aria-live="polite">
          <p className={styles.recuento}>
            {leido.libros.length === 1 ? '1 libro' : `${leido.libros.length} libros`}
            {leido.notas ? ' y notas de la sesión' : ''}:
          </p>
          <ol className={styles.lista}>
            {leido.libros.map((l, i) => (
              <li key={i}>
                <strong>{l.titulo}</strong>
                {l.autor && `, ${l.autor}`}
                {lineaDetalles(l) && <span className={styles.detalles}> · {lineaDetalles(l)}</span>}
              </li>
            ))}
          </ol>
          <div>
            <Button icono="anadir" disabled={ocupado} onClick={() => void importar()}>
              {textoBoton}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
