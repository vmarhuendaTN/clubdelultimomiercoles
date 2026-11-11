'use client';

'use client';

import { useState, type FormEvent } from 'react';
import { Button, Chip, Cifra, Input, Pill, StarRating } from '@/components/ui';
import { BuscadorLibros } from '@/features/book-search';
import type { Resultados } from '../../services/resultados-votacion';
import type { Candidata } from '../../types';
import styles from './VotacionPanel.module.css';

type VotacionPanelProps = {
  resultados: Resultados;
  /** «Enero de 2027». */
  etiqueta: string;
  esAdmin: boolean;
  ocupado: boolean;
  onAbrir: (abierta: boolean) => void;
  onQuitar: (candidata: Candidata) => void;
  onElegir: (candidata: Candidata) => void;
  /** Copia el mensaje con el enlace /votar/ para WhatsApp. */
  onCompartir: () => void;
  /** Solo admin: añade un libro aunque nadie lo haya propuesto. */
  onAnadirLibre: (libro: { titulo: string; autor: string }) => Promise<boolean>;
  /** Borra los votos de una persona (por si votó por error). */
  onEliminarVoto?: (persona: { nombre: string; votoIds: string[] }) => void;
};

const formato = new Intl.NumberFormat('es-ES', { maximumFractionDigits: 1 });
const texto = (c: Candidata) => (c.autor ? `${c.titulo}, ${c.autor}` : c.titulo);

/**
 * Segunda ronda: candidatas elegidas por la administradora, apertura de la votación y resultados
 * (media de estrellas, votos, puntos y reparto) para decidir la próxima lectura.
 */
