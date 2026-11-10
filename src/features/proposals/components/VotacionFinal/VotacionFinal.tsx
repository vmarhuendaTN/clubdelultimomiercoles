'use client';

import { useState, type FormEvent } from 'react';
import { Button, Input, StarInput } from '@/components/ui';
import { textoLibro } from '../../services/opciones';
import { textoSesion, type DatosVoto, type VotacionAbierta } from '../../services/votacion';
import styles from './VotacionFinal.module.css';

type VotacionFinalProps = {
  votacion: VotacionAbierta;
  onEnviar: (datos: DatosVoto) => void;
  enviando: boolean;
  error?: string;
};

type Errores = Partial<Record<'nombre' | 'apellidos' | 'puntos', string>>;

/** Segunda ronda: cada miembro puntúa de 1 a 5 estrellas las candidatas que eligió el club. */
export function VotacionFinal({ votacion, onEnviar, enviando, error }: VotacionFinalProps) {
  const [nombre, setNombre] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [puntos, setPuntos] = useState<Record<string, number>>({});
  const [errores, setErrores] = useState<Errores>({});

  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const nuevos: Errores = {};
    if (!nombre.trim()) nuevos.nombre = 'Escribe tu nombre.';
    if (!apellidos.trim()) nuevos.apellidos = 'Escribe tus apellidos.';
    if (Object.keys(puntos).length === 0) nuevos.puntos = 'Puntúa al menos una lectura.';
    setErrores(nuevos);
    if (Object.keys(nuevos).length === 0) onEnviar({ nombre, apellidos, puntos });
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
        <div className={styles.dos}>
          <Input
            label="Nombre"
            autoComplete="given-name"
            maxLength={60}
            required
            value={nombre}
            error={errores.nombre}
            onChange={(e) => {
              setNombre(e.target.value);
              setErrores((er) => ({ ...er, nombre: undefined }));
            }}
          />
          <Input
            label="Apellidos"
            autoComplete="family-name"
            maxLength={80}
            required
            value={apellidos}
            error={errores.apellidos}
            onChange={(e) => {
              setApellidos(e.target.value);
              setErrores((er) => ({ ...er, apellidos: undefined }));
            }}
          />
        </div>
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
