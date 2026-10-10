'use client';

import { useEffect, useId, useState, type FormEvent } from 'react';
import { Button, PasswordField } from '@/components/ui';
import { site } from '@/config/site';
import { descifrarEnlace } from '../../services/enlace-cifrado';
import {
  enlaceRecordado,
  enlaceSinIncrustar,
  recordarEnlace,
} from '../../services/enlace-recordado';
import styles from './ProposalForm.module.css';

const TITULO = 'Propón la próxima lectura';

/**
 * Formulario de Google para proponer lecturas, protegido con el código de acceso del club.
 * El enlace va cifrado en la web; con el código correcto se descifra y se muestra el formulario.
 */
export function ProposalForm() {
  const tituloId = useId();
  const [enlace, setEnlace] = useState<string | null>(null);
  const [codigo, setCodigo] = useState('');
  const [error, setError] = useState<string>();
  const [comprobando, setComprobando] = useState(false);

  useEffect(() => setEnlace(enlaceRecordado()), []);

  async function entrar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setComprobando(true);
    const descifrado = await descifrarEnlace(site.formularioPropuestas, codigo);
    setComprobando(false);
    if (!descifrado) {
      setError('El código no es correcto. Revísalo e inténtalo de nuevo.');
      return;
    }
    recordarEnlace(descifrado);
    setEnlace(descifrado);
  }

  return (
    <section aria-labelledby={tituloId} className={styles.seccion}>
      <h2 id={tituloId} className={styles.titulo}>
        {TITULO}
      </h2>

      {enlace ? (
        <>
          <p className={styles.texto}>
            ¿Qué te gustaría leer con el club? Cuéntanoslo y lo tendremos en cuenta para la próxima
            sesión.
          </p>
          <iframe src={enlace} title={TITULO} loading="lazy" className={styles.formulario}>
            Cargando…
          </iframe>
          <a href={enlaceSinIncrustar(enlace)} rel="noopener noreferrer" className={styles.enlace}>
            Abrir el formulario en Google Forms
          </a>
        </>
      ) : (
        <form onSubmit={entrar} className={styles.acceso} noValidate>
          <p className={styles.texto}>
            El formulario es solo para el club. Escribe el código de acceso para abrirlo.
          </p>
          <PasswordField
            label="Código de acceso"
            autoComplete="current-password"
            value={codigo}
            onChange={(e) => {
              setCodigo(e.target.value);
              setError(undefined);
            }}
            error={error}
            required
          />
          <div className={styles.acciones}>
            <Button type="submit" disabled={comprobando || !codigo.trim()}>
              {comprobando ? 'Comprobando…' : 'Abrir el formulario'}
            </Button>
          </div>
        </form>
      )}
    </section>
  );
}
