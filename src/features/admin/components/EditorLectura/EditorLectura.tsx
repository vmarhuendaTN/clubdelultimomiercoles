'use client';

import { useId, useState } from 'react';
import { BottomSheet, Button, useToast } from '@/components/ui';
import { mensajeDeError } from '@/lib/apps-script';
import { guardarLectura, type LecturaNueva } from '../../services/api';
import type { LecturaHoja } from '../../types';
import { FormularioLectura } from '../FormularioLectura';

type EditorLecturaProps = {
  /** null = cerrada. Con `id`, edita; sin él, crea. */
  lectura: LecturaNueva | null;
  sesion: string;
  onCerrar: () => void;
  onGuardada: (lectura: LecturaHoja) => void;
  alCaducar: () => void;
};

/** Hoja modal para crear o editar una lectura y guardarla en la hoja del club. */
export function EditorLectura({
  lectura,
  sesion,
  onCerrar,
  onGuardada,
  alCaducar,
}: EditorLecturaProps) {
  const formId = useId();
  const toast = useToast();
  const [guardando, setGuardando] = useState(false);

  async function guardar(datos: LecturaNueva) {
    setGuardando(true);
    const r = await guardarLectura(sesion, datos);
    setGuardando(false);
    if (!r.ok) {
      if (r.error === 'sesion_no_valida') alCaducar();
      toast.mostrar(mensajeDeError(r.error, r.detalle), 'error');
      return;
    }
    toast.mostrar('Guardado en la hoja. Pulsa «Publicar ahora» para verlo en la web.', 'exito');
    onGuardada(r.lectura);
  }

  return (
    <BottomSheet
      open={lectura !== null}
      onClose={onCerrar}
      titulo={lectura?.id ? 'Editar lectura' : 'Nueva lectura'}
      acciones={
        <>
          <Button variant="secundario" type="button" onClick={onCerrar}>
            Cancelar
          </Button>
          <Button type="submit" form={formId} disabled={guardando}>
            {guardando ? 'Guardando…' : 'Guardar'}
          </Button>
        </>
      }
    >
      {lectura && (
        <FormularioLectura
          key={lectura.id ?? 'nueva'}
          id={formId}
          inicial={lectura}
          onGuardar={(d) => void guardar(d)}
        />
      )}
    </BottomSheet>
  );
}
