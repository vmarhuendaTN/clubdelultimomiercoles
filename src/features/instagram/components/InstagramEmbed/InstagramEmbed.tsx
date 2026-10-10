'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui';
import { site } from '@/config/site';
import { alturaDeMensaje } from '../../services/altura-embed';
import styles from './InstagramEmbed.module.css';

/**
 * Perfil de Instagram incrustado (últimas publicaciones). Se carga con la página; Meta puede
 * usar sus propias cookies (explicado en /privacidad).
 *
 * Altura: por defecto, proporcional al ancho (cabecera del perfil + rejilla de fotos
 * cuadradas); si Instagram comunica su altura real, se ajusta exacta y no queda hueco.
 */
export function InstagramEmbed() {
  const [altura, setAltura] = useState<number | null>(null);

  useEffect(() => {
    const escuchar = (evento: MessageEvent) => {
      const medida = alturaDeMensaje(evento);
      if (medida) setAltura(medida);
    };
    window.addEventListener('message', escuchar);
    return () => window.removeEventListener('message', escuchar);
  }, []);

  return (
    <div className={styles.marco}>
      <div className={styles.contenedor}>
        <iframe
          src={site.instagramEmbed}
          title="Publicaciones de @elultimomiercoles en Instagram"
          loading="lazy"
          scrolling="no"
          // Medida: la altura va en el atributo `height` y la clase no fija ninguna.
          className={altura ? styles.iframeMedido : styles.iframe}
          height={altura ?? undefined}
        />
      </div>
      <Button href={site.instagram} variant="sencillo" icono="externo">
        Ver en Instagram
      </Button>
    </div>
  );
}
