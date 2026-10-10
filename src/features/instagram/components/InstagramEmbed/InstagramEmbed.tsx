'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button, Icon } from '@/components/ui';
import { routes } from '@/config/routes';
import { site } from '@/config/site';
import { guardarPreferencia, leerPreferencia } from '@/lib/dom/preferencias';
import styles from './InstagramEmbed.module.css';

const CLAVE = 'club:instagram-embed';

/**
 * Perfil de Instagram incrustado. Instagram (Meta) usa sus propias cookies, así que solo se
 * carga cuando la persona lo pide; la elección se recuerda en este navegador.
 */
export function InstagramEmbed() {
  const [cargado, setCargado] = useState(false);

  useEffect(() => setCargado(leerPreferencia(CLAVE) === 'si'), []);

  if (cargado) {
    return (
      <div className={styles.marco}>
        <iframe
          src={site.instagramEmbed}
          title="Publicaciones de @elultimomiercoles en Instagram"
          loading="lazy"
          className={styles.iframe}
        />
      </div>
    );
  }

  return (
    <div className={styles.aviso}>
      <Icon name="instagram" size="lg" />
      <p>Fotos de las sesiones, lecturas y novedades del club en @elultimomiercoles.</p>
      <p className={styles.nota}>
        Al mostrarlas, Instagram (Meta) puede usar sus propias cookies.{' '}
        <Link href={routes.privacidad}>Más información</Link>.
      </p>
      <div className={styles.acciones}>
        <Button
          onClick={() => {
            guardarPreferencia(CLAVE, 'si');
            setCargado(true);
          }}
        >
          Mostrar publicaciones
        </Button>
        <Button href={site.instagram} variant="sencillo" icono="externo">
          Ver en Instagram
        </Button>
      </div>
    </div>
  );
}
