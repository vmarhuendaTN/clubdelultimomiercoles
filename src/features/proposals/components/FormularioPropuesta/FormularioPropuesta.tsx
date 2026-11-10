'use client';

import Image from 'next/image';
import { useState, type FormEvent } from 'react';
import { Button, Input, TextArea } from '@/components/ui';
import { BuscadorLibros, type LibroEncontrado } from '@/features/book-search';
import type { DatosPropuesta } from '../../services/enviar-propuesta';
import styles from './FormularioPropuesta.module.css';

const VACIA: DatosPropuesta = {
  titulo: '',
  autor: '',
  motivo: '',
  propuesto_por: '',
  google_books_id: '',
};

type Errores = Partial<Record<'titulo' | 'autor' | 'propuesto_por', string>>;

type FormularioPropuestaProps = {
  onEnviar: (datos: DatosPropuesta) => void;
  enviando: boolean;
  /** Error al enviar (red, código…), se anuncia encima del botón. */
  error?: string;
};

/** Campos de la propuesta, con el buscador de Google Libros para rellenarla sola. */
export function FormularioPropuesta({ onEnviar, enviando, error }: FormularioPropuestaProps) {
  const [datos, setDatos] = useState<DatosPropuesta>(VACIA);
  const [portada, setPortada] = useState('');
  const [errores, setErrores] = useState<Errores>({});

  const cambiar = (campo: keyof DatosPropuesta) => (e: { target: { value: string } }) => {
    setDatos((d) => ({ ...d, [campo]: e.target.value }));
    setErrores((er) => ({ ...er, [campo]: undefined }));
  };

  function elegir(libro: LibroEncontrado) {
    setDatos((d) => ({
      ...d,
      titulo: libro.titulo,
      autor: libro.autores.join(', ') || d.autor,
      google_books_id: libro.id,
    }));
    setPortada(libro.portada);
    setErrores({});
  }

  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const nuevos: Errores = {};
    if (!datos.titulo.trim()) nuevos.titulo = 'Escribe el título del libro.';
    if (!datos.autor.trim()) nuevos.autor = 'Escribe quién lo escribió.';
    if (!datos.propuesto_por.trim()) nuevos.propuesto_por = 'Dinos tu nombre.';
    setErrores(nuevos);
    if (Object.keys(nuevos).length === 0) onEnviar(datos);
  }

  return (
    <form className={styles.formulario} onSubmit={enviar} noValidate>
      <BuscadorLibros
        onElegir={elegir}
        label="Busca el libro"
        ayuda="Escribe el título y elígelo de la lista. Si no aparece, rellénalo a mano."
      />

      <div className={styles.libro}>
        {portada && (
          <Image src={portada} alt="" width={64} height={96} className={styles.portada} />
        )}
        <div className={styles.campos}>
          <Input
            label="Título"
            value={datos.titulo}
            onChange={(e) => {
              cambiar('titulo')(e);
              setPortada('');
              setDatos((d) => ({ ...d, google_books_id: '' }));
            }}
            error={errores.titulo}
            required
          />
          <Input
            label="Autor o autora"
            value={datos.autor}
            onChange={cambiar('autor')}
            error={errores.autor}
            required
          />
        </div>
      </div>

      <TextArea
        label="¿Por qué te apetece leerlo?"
        ayuda="Opcional. Una o dos frases para convencer al club."
        value={datos.motivo}
        onChange={cambiar('motivo')}
        maxLength={2000}
      />
      <Input
        label="Tu nombre"
        autoComplete="given-name"
        value={datos.propuesto_por}
        onChange={cambiar('propuesto_por')}
        error={errores.propuesto_por}
        maxLength={80}
        required
      />

      {error && (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      )}
      <div>
        <Button type="submit" disabled={enviando}>
          {enviando ? 'Enviando…' : 'Enviar propuesta'}
        </Button>
      </div>
    </form>
  );
}
