'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { env } from '@/lib/env';
import { comprobarAcceso, type Persona, type ResultadoAcceso } from '../services/apps-script';
import styles from './BackPanel.module.css';

/** Mínimo del SDK de Google Identity Services que usamos. */
type GoogleIdentity = {
  accounts: {
    id: {
      initialize: (config: {
        client_id: string;
        callback: (respuesta: { credential: string }) => void;
        auto_select: boolean;
        ux_mode: 'popup';
      }) => void;
      renderButton: (elemento: HTMLElement, opciones: Record<string, unknown>) => void;
      disableAutoSelect: () => void;
    };
  };
};

type Estado =
  | { tipo: 'cargando' }
  | { tipo: 'sin_sesion' }
  | { tipo: 'comprobando' }
  | { tipo: 'dentro'; persona: Persona }
  | { tipo: 'error'; error: Exclude<ResultadoAcceso, { ok: true }>['error'] };

const SECCIONES = ['Peticiones', 'Libros', 'Sesiones', 'Propuestas', 'Textos'] as const;
const SECCIONES_ADMIN = ['Equipo', 'Miembros'] as const;

function mensajeDeError(error: Exclude<ResultadoAcceso, { ok: true }>['error']): string {
  switch (error) {
    case 'sin_configurar':
      return 'El panel todavía no está conectado con la hoja del club.';
    case 'no_autorizado':
      return 'Tu cuenta no tiene acceso al panel. Pide a la administradora que te añada en la pestaña Equipo.';
    case 'red':
      return 'No hemos podido conectar con la hoja. Revisa tu conexión e inténtalo de nuevo.';
    case 'sesion_no_valida':
      return 'La sesión ha caducado o no es válida. Vuelve a entrar con Google.';
  }
}

export function BackPanel() {
  const [estado, setEstado] = useState<Estado>({ tipo: 'cargando' });
  const botonRef = useRef<HTMLDivElement>(null);

  const alRecibirCredencial = useCallback(async (idToken: string) => {
    setEstado({ tipo: 'comprobando' });
    const resultado = await comprobarAcceso(idToken);
    setEstado(
      resultado.ok
        ? { tipo: 'dentro', persona: resultado.persona }
        : { tipo: 'error', error: resultado.error },
    );
  }, []);

  useEffect(() => {
    if (!env.googleClientId) {
      setEstado({ tipo: 'error', error: 'sin_configurar' });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.onload = () => {
      const google = (window as unknown as { google?: GoogleIdentity }).google;
      if (!google || !botonRef.current) return;
      google.accounts.id.initialize({
        client_id: env.googleClientId,
        callback: (respuesta) => {
          void alRecibirCredencial(respuesta.credential);
        },
        auto_select: false,
        ux_mode: 'popup',
      });
      google.accounts.id.renderButton(botonRef.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
        locale: 'es',
        shape: 'pill',
      });
      setEstado({ tipo: 'sin_sesion' });
    };
    document.head.appendChild(script);
    return () => {
      script.remove();
    };
  }, [alRecibirCredencial]);

  function cerrarSesion() {
    const google = (window as unknown as { google?: GoogleIdentity }).google;
    google?.accounts.id.disableAutoSelect();
    setEstado({ tipo: 'sin_sesion' });
  }

  if (estado.tipo === 'dentro') {
    const { persona } = estado;
    const secciones = persona.rol === 'admin' ? [...SECCIONES, ...SECCIONES_ADMIN] : [...SECCIONES];
    return (
      <section className={styles.panel} aria-labelledby="titulo-back">
        <header className={styles.cabecera}>
          <h1 id="titulo-back" className={styles.titulo}>
            Panel del club
          </h1>
          <button type="button" className={styles.salir} onClick={cerrarSesion}>
            Salir
          </button>
        </header>
        <p className={styles.saludo}>
          Hola{persona.nombre ? `, ${persona.nombre}` : ''}. Entraste como{' '}
          <strong>{persona.rol === 'admin' ? 'administradora' : 'editora'}</strong> ({persona.email}
          ).
        </p>
        <ul className={styles.lista} aria-label="Secciones del panel">
          {secciones.map((s) => (
            <li key={s} className={styles.item}>
              <span>{s}</span>
              <span className={styles.pronto}>Próximamente</span>
            </li>
          ))}
        </ul>
      </section>
    );
  }

  return (
    <section className={styles.panel} aria-labelledby="titulo-back">
      <h1 id="titulo-back" className={styles.titulo}>
        Panel del club
      </h1>
      <p className={styles.texto}>
        Entra con la cuenta de Google que figura en la pestaña Equipo de la hoja del club.
      </p>

      {estado.tipo === 'error' && (
        <p role="alert" className={styles.aviso}>
          {mensajeDeError(estado.error)}
        </p>
      )}
      {estado.tipo === 'comprobando' && (
        <p className={styles.texto} role="status">
          Comprobando tu acceso…
        </p>
      )}

      <div ref={botonRef} className={styles.boton} />
      {estado.tipo === 'cargando' && !env.googleClientId && (
        <p className={styles.texto}>Falta el ID de cliente de Google en la configuración.</p>
      )}
    </section>
  );
}
