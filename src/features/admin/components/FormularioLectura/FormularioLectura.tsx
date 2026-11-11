'use client';

import { useId, useState, type FormEvent } from 'react';
import { Button, Input, Pill, Select, TextArea } from '@/components/ui';
import { BuscadorLibros, type LibroEncontrado } from '@/features/book-search';
import type { LecturaNueva } from '../../services/api';
import { ESTADOS_LECTURA } from '../../services/etiquetas';
import styles from './FormularioLectura.module.css';

export const LECTURA_VACIA: LecturaNueva = {
  titulo: '',
  autor: '',
  estado: 'proximo',
  orden: '',
  fecha_sesion: '',
  fecha_sesion_2: '',
  isbn: '',
  google_books_id: '',
  portada_manual: '',
  descripcion_manual: '',
  nota_club: '',
  visible: 'si',
  revisar: '',
};

const VISIBLE = [
  { value: 'si', label: 'Sí, se ve en la web' },
  { value: 'no', label: 'No, oculta' },
];

type Errores = Partial<Record<'titulo' | 'autor' | 'portada_manual' | 'orden', string>>;

function validar(l: LecturaNueva): Errores {
  const e: Errores = {};
  if (!l.titulo.trim()) e.titulo = 'Escribe el título.';
  if (!l.autor.trim()) e.autor = 'Escribe el autor o la autora.';
  if (l.portada_manual && !/^https:\/\/\S+$/.test(l.portada_manual)) {
    e.portada_manual = 'Tiene que ser un enlace que empiece por https://';
  }
  if (l.orden && !/^-?\d+$/.test(l.orden)) e.orden = 'Solo números enteros.';
  return e;
}

type FormularioLecturaProps = {
  inicial?: LecturaNueva;
  /** Id del <form>, para poner el botón de guardar fuera (en el pie de la hoja). */
  id: string;
  onGuardar: (lectura: LecturaNueva) => void;
};

/** Alta y edición de una lectura. Con el buscador se rellena la ficha de Google Libros. */
export function FormularioLectura({
  inicial = LECTURA_VACIA,
  id,
  onGuardar,
}: FormularioLecturaProps) {
  const [l, setL] = useState<LecturaNueva>(inicial);
  const [errores, setErrores] = useState<Errores>({});
  const avanzadasId = useId();

  const cambiar = (campo: keyof LecturaNueva) => (e: { target: { value: string } }) => {
    setL((actual) => ({ ...actual, [campo]: e.target.value }));
    setErrores((actuales) => ({ ...actuales, [campo]: undefined }));
  };

  function elegir(libro: LibroEncontrado) {
    setL((actual) => ({
      ...actual,
      titulo: libro.titulo,
      autor: libro.autores.join(', ') || actual.autor,
      isbn: libro.isbn,
      google_books_id: libro.id,
    }));
    setErrores({});
  }

  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const nuevos = validar(l);
    setErrores(nuevos);
    if (Object.keys(nuevos).length === 0) onGuardar(l);
  }

  return (
    <form id={id} className={styles.formulario} onSubmit={enviar} noValidate>
      <BuscadorLibros onElegir={elegir} />

      {l.google_books_id && (
        <div className={styles.ficha}>
          <Pill variant="mostaza">Ficha de Google Libros</Pill>
          <span className={styles.fichaId}>{l.google_books_id}</span>
          <Button
            variant="sencillo"
            size="sm"
            type="button"
            onClick={() => setL((a) => ({ ...a, google_books_id: '', isbn: '' }))}
          >
            Quitar
          </Button>
        </div>
      )}

      <Input
        label="Título"
        value={l.titulo}
        onChange={cambiar('titulo')}
        error={errores.titulo}
        required
      />
      <Input
        label="Autor o autora"
        value={l.autor}
        onChange={cambiar('autor')}
        error={errores.autor}
        required
      />

      <div className={styles.fila}>
        <Select
          label="Estado"
          opciones={ESTADOS_LECTURA}
          value={l.estado}
          onChange={cambiar('estado')}
        />
      </div>
      <div className={styles.fila}>
        <Input
          label="Quedada del Club 1"
          type="date"
          value={l.fecha_sesion}
          onChange={cambiar('fecha_sesion')}
        />
        <Input
          label="Quedada del Club 2"
          type="date"
          value={l.fecha_sesion_2 ?? ''}
          onChange={cambiar('fecha_sesion_2')}
          ayuda="Los dos clubs leen el mismo libro, cada uno en su fecha."
        />
      </div>

      <TextArea
        label="Nota del club"
        ayuda="Opcional. Se muestra en la ficha del libro."
        value={l.nota_club}
        onChange={cambiar('nota_club')}
        maxLength={2000}
        rows={3}
      />

      <Select
        label="Visible en la web"
        opciones={VISIBLE}
        value={l.visible || 'si'}
        onChange={cambiar('visible')}
      />

      <details className={styles.avanzadas}>
        <summary id={avanzadasId} className={styles.resumen}>
          Más opciones
        </summary>
        <div className={styles.contenido}>
          <Input
            label="Orden"
            inputMode="numeric"
            ayuda="Para ordenar los leídos: 1 es el primero que leímos."
            value={l.orden}
            onChange={cambiar('orden')}
            error={errores.orden}
          />
          <Input label="ISBN" inputMode="numeric" value={l.isbn} onChange={cambiar('isbn')} />
          <Input
            label="ID de Google Libros"
            ayuda="Fija la edición exacta. Lo rellena el buscador."
            value={l.google_books_id}
            onChange={cambiar('google_books_id')}
          />
          <Input
            label="Portada propia (enlace)"
            type="url"
            ayuda="Solo si la de Google no es buena. Gana a la automática."
            value={l.portada_manual}
            onChange={cambiar('portada_manual')}
            error={errores.portada_manual}
          />
          <TextArea
            label="Sinopsis propia"
            ayuda="Solo si la de Google no sirve. Gana a la automática."
            value={l.descripcion_manual}
            onChange={cambiar('descripcion_manual')}
            maxLength={2000}
          />
        </div>
      </details>
    </form>
  );
}
