'use client';

import { useState } from 'react';
import { Button, Chip, Cifra, Pill } from '@/components/ui';
import { lineaDetalles } from '@/lib/format';
import type { Resultados } from '../../services/resultados-votacion';
import type { Candidata, LibroConDetalles } from '../../types';
import { EditorLibroDetalles } from '../EditorLibroDetalles';
import { NotaSesionEditor } from '../NotaSesionEditor';
import { PegarMensaje } from '../PegarMensaje';
import styles from './VotacionPanel.module.css';

type VotacionPanelProps = {
  resultados: Resultados;
  /** «Enero de 2027». */
  etiqueta: string;
  /** Notas del club para la sesión. */
  nota: string;
  esAdmin: boolean;
  ocupado: boolean;
  onAbrir: (abierta: boolean) => void;
  onQuitar: (candidata: Candidata) => void;
  onElegir: (candidata: Candidata) => void;
  /** Copia el mensaje con el enlace /votar/ para WhatsApp. */
  onCompartir: () => void;
  /** Solo admin: añade una candidata (aunque nadie la haya propuesto) o corrige una (con id). */
  onGuardarCandidata: (libro: LibroConDetalles, id?: string) => Promise<boolean>;
  /** Solo admin: añade de golpe los libros de un mensaje pegado, y sus notas. */
  onImportar: (libros: LibroConDetalles[], notas: string) => Promise<boolean>;
  onGuardarNota: (nota: string) => void;
  /** Solo admin: archiva (o recupera) la votación. */
  onArchivar: (archivar: boolean) => void;
  /** Borra los votos de una persona (por si votó por error). */
  onEliminarVoto?: (persona: { nombre: string; votoIds: string[] }) => void;
};

const votosTexto = (n: number) => (n === 1 ? '1 voto' : `${n} votos`);

/**
 * Votación final tipo encuesta de WhatsApp: candidatas con sus detalles, apertura, resultados
 * (votos, porcentaje y quién eligió cada una) y archivo.
 */
