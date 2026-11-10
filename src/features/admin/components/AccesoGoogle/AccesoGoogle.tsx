'use client';

import { useEffect, useRef, useState } from 'react';
import { env } from '@/lib/env';
import { mensajeDeError, type ErrorApi } from '@/lib/apps-script';
import styles from './AccesoGoogle.module.css';

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
    };
  };
};

type AccesoGoogleProps = {
  onCredencial: (idToken: string) => void;
  comprobando: boolean;
  error?: ErrorApi;
};

function mensaje(error: ErrorApi): string {
  if (error === 'no_autorizado') {
    return 'Tu cuenta de Google no está en el equipo. Pide a una administradora que te añada.';
  }
  if (error === 'sesion_no_valida') return 'Tu sesión ha caducado. Vuelve a entrar con Google.';
  return mensajeDeError(error);
}

/** Pantalla de entrada del panel: botón oficial de Google. */
export function AccesoGoogle({ onCredencial, comprobando, error }: AccesoGoogleProps) {
  const botonRef = useRef<HTMLDivElement>(null);
  const callbackRef = useRef(onCredencial);
  callbackRef.current = onCredencial;
  const [sinGoogle, setSinGoogle] = useState(false);

  useEffect(() => {
    if (!env.googleClientId) return;
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.onerror = () => setSinGoogle(true);
    script.onload = () => {
      const google = (window as unknown as { google?: GoogleIdentity }).google;
      if (!google || !botonRef.current) return;
      google.accounts.id.initialize({
        client_id: env.googleClientId,
        callback: (r) => callbackRef.current(r.credential),
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
    };
    document.head.appendChild(script);
    return () => script.remove();
  }, []);

  const aviso = !env.googleClientId
    ? 'Falta el ID de cliente de Google en la configuración de la web.'
    : sinGoogle
      ? 'No se ha podido cargar el acceso de Google. Revisa tu conexión o desactiva el bloqueador.'
      : error && mensaje(error);

  return (
    <div className={styles.acceso}>
      <p className={styles.texto}>
        Entra con la cuenta de Google que figura en la pestaña Equipo de la hoja del club.
      </p>
      {aviso && (
        <p role="alert" className={styles.aviso}>
          {aviso}
        </p>
      )}
      {comprobando && (
        <p role="status" className={styles.texto}>
          Comprobando tu acceso…
        </p>
      )}
      <div ref={botonRef} className={styles.boton} hidden={comprobando} />
    </div>
  );
}
