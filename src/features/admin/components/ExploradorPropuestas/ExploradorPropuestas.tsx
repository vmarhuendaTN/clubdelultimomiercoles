'use client';

import { useState } from 'react';
import { Button, Cifra, Pill, SearchField } from '@/components/ui';
import { normalizar } from '../../services/etiquetas';
import type { LibroPropuesto, Resumen } from '../../services/resumen-propuestas';
import { RankingLibros } from '../RankingLibros';
import styles from './ExploradorPropuestas.module.css';

/** Cómo se miran los datos: cada cifra de arriba es un filtro. */
type Lente = 'libros' | 'coincidencias' | 'otras' | 'personas';

const DESCRIPCION: Record<Lente, string> = {
  libros: 'Todos los libros propuestos, del más apoyado al menos.',
  coincidencias: 'Solo los libros que ha propuesto más de una persona.',
  otras: 'Libros que ya se habían propuesto en otras sesiones.',
  personas: 'Lo que ha propuesto cada persona (su último envío).',
};

const ORDINAL = ['1.ª', '2.ª', '3.ª'] as const;

type ExploradorPropuestasProps = {
  resumen: Resumen;
  onAnadir: (libro: LibroPropuesto) => void;
  candidatas?: ReadonlySet<string>;
  onCandidata?: (libro: LibroPropuesto) => void;
};

/**
 * Resumen de la sesión como buscador: las cifras filtran o agrupan, el buscador encuentra libros
 * o personas, y al pulsar un nombre se ve todo lo de esa persona.
 */
export function ExploradorPropuestas({
  resumen,
  onAnadir,
  candidatas,
  onCandidata,
}: ExploradorPropuestasProps) {
  const [lente, setLente] = useState<Lente>('libros');
  const [busqueda, setBusqueda] = useState('');
  const q = normalizar(busqueda.trim());
  const coincide = (texto: string) => !q || normalizar(texto).includes(q);

  const base =
    lente === 'coincidencias'
      ? resumen.libros.filter((l) => l.votos > 1)
      : lente === 'otras'
        ? resumen.libros.filter((l) => l.otrosPeriodos.length > 0)
        : resumen.libros;
  const libros = base.filter(
    (l) => coincide(l.texto) || l.personas.some((p) => coincide(p.nombre)),
  );

  const personas = resumen.porPersona.filter(
    (p) => coincide(p.nombre) || p.libros.some((l) => coincide(l.texto)),
  );

  const elegir = (nueva: Lente) => setLente((actual) => (actual === nueva ? 'libros' : nueva));
  const filtrado = lente !== 'libros' || q !== '';
  const total = lente === 'personas' ? personas.length : libros.length;

  return (
    <div className={styles.explorador}>
      <div className={styles.cifras} role="group" aria-label="Filtrar el resumen">
        <Cifra
          valor={resumen.libros.length}
          etiqueta="Libros distintos"
          detalle="ver todos"
          activa={lente === 'libros'}
          onPulsar={() => setLente('libros')}
        />
        <Cifra
          valor={resumen.coincidencias}
          etiqueta="Coincidencias"
          detalle="propuestos por varias personas"
          activa={lente === 'coincidencias'}
          onPulsar={() => elegir('coincidencias')}
        />
        <Cifra
          valor={resumen.deOtrasSesiones}
          etiqueta="Ya propuestos antes"
          detalle="en otras sesiones"
          activa={lente === 'otras'}
          onPulsar={() => elegir('otras')}
        />
        <Cifra
          valor={resumen.personas}
          etiqueta="Personas"
          detalle="ver por persona"
          activa={lente === 'personas'}
          onPulsar={() => elegir('personas')}
        />
      </div>

      <div className={styles.barra}>
        <SearchField
          label="Buscar libro o persona"
          placeholder="Buscar libro o persona"
          value={busqueda}
          onChange={setBusqueda}
        />
        <p className={styles.estado} aria-live="polite">
          {DESCRIPCION[lente]} {q && `Coinciden con «${busqueda.trim()}»: `}
          <strong>
            {total}{' '}
            {lente === 'personas'
              ? total === 1
                ? 'persona'
                : 'personas'
              : total === 1
                ? 'libro'
                : 'libros'}
          </strong>
          .
        </p>
        {filtrado && (
          <Button
            variant="sencillo"
            size="sm"
            icono="cerrar"
            onClick={() => {
              setLente('libros');
              setBusqueda('');
            }}
          >
            Quitar filtros
          </Button>
        )}
      </div>

      {resumen.repetidos.length > 0 && (
        <p className={styles.aviso} role="note">
          {resumen.repetidos.join(', ')}{' '}
          {resumen.repetidos.length === 1 ? 'ha enviado' : 'han enviado'} el formulario más de una
          vez: cuenta una sola vez por libro.
        </p>
      )}

      {lente === 'personas' ? (
        personas.length === 0 ? (
          <p className={styles.vacio}>Nadie coincide con la búsqueda.</p>
        ) : (
          <ul className={styles.personas} aria-label="Propuestas por persona">
            {personas.map((p) => (
              <li key={p.nombre} className={styles.persona}>
                <div className={styles.personaCabecera}>
                  <h4 className={styles.personaNombre}>{p.nombre}</h4>
                  <span className={styles.meta}>
                    {[p.grupo && `Grupo ${p.grupo}`, p.envios > 1 && `${p.envios} envíos`]
                      .filter(Boolean)
                      .join(' · ')}
                  </span>
                </div>
                <ol className={styles.librosPersona}>
                  {p.libros.map((l) => (
                    <li key={`${l.posicion}-${l.clave}`}>
                      <span className={styles.ordinal}>{ORDINAL[l.posicion - 1]}</span>
                      <button
                        type="button"
                        className={styles.enlace}
                        onClick={() => {
                          setLente('libros');
                          setBusqueda(l.texto.split(',')[0] ?? l.texto);
                        }}
                        aria-label={`Ver «${l.texto}» en la clasificación`}
                      >
                        {l.texto}
                      </button>
                      {l.coincide > 0 && (
                        <Pill variant="mostaza">
                          +{l.coincide} {l.coincide === 1 ? 'persona' : 'personas'}
                        </Pill>
                      )}
                    </li>
                  ))}
                </ol>
              </li>
            ))}
          </ul>
        )
      ) : libros.length === 0 && filtrado ? (
        <p className={styles.vacio}>Ningún libro coincide con este filtro.</p>
      ) : (
        <RankingLibros
          libros={libros}
          inicial={filtrado ? libros.length : 8}
          onAnadir={onAnadir}
          candidatas={candidatas}
          onCandidata={onCandidata}
          onPersona={(nombre) => {
            setLente('personas');
            setBusqueda(nombre);
          }}
        />
      )}
    </div>
  );
}