export function VotacionPanel({
  resultados,
  etiqueta,
  esAdmin,
  ocupado,
  onAbrir,
  onQuitar,
  onElegir,
  onCompartir,
  onAnadirLibre,
  onEliminarVoto,
}: VotacionPanelProps) {
  const { abierta, candidatas, votantes, votosPorPersona, ranking } = resultados;
  const [libre, setLibre] = useState({ titulo: '', autor: '' });
  const [errorLibre, setErrorLibre] = useState<string>();

  async function anadirLibre(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!libre.titulo.trim()) {
      setErrorLibre('Escribe el título.');
      return;
    }
    if (await onAnadirLibre(libre)) setLibre({ titulo: '', autor: '' });
  }
  const ganadora = ranking[0]?.votos ? ranking[0] : undefined;

  return (
    <div className={styles.votacion}>
      <section className={styles.estado} aria-labelledby="estado-votacion">
        <div className={styles.estadoTexto}>
          <div className={styles.estadoCabecera}>
            <h3 id="estado-votacion" className={styles.titulo}>
              Votación final · {etiqueta}
            </h3>
            <Pill variant={abierta ? 'mostaza' : 'neutro'}>{abierta ? 'Abierta' : 'Cerrada'}</Pill>
          </div>
          <p className={styles.ayuda}>
            {abierta
              ? 'El club puede votar ahora en Lecturas → Propuestas, con el código del club. Cada persona puntúa de 1 a 5 estrellas; si vota dos veces, cuenta su último voto.'
              : candidatas.length
                ? 'Cuando la abras, el club verá estas candidatas en Lecturas → Propuestas para puntuarlas.'
                : 'Elige las candidatas en «Resumen» con el botón «A votación» de cada libro.'}
          </p>
        </div>
        <div className={styles.botones}>
          {candidatas.length > 0 && (
            <Button variant="secundario" icono="documento" onClick={onCompartir}>
              Copiar mensaje para WhatsApp
            </Button>
          )}
          {esAdmin && (
            <Button
              variant={abierta ? 'secundario' : 'primario'}
              disabled={ocupado || candidatas.length === 0}
              onClick={() => onAbrir(!abierta)}
            >
              {abierta ? 'Cerrar votación' : 'Abrir votación'}
            </Button>
          )}
        </div>
      </section>

      {esAdmin && (
        <section className={styles.libre} aria-labelledby="candidata-libre">
          <div>
            <h3 id="candidata-libre" className={styles.titulo}>
              Añadir otra candidata
            </h3>
            <p className={styles.ayuda}>
              Un libro que el club quiere poner a votación aunque nadie lo haya propuesto.
            </p>
          </div>
          <BuscadorLibros
            onElegir={(l) => {
              setLibre({ titulo: l.titulo, autor: l.autores.join(', ') });
              setErrorLibre(undefined);
            }}
          />
          <form className={styles.libreFila} onSubmit={(e) => void anadirLibre(e)} noValidate>
            <Input
              label="Título"
              value={libre.titulo}
              error={errorLibre}
              onChange={(e) => {
                setLibre({ ...libre, titulo: e.target.value });
                setErrorLibre(undefined);
              }}
              className={styles.crece}
            />
            <Input
              label="Autor o autora"
              value={libre.autor}
              onChange={(e) => setLibre({ ...libre, autor: e.target.value })}
              className={styles.crece}
            />
            <Button type="submit" icono="anadir" variant="secundario" disabled={ocupado}>
              Añadir a la votación
            </Button>
          </form>
        </section>
      )}

      {candidatas.length > 0 && (
        <>
          <div className={styles.cifras}>
            <Cifra valor={votantes.length} etiqueta="Votantes" />
            <Cifra valor={candidatas.length} etiqueta="Candidatas" />
            <Cifra
              valor={ganadora ? formato.format(ganadora.media) : '—'}
              etiqueta="Mejor media"
              detalle={ganadora?.candidata.titulo ?? 'Sin votos todavía'}
            />
          </div>

          <section className={styles.bloque} aria-labelledby="resultados-votacion">
            <h3 id="resultados-votacion" className={styles.titulo}>
              Resultados
            </h3>
            <ol className={styles.lista}>
              {ranking.map((r, i) => (
                <li key={r.candidata.id} className={styles.fila}>
                  <span className={styles.posicion} aria-hidden="true">
                    {i + 1}
                  </span>
                  <div className={styles.cuerpo}>
                    <div className={styles.cabecera}>
                      <h4 className={styles.libro}>{texto(r.candidata)}</h4>
                      {ganadora && r === ganadora && <Pill variant="mostaza">Va en cabeza</Pill>}
                    </div>
                    <div className={styles.datos}>
                      {r.votos > 0 ? (
                        <>
                          <StarRating valor={r.media} tamano="sm" />
                          <span>
                            {formato.format(r.media)} · {r.votos} {r.votos === 1 ? 'voto' : 'votos'}{' '}
                            · {r.total} {r.total === 1 ? 'punto' : 'puntos'}
                          </span>
                        </>
                      ) : (
                        <span>Sin votos todavía</span>
                      )}
                    </div>
                    <svg
                      className={styles.barra}
                      viewBox="0 0 100 6"
                      preserveAspectRatio="none"
                      aria-hidden="true"
                    >
                      <rect className={styles.pista} width="100" height="6" rx="3" />
                      {r.votos > 0 && (
                        <rect
                          className={styles.valor}
                          width={(r.media / 5) * 100}
                          height="6"
                          rx="3"
                        />
                      )}
                    </svg>
                    {r.votos > 0 && (
                      <p className={styles.reparto}>
                        {r.reparto
                          .map((veces, estrellas) => ({ veces, estrellas: estrellas + 1 }))
                          .reverse()
                          .filter((x) => x.veces > 0)
                          .map((x) => `${x.estrellas}★ × ${x.veces}`)
                          .join(' · ')}
                      </p>
                    )}
                  </div>
                  <div className={styles.acciones}>
                    <Button
                      size="sm"
                      variant={ganadora && r === ganadora ? 'primario' : 'secundario'}
                      icono="libro"
                      onClick={() => onElegir(r.candidata)}
                      aria-label={`Elegir «${r.candidata.titulo}» como próxima lectura`}
                    >
                      Elegir
                    </Button>
                    {esAdmin && (
                      <Button
                        size="sm"
                        variant="sencillo"
                        disabled={ocupado}
                        onClick={() => onQuitar(r.candidata)}
                        aria-label={`Quitar «${r.candidata.titulo}» de la votación`}
                      >
                        Quitar
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {votantes.length > 0 && (
            <section className={styles.bloque} aria-labelledby="quien-ha-votado">
              <h3 id="quien-ha-votado" className={styles.titulo}>
                Quién ha votado
              </h3>
              <ul className={styles.votantes}>
                {votosPorPersona.map((v) => (
                  <li key={v.nombre}>
                    <Chip
                      onQuitar={onEliminarVoto && (() => onEliminarVoto(v))}
                      etiqueta={`Eliminar el voto de ${v.nombre}`}
                    >
                      {v.votoIds.length > 1
                        ? `${v.nombre} (votó ${v.votoIds.length} veces)`
                        : v.nombre}
                    </Chip>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}
