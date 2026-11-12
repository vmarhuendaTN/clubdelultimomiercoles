'use client';

import { useEffect, useState } from 'react';
import { Button, TextArea } from '@/components/ui';
import styles from './NotaSesionEditor.module.css';

type NotaSesionEditorProps = {
  /** «Enero de 2027». */
  etiqueta: string;
  nota: string;
  esAdmin: boolean;
  ocupado: boolean;
  onGuardar: (nota: string) => void;
};

/** Notas del club para una sesión: salen en el formulario de propuestas y en la votación. */
export function NotaSesionEditor({
  etiqueta,
  nota,
  esAdmin,
  ocupado,
  onGuardar,
}: NotaSesionEditorProps) {
  const [texto, setTexto] = useState(nota);
  useEffect(() => setTexto(nota), [nota]);

  if (!esAdmin) {
    return nota ? <p className={styles.solo}>{nota}</p> : null;
  }
  return (
    <div className={styles.editor}>
      <TextArea
        label={`Notas del club para ${etiqueta}`}
        ayuda="Salen en el formulario de propuestas y en la votación. Separa cada nota con una línea en blanco."
        rows={3}
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
      />
      <div>
        <Button
          variant="secundario"
          disabled={ocupado || texto.trim() === nota.trim()}
          onClick={() => onGuardar(texto.trim())}
        >
          Guardar notas
        </Button>
      </div>
    </div>
  );
}
