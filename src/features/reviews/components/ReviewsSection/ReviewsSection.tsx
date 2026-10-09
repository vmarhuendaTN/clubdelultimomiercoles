'use client';

import { useCallback, useEffect, useId, useState, type FormEvent } from 'react';
import { Button, Skeleton, StarInput, StarRating, useToast } from '@/components/ui';
import { entrarConGoogle, salir } from '@/features/auth';
import { useSession } from '@/hooks/use-session';
import { supabaseConfigurado } from '@/lib/supabase';
import {
  borrarValoracion,
  guardarValoracion,
  listarValoraciones,
  miValoracion,
} from '../../services/reviews';
import type { Valoracion } from '../../types';
import { MAX_OPINION, nombrePublico, textoResumen } from '../../utils';
import { ReviewList } from '../ReviewList';
import styles from './ReviewsSection.module.css';

type Props = { slug: string; titulo: string };

/**
 * Estrellas y opiniones de un libro. Leer es público; para valorar se entra con Google
 * (Supabase Auth). Una valoración por persona y libro, editable y borrable.
 */
export function ReviewsSection(props: Props) {
  if (!supabaseConfigurado()) return null;
  return <ReviewsSectionInner {...props} />;
}

function ReviewsSectionInner({ slug, titulo }: Props) {
  const headingId = useId();
  const opinionId = useId();
  const { session, cargando: cargandoSesion } = useSession();
  const { mostrar } = useToast();
  const [valoraciones, setValoraciones] = useState<Valoracion[] | null>(null);
  const [error, setError] = useState<string>();
  const [estrellas, setEstrellas] = useState(0);
  const [opinion, setOpinion] = useState('');
  const [tengoValoracion, setTengoValoracion] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const userId = session?.user.id;

  const cargar = useCallback(async () => {
    try {
      setError(undefined);
      setValoraciones(await listarValoraciones(slug));
    } catch (e) {
      setError((e as Error).message);
    }
  }, [slug]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  useEffect(() => {
    if (!userId) {
      setTengoValoracion(false);
      return;
    }
    miValoracion(slug, userId)
      .then((mia) => {
        setTengoValoracion(Boolean(mia));
        setEstrellas(mia?.estrellas ?? 0);
        setOpinion(mia?.opinion ?? '');
      })
      .catch(() => undefined);
  }, [slug, userId]);

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    if (!estrellas) {
      mostrar('Elige de 1 a 5 estrellas.', 'error');
      return;
    }
    setEnviando(true);
    try {
      await guardarValoracion(slug, estrellas, opinion);
      setTengoValoracion(true);
      mostrar('¡Gracias! Tu valoración está publicada.', 'exito');
      await cargar();
    } catch (err) {
      mostrar((err as Error).message, 'error');
    } finally {
      setEnviando(false);
    }
  };

  const borrar = async () => {
    if (!userId) return;
    setEnviando(true);
    try {
      await borrarValoracion(slug, userId);
      setTengoValoracion(false);
      setEstrellas(0);
      setOpinion('');
      mostrar('Tu valoración se ha borrado.', 'info');
      await cargar();
    } catch (err) {
      mostrar((err as Error).message, 'error');
    } finally {
      setEnviando(false);
    }
  };

  const entrar = async () => {
    try {
      await entrarConGoogle();
    } catch (err) {
      mostrar((err as Error).message, 'error');
    }
  };

  const total = valoraciones?.length ?? 0;
  const media = total ? valoraciones!.reduce((s, v) => s + v.estrellas, 0) / total : 0;
  const nombreGoogle = session?.user.user_metadata as
    { full_name?: string; name?: string } | undefined;

  return (
    <section aria-labelledby={headingId} className={styles.seccion}>
      <h2 id={headingId} className={styles.titulo}>
        Valoraciones
      </h2>

      <div className={styles.resumen} aria-live="polite">
        {valoraciones === null && !error ? (
          <span className={styles.cargando}>
            <Skeleton ancho="medio" />
            <span className="visually-hidden">Cargando valoraciones…</span>
          </span>
        ) : total ? (
          <>
            <StarRating valor={media} />
            <span>{textoResumen({ media, total })}</span>
          </>
        ) : (
          !error && (
            <span className={styles.vacio}>Aún no hay valoraciones. ¡Sé la primera persona!</span>
          )
        )}
      </div>

      {error && (
        <div className={styles.error} role="alert">
          <p>{error}</p>
          <Button variant="secundario" size="sm" onClick={() => void cargar()}>
            Reintentar
          </Button>
        </div>
      )}

      {cargandoSesion ? null : session ? (
        <form className={styles.formulario} onSubmit={enviar}>
          <StarInput
            legend={`Tu valoración de «${titulo}»`}
            value={estrellas}
            onChange={setEstrellas}
          />
          <div className={styles.campo}>
            <label htmlFor={opinionId} className={styles.label}>
              Tu opinión <span className={styles.opcional}>(opcional)</span>
            </label>
            <textarea
              id={opinionId}
              className={styles.textarea}
              value={opinion}
              onChange={(e) => setOpinion(e.target.value)}
              maxLength={MAX_OPINION}
              rows={4}
              aria-describedby={`${opinionId}-ayuda`}
            />
            <p id={`${opinionId}-ayuda`} className={styles.ayuda}>
              Se publicará como «{nombrePublico(nombreGoogle?.full_name ?? nombreGoogle?.name)}». Tu
              email nunca se muestra.
            </p>
          </div>
          <div className={styles.acciones}>
            <Button type="submit" disabled={enviando}>
              {tengoValoracion ? 'Actualizar valoración' : 'Publicar valoración'}
            </Button>
            {tengoValoracion && (
              <Button variant="secundario" onClick={() => void borrar()} disabled={enviando}>
                Borrar mi valoración
              </Button>
            )}
            <Button variant="sencillo" onClick={() => void salir()}>
              Salir
            </Button>
          </div>
        </form>
      ) : (
        <div className={styles.entrar}>
          <Button icono="google" onClick={() => void entrar()}>
            Entrar con Google para valorar
          </Button>
          <p className={styles.ayuda}>
            Solo usamos tu cuenta de Google para identificarte. Se mostrará tu nombre y la inicial
            de tu apellido; nunca tu email.
          </p>
        </div>
      )}

      {valoraciones && valoraciones.length > 0 && <ReviewList valoraciones={valoraciones} />}
    </section>
  );
}
