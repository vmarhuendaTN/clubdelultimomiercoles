'use client';

import { useState, type FormEvent } from 'react';
import { Button, StarInput } from '@/components/ui';
import type { EstadoPersonas } from '../../hooks/use-personas-club';
import { idElegido, recordarPersona } from '../../services/personas';
import { textoLibro } from '../../services/opciones';
import { textoSesion, type DatosVoto, type VotacionAbierta } from '../../services/votacion';
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

/** Segunda ronda: cada miembro puntúa de 1 a 5 estrellas las candidatas que eligió el club. */
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
  const [puntos, setPuntos] = useState<Record<string, number>>({});

  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const nuevos: ErroresQuien & { puntos?: string } = validarQuien(quien, personas, false);
    if (Object.keys(puntos).length === 0) nuevos.puntos = 'Puntúa al menos una lectura.';
    setErrores(nuevos);
    if (Object.keys(nuevos).length > 0) return;
    const inscrita_id = idElegido(quien.persona);
    const elegida =
      personas.tipo === 'lista' ? personas.personas.find((p) => p.id === inscrita_id) : undefined;
    recordarPersona(inscrita_id);
    onEnviar({
      nombre: elegida ? (elegida.nombre.split(' ')[0] ?? '') : quien.nombre,
      apellidos: elegida ? '' : quien.apellidos,
      puntos,
      ...(inscrita_id ? { inscrita_id } : {}),
    });
  }

  return (
    <form className={styles.formulario} onSubmit={enviar} noValidate>
      <p className={styles.texto}>
        Estas son las candidatas para {textoSesion(votacion.sesion)}. Puntúa cada una de 1 a 5
        estrellas: la que más guste será la próxima lectura. Si cambias de opinión, vuelve a votar y
        contará tu último voto.
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

      <fieldset className={styles.grupo} aria-describedby="error-puntos">
        <legend className={styles.legend}>Candidatas</legend>
        <ul className={styles.candidatas}>
          {votacion.candidatas.map((c) => (
            <li key={c.id} className={styles.candidata}>
              <StarInput
                legend={textoLibro(c)}
                name={`voto-${c.id}`}
                value={puntos[c.id] ?? 0}
                onChange={(valor) => {
                  setPuntos((p) => ({ ...p, [c.id]: valor }));
                  setErrores((er) => ({ ...er, puntos: undefined }));
                }}
              />
            </li>
          ))}
        </ul>
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
