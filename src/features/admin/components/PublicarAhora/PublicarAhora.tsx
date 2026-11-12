'use client';

import { useState } from 'react';
import { Button, useToast } from '@/components/ui';
import { mensajeDeError } from '@/lib/apps-script';
import { useCarga } from '../../hooks/use-carga';
import { estadoPublicacion, publicar } from '../../services/api';
import type { UltimaPublicacion } from '../../types';
import styles from './PublicarAhora.module.css';

type PublicarAhoraProps = { sesion: string; alCaducar: () => void };

function describir(u: UltimaPublicacion): string {
  const cuando = new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(u.creada_en));
  if (u.estado !== 'completed') return `Publicando… (empezó el ${cuando})`;
  return u.resultado === 'success'
    ? `Última publicación: ${cuando}`
    : `La última publicación (${cuando}) falló`;
}

/** «Publicar ahora»: rehace la web con lo que hay en la hoja (tarda 2–3 minutos). */
export function PublicarAhora({ sesion, alCaducar }: PublicarAhoraProps) {
  const toast = useToast();
  const [enviando, setEnviando] = useState(false);
  const { carga, recargar } = useCarga(() => estadoPublicacion(sesion), alCaducar);
  const info = carga.tipo === 'lista' ? carga.datos : null;

  async function alPublicar() {
    setEnviando(true);
    const r = await publicar(sesion);
    setEnviando(false);
    if (!r.ok) {
      if (r.error === 'sesion_no_valida') alCaducar();
      toast.mostrar(mensajeDeError(r.error), 'error');
      return;
    }
    toast.mostrar('¡Hecho! La web se actualizará en unos 3 minutos.', 'exito');
    window.setTimeout(() => void recargar(), 4000);
  }

  return (
    <section className={styles.tarjeta} aria-labelledby="publicar-titulo">
      <div className={styles.texto}>
        <h2 id="publicar-titulo" className={styles.titulo}>
          Publicar en la web
        </h2>
        <p className={styles.detalle} aria-live="polite">
          {info?.configurado === false
            ? 'Falta conectar GitHub (propiedad GH_DISPATCH_TOKEN del script). Mientras, la web se actualiza sola cada noche.'
            : info?.ultima
              ? describir(info.ultima)
              : 'Los cambios de la hoja llegan a la web al publicar (y solos cada noche).'}
        </p>
        {info?.ultima && (
          <a href={info.ultima.url} className={styles.enlace} rel="noopener noreferrer">
            Ver detalles en GitHub
          </a>
        )}
      </div>
      <Button
        icono="publicar"
        size="sm"
        onClick={() => void alPublicar()}
        disabled={enviando || info?.configurado === false}
      >
        {enviando ? 'Publicando…' : 'Publicar ahora'}
      </Button>
    </section>
  );
}
