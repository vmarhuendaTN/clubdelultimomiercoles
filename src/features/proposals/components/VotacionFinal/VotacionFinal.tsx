'use client';

import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui';
import type { EstadoPersonas } from '../../hooks/use-personas-club';
import { idElegido, recordarPersona } from '../../services/personas';
import { textoSesion, type DatosVoto, type VotacionAbierta } from '../../services/votacion';
import { DetallesLibro } from '../DetallesLibro';
import { NotaClub } from '../NotaClub';
import { QuienEres, validarQuien, type DatosQuien, type ErroresQuien } from '../QuienEres';
import styles from './VotacionFinal.module.css';

type VotacionFinalProps = {
  votacion: VotacionAbierta;
  onEnviar: (datos: DatosVoto) => void;
  enviando: boolean;
  error?: string;
  /** Lista del club para «¿Quién eres?». Sin ella, nombre y apellidos a mano. */
  personas?: EstadoPersonas;
};

/**
 * Segunda ronda: como una encuesta de WhatsApp, cada miembro marca una o varias candidatas de
 * las que eligió el club.
 */
export function VotacionFinal({
  votacion,
  onEnviar,
  enviando,
  error,
  personas = { tipo: 'sin_lista' },
}: VotacionFinalProps) {
  const [quien, setQuien] = useState<DatosQuien>({
    persona: '',
    nombre: '',
    apellidos: '',
    grupo: '',
  });
  const [errores, setErrores] = useState<ErroresQuien & { puntos?: string }>({});
  const [elegidas, setElegidas] = useState<string[]>([]);

  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const nuevos: ErroresQuien & { puntos?: string } = validarQuien(quien, personas, false);
    if (elegidas.length === 0) nuevos.puntos = 'Marca al menos una lectura.';
    setErrores(nuevos);
    if (Object.keys(nuevos).length > 0) return;
    const inscrita_id = idElegido(quien.persona);
    const elegida =
      personas.tipo === 'lista' ? personas.personas.find((p) => p.id === inscrita_id) : undefined;
    recordarPersona(inscrita_id);
    onEnviar({
      nombre: elegida ? (elegida.nombre.split(' ')[0] ?? '') : quien.nombre,
      apellidos: elegida ? '' : quien.apellidos,
      puntos: Object.fromEntries(elegidas.map((id) => [id, 1])),
      ...(inscrita_id ? { inscrita_id } : {}),
    });
  }

  return (
    <form className={styles.formulario} onSubmit={enviar} noValidate>
      <p className={styles.texto}>
        Estas son las candidatas para {textoSesion(votacion.sesion)}. Marca todas las que te
        apetezca leer (puedes elegir varias): la más votada será la próxima lectura. Si cambias de
        opinión, vuelve a votar y contará tu último voto.
      </p>

      <fieldset className={styles.grupo}>
        <legend className={styles.legend}>Sobre ti</legend>
        <QuienEres
          personas={personas}
          valor={quien}
          errores={errores}
          onCambiar={(campo, v) => {
            setQuien((q) => ({ ...q, [campo]: v }));
            setErrores((er) => ({ ...er, [campo]: undefined }));
          }}
        />
      </fieldset>

      <NotaClub nota={votacion.nota} />

      <fieldset className={styles.grupo} aria-describedby="error-puntos">
        <legend className={styles.legend}>Candidatas · puedes marcar varias</legend>
        <ul className={styles.candidatas}>
          {votacion.candidatas.map((c) => {
            const marcada = elegidas.includes(c.id);
            const conDetalles = Boolean(c.anio || c.paginas || c.sinopsis || c.nota);
            return (
              <li key={c.id} className={`${styles.candidata} ${marcada ? styles.marcada : ''}`}>
                <div className={styles.opcion}>
                  <input
                    type="checkbox"
                    id={`voto-${c.id}`}
                    className={styles.casilla}
                    checked={marcada}
                    aria-describedby={conDetalles ? `detalles-${c.id}` : undefined}
                    onChange={(e) => {
                      const si = e.target.checked;
                      setElegidas((l) => (si ? [...l, c.id] : l.filter((x) => x !== c.id)));
                      setErrores((er) => ({ ...er, puntos: undefined }));
                    }}
                  />
                  <label htmlFor={`voto-${c.id}`} className={styles.etiqueta}>
                    <span className={styles.tituloLibro}>{c.titulo}</span>
                    {c.autor && <span className={styles.autor}>{c.autor}</span>}
                  </label>
                </div>
                {conDetalles && (
                  <div className={styles.detalles}>
                    <DetallesLibro libro={c} id={`detalles-${c.id}`} />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
        <p className={styles.recuento} aria-live="polite">
          {elegidas.length === 0
            ? 'Ninguna marcada todavía.'
            : elegidas.length === 1
              ? '1 lectura marcada.'
              : `${elegidas.length} lecturas marcadas.`}
        </p>
        <p id="error-puntos" className={styles.errorCampo} aria-live="polite">
          {errores.puntos}
        </p>
      </fieldset>

      {error && (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      )}
      <div>
        <Button type="submit" disabled={enviando}>
          {enviando ? 'Enviando…' : 'Enviar mi voto'}
        </Button>
      </div>
    </form>
  );
}
