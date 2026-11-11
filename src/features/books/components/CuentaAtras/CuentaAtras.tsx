'use client';

import { useEffect, useState } from 'react';
import { site } from '@/config/site';
import { cuentaAtras, instanteSesion, type CuentaAtras as Estado } from '@/lib/format';
import styles from './CuentaAtras.module.css';

type CuentaAtrasProps = {
  /** Fecha de la sesión («2026-11-25»); la hora y la zona salen de site.sesion. */
  fecha?: string;
  /** Varias quedadas (una por club): cuenta hasta la siguiente que no haya pasado. */
  sesiones?: { fecha: string; nombre?: string }[];
  /** Inyectable en tests. */
  ahora?: () => Date;
};

const plural = (n: number, uno: string, varios: string) => `${n} ${n === 1 ? uno : varios}`;

function textos(
  e: Estado,
  nombre?: string,
): { cifra?: string; principal: string; detalle?: string } | null {
  const hora = site.sesion.hora;
  const de = nombre ? ` · ${nombre}` : '';
  switch (e.tipo) {
    case 'dias':
      return {
        cifra: String(e.dias),
        principal: nombre ? `días para la quedada del ${nombre}` : 'días para la próxima sesión',
        detalle: e.horas > 0 ? `y ${plural(e.horas, 'hora', 'horas')}` : undefined,
      };
    case 'manana':
      return { principal: '¡Mañana nos vemos!', detalle: `A las ${hora}${de}` };
    case 'hoy':
      return {
        principal: '¡Es hoy!',
        detalle: `Faltan ${e.horas > 0 ? `${plural(e.horas, 'hora', 'horas')} y ` : ''}${plural(e.minutos, 'minuto', 'minutos')} · a las ${hora}${de}`,
      };
    case 'en_marcha':
      return {
        principal: 'La sesión está en marcha',
        detalle: `Nos vemos en la librería${de}`,
      };
    case 'pasada':
      return null;
  }
}

/**
 * Cuenta atrás hasta la próxima sesión, calculada en el navegador con la fecha y hora actuales
 * (hora de Madrid). Se actualiza cada minuto. Antes de montarse no pinta nada (web estática).
 */
export function CuentaAtras({ fecha, sesiones, ahora = () => new Date() }: CuentaAtrasProps) {
  const [momento, setMomento] = useState<Date | null>(null);

  useEffect(() => {
    setMomento(ahora());
    const id = window.setInterval(() => setMomento(ahora()), 60_000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo al montar
  }, []);

  if (!momento) return null;
  const lista = sesiones ?? (fecha ? [{ fecha }] : []);
  // La primera quedada (por fecha) que aún no ha pasado.
  const t = [...lista]
    .sort((a, b) => a.fecha.localeCompare(b.fecha))
    .map((s) => {
      const instante = instanteSesion(s.fecha, site.sesion.hora, site.sesion.zona);
      return instante ? textos(cuentaAtras(instante, momento, site.sesion.zona), s.nombre) : null;
    })
    .find((x) => x !== null);
  if (!t) return null;

  return (
    <p className={styles.cuenta} role="timer" aria-atomic="true">
      {t.cifra && <span className={styles.cifra}>{t.cifra}</span>}
      <span className={styles.textos}>
        <span className={styles.principal}>{t.principal}</span>
        {t.detalle && <span className={styles.detalle}>{t.detalle}</span>}
      </span>
    </p>
  );
}
