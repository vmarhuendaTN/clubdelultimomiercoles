'use client';

import { useState, type FormEvent } from 'react';
import { Button, Input, TextArea } from '@/components/ui';
import { BuscadorLibros } from '@/features/book-search';
import type { LibroConDetalles } from '../../types';
import styles from './EditorLibroDetalles.module.css';

const VACIO: LibroConDetalles = {
  titulo: '',
  autor: '',
  anio: '',
  paginas: '',
  sinopsis: '',
  nota: '',
};

type EditorLibroDetallesProps = {
  /** Al editar, el libro tal y como está; al añadir, nada. */
  inicial?: LibroConDetalles;
  textoBoton: string;
  ocupado: boolean;
  /** Devuelve true si se ha guardado (entonces se vacía el formulario). */
  onGuardar: (libro: LibroConDetalles) => Promise<boolean>;
  onCancelar?: () => void;
};

/**
 * Título, autor, año, páginas, sinopsis y nota de un libro recomendado o candidato. El buscador
 * de Google Libros rellena lo que encuentre; todo se puede corregir a mano.
 */
export function EditorLibroDetalles({
  inicial,
  textoBoton,
  ocupado,
  onGuardar,
  onCancelar,
}: EditorLibroDetallesProps) {
  const [libro, setLibro] = useState<LibroConDetalles>({ ...VACIO, ...inicial });
  const [error, setError] = useState<string>();
  const cambiar = (campo: keyof LibroConDetalles) => (e: { target: { value: string } }) => {
    setLibro((l) => ({ ...l, [campo]: e.target.value }));
    if (campo === 'titulo') setError(undefined);
  };

  async function guardar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!libro.titulo.trim()) {
      setError('Escribe el título.');
      return;
    }
    if ((await onGuardar(libro)) && !inicial) setLibro(VACIO);
  }

  return (
    <div className={styles.editor}>
      {!inicial && (
        <BuscadorLibros
          onElegir={(l) => {
            setLibro((actual) => ({
              ...actual,
              titulo: l.titulo,
              autor: l.autores.join(', '),
              anio: l.anio || actual.anio,
              paginas: l.paginas || actual.paginas,
              sinopsis: l.sinopsis || actual.sinopsis,
            }));
            setError(undefined);
          }}
        />
      )}
      <form className={styles.formulario} onSubmit={(e) => void guardar(e)} noValidate>
        <div className={styles.fila}>
          <Input
            label="Título"
            value={libro.titulo}
            error={error}
            onChange={cambiar('titulo')}
            className={styles.crece}
          />
          <Input
            label="Autor o autora"
            value={libro.autor}
            onChange={cambiar('autor')}
            className={styles.crece}
          />
        </div>
        <div className={styles.fila}>
          <Input
            label="Año de publicación"
            inputMode="numeric"
            value={libro.anio ?? ''}
            onChange={cambiar('anio')}
            className={styles.corto}
          />
          <Input
            label="Páginas"
            ayuda="Por ejemplo: 832 o «832 aprox.»"
            value={libro.paginas ?? ''}
            onChange={cambiar('paginas')}
            className={styles.crece}
          />
        </div>
        <TextArea
          label="Sinopsis"
          rows={3}
          value={libro.sinopsis ?? ''}
          onChange={cambiar('sinopsis')}
        />
        <TextArea
          label="Nota sobre este libro"
          ayuda="Edición, traducción… (opcional)"
          rows={2}
          value={libro.nota ?? ''}
          onChange={cambiar('nota')}
        />
        <div className={styles.botones}>
          <Button type="submit" icono={inicial ? 'editar' : 'anadir'} disabled={ocupado}>
            {textoBoton}
          </Button>
          {onCancelar && (
            <Button type="button" variant="sencillo" onClick={onCancelar}>
              Cancelar
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
