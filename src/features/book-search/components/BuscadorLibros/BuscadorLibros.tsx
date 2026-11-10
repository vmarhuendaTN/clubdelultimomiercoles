'use client';

import Image from 'next/image';
import { useEffect, useId, useRef, useState } from 'react';
import { Icon, Input } from '@/components/ui';
import { buscarLibros, mensajeDeError, type LibroEncontrado } from '@/lib/apps-script';
import styles from './BuscadorLibros.module.css';

type BuscadorLibrosProps = {
  /** Se llama al elegir un resultado. */
  onElegir: (libro: LibroEncontrado) => void;
  label?: string;
  ayuda?: string;
  /** Inyectable en tests. */
  buscar?: typeof buscarLibros;
};

const ESPERA_MS = 450;
const MINIMO = 3;

type Estado =
  | { tipo: 'inicial' }
  | { tipo: 'buscando' }
  | { tipo: 'resultados'; libros: LibroEncontrado[] }
  | { tipo: 'error'; mensaje: string };

/** Busca en Google Libros mientras se escribe y deja elegir un resultado. */
export function BuscadorLibros({
  onElegir,
  label = 'Buscar en Google Libros',
  ayuda = 'Escribe el título (y si quieres, el autor) y elige el libro: rellenamos el resto.',
  buscar = buscarLibros,
}: BuscadorLibrosProps) {
  const [texto, setTexto] = useState('');
  const [estado, setEstado] = useState<Estado>({ tipo: 'inicial' });
  const ultima = useRef(0);
  const listaId = useId();

  useEffect(() => {
    const consulta = texto.trim();
    if (consulta.length < MINIMO) {
      setEstado({ tipo: 'inicial' });
      return;
    }
    const numero = ++ultima.current;
    const temporizador = window.setTimeout(async () => {
      setEstado({ tipo: 'buscando' });
      const r = await buscar(consulta);
      if (numero !== ultima.current) return; // llegó tarde: hay una búsqueda más nueva
      setEstado(
        r.ok
          ? { tipo: 'resultados', libros: r.libros }
          : { tipo: 'error', mensaje: mensajeDeError(r.error, r.detalle) },
      );
    }, ESPERA_MS);
    return () => window.clearTimeout(temporizador);
  }, [texto, buscar]);

  function elegir(libro: LibroEncontrado) {
    onElegir(libro);
    ultima.current++;
    setTexto('');
    setEstado({ tipo: 'inicial' });
  }

  const libros = estado.tipo === 'resultados' ? estado.libros : [];

  return (
    <div className={styles.buscador}>
      <Input
        label={label}
        ayuda={ayuda}
        type="text"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        autoComplete="off"
        enterKeyHint="search"
        aria-controls={listaId}
        accesorio={<Icon name="buscar" size="sm" className={styles.lupa} />}
      />
      <p className={styles.estado} role="status">
        {estado.tipo === 'buscando' && 'Buscando…'}
        {estado.tipo === 'error' && estado.mensaje}
        {estado.tipo === 'resultados' &&
          (libros.length === 0
            ? 'No hemos encontrado nada. Prueba con otras palabras o escríbelo a mano.'
            : `${libros.length} ${libros.length === 1 ? 'resultado' : 'resultados'}`)}
      </p>
      <ul id={listaId} className={styles.resultados} aria-label="Resultados de Google Libros">
        {libros.map((libro) => (
          <li key={libro.id}>
            <button type="button" className={styles.resultado} onClick={() => elegir(libro)}>
              {libro.portada ? (
                <Image
                  src={libro.portada}
                  alt=""
                  width={48}
                  height={72}
                  className={styles.portada}
                />
              ) : (
                <span className={styles.portada} aria-hidden="true">
                  <Icon name="libro" size="sm" />
                </span>
              )}
              <span className={styles.datos}>
                <span className={styles.titulo}>{libro.titulo}</span>
                <span className={styles.meta}>
                  {[libro.autores.join(', '), libro.anio].filter(Boolean).join(' · ')}
                </span>
              </span>
              <Icon name="anadir" size="sm" className={styles.mas} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