export function VotacionPanel({
  resultados,
  etiqueta,
  nota,
  esAdmin,
  ocupado,
  onAbrir,
  onQuitar,
  onElegir,
  onCompartir,
  onGuardarCandidata,
  onImportar,
  onGuardarNota,
  onArchivar,
  onEliminarVoto,
}: VotacionPanelProps) {
  const { abierta, archivada, candidatas, votantes, votosPorPersona, ranking } = resultados;
  const [editando, setEditando] = useState<string | null>(null);
  const ganadora = ranking[0]?.votos ? ranking[0] : undefined;
  const preparar = esAdmin && !archivada;

  return (
    <div className={styles.votacion}>
      <section className={styles.estado} aria-labelledby="estado-votacion">
        <div className={styles.estadoTexto}>
          <div className={styles.estadoCabecera}>
            <h3 id="estado-votacion" className={styles.titulo}>
              Votación final · {etiqueta}
            </h3>
            <Pill variant={abierta ? 'mostaza' : 'neutro'}>
              {archivada ? 'Archivada' : abierta ? 'Abierta' : 'Cerrada'}
            </Pill>
          </div>
          <p className={styles.ayuda}>
            {archivada
              ? 'Votación archivada: ya no sale en la web. Sus resultados se quedan aquí.'
              : abierta
                ? 'El club puede votar ahora en Lecturas → Propuestas, con el código del club. Como en una encuesta de WhatsApp, cada persona marca todas las que quiera; si vota dos veces, cuenta su último voto.'
                : candidatas.length
                  ? 'Cuando la abras, el club verá estas candidatas (con sus detalles y las notas) para marcar las que quiera.'
                  : 'Elige las candidatas en «Resumen» con el botón «A votación», o añádelas aquí abajo.'}
          </p>
        </div>
        <div className={styles.botones}>
          {candidatas.length > 0 && !archivada && (
            <Button variant="secundario" icono="documento" onClick={onCompartir}>
              Copiar mensaje para WhatsApp
            </Button>
          )}
          {preparar && (
            <Button
              variant={abierta ? 'secundario' : 'primario'}
              disabled={ocupado || candidatas.length === 0}
              onClick={() => onAbrir(!abierta)}
            >
              {abierta ? 'Cerrar votación' : 'Abrir votación'}
            </Button>
          )}
          {esAdmin && candidatas.length > 0 && (
            <Button variant="sencillo" disabled={ocupado} onClick={() => onArchivar(!archivada)}>
              {archivada ? 'Desarchivar votación' : 'Archivar votación'}
            </Button>
          )}
        </div>
      </section>

      {candidatas.length > 0 && (
        <>
          <div className={styles.cifras}>
            <Cifra valor={votantes.length} etiqueta="Votantes" />
            <Cifra valor={candidatas.length} etiqueta="Candidatas" />
            <Cifra
              valor={ganadora ? votosTexto(ganadora.votos) : '—'}
              etiqueta="La más votada"
              detalle={ganadora?.candidata.titulo ?? 'Sin votos todavía'}
            />
          </div>

          <section className={styles.bloque} aria-labelledby="resultados-votacion">
            <h3 id="resultados-votacion" className={styles.titulo}>
              Resultados
            </h3>
            <ol className={styles.lista}>
              {ranking.map((r, i) => {
                const detalles = lineaDetalles(r.candidata);
                return (
                  <li key={r.candidata.id} className={styles.fila}>
                    <span className={styles.posicion} aria-hidden="true">
                      {i + 1}
                    </span>
                    <div className={styles.cuerpo}>
                      <div className={styles.cabecera}>
                        <h4 className={styles.libro}>
                          {r.candidata.autor
                            ? `${r.candidata.titulo}, ${r.candidata.autor}`
                            : r.candidata.titulo}
                        </h4>
                        {ganadora && r === ganadora && <Pill variant="mostaza">Va en cabeza</Pill>}
                      </div>
                      {detalles && <p className={styles.reparto}>{detalles}</p>}
                      <p className={styles.datos}>
                        {r.votos > 0
                          ? `${votosTexto(r.votos)} · ${r.porcentaje} %`
                          : 'Sin votos todavía'}
                      </p>
                      <svg
                        className={styles.barra}
                        viewBox="0 0 100 6"
                        preserveAspectRatio="none"
                        aria-hidden="true"
                      >
                        <rect className={styles.pista} width="100" height="6" rx="3" />
                        {r.votos > 0 && (
                          <rect className={styles.valor} width={r.porcentaje} height="6" rx="3" />
                        )}
                      </svg>
                      {r.personas.length > 0 && (
                        <p className={styles.reparto}>{r.personas.join(', ')}</p>
                      )}
                      {editando === r.candidata.id && (
                        <EditorLibroDetalles
                          inicial={r.candidata}
                          textoBoton="Guardar cambios"
                          ocupado={ocupado}
                          onGuardar={async (libro) => {
                            const ok = await onGuardarCandidata(libro, r.candidata.id);
                            if (ok) setEditando(null);
                            return ok;
                          }}
                          onCancelar={() => setEditando(null)}
                        />
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
                      {preparar && (
                        <>
                          <Button
                            size="sm"
                            variant="sencillo"
                            icono="editar"
                            disabled={ocupado || editando === r.candidata.id}
                            onClick={() => setEditando(r.candidata.id)}
                            aria-label={`Editar «${r.candidata.titulo}»`}
                          >
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="sencillo"
                            disabled={ocupado}
                            onClick={() => onQuitar(r.candidata)}
                            aria-label={`Quitar «${r.candidata.titulo}» de la votación`}
                          >
                            Quitar
                          </Button>
                        </>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        </>
      )}

      {(preparar || nota) && (
        <section className={styles.libre} aria-labelledby="notas-votacion">
          <h3 id="notas-votacion" className={styles.titulo}>
            Notas de la sesión
          </h3>
          <NotaSesionEditor
            etiqueta={etiqueta}
            nota={nota}
            esAdmin={preparar}
            ocupado={ocupado}
            onGuardar={onGuardarNota}
          />
        </section>
      )}

      {preparar && (
        <section className={styles.libre} aria-labelledby="candidata-libre">
          <div>
            <h3 id="candidata-libre" className={styles.titulo}>
              Añadir candidatas
            </h3>
            <p className={styles.ayuda}>
              Un libro que el club quiere poner a votación aunque nadie lo haya propuesto, con su
              año, páginas, sinopsis y nota.
            </p>
          </div>
          <EditorLibroDetalles
            textoBoton="Añadir a la votación"
            ocupado={ocupado}
            onGuardar={(libro) => onGuardarCandidata(libro)}
          />
          <div className={styles.separado}>
            <h4 className={styles.subtitulo}>O pega el mensaje de WhatsApp</h4>
            <PegarMensaje
              textoBoton="Añadir todas a la votación"
              ocupado={ocupado}
              onImportar={onImportar}
            />
          </div>
        </section>
      )}

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
                  {v.votoIds.length > 1 ? `${v.nombre} (votó ${v.votoIds.length} veces)` : v.nombre}
                </Chip>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
