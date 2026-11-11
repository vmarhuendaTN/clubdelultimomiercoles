'use client';

import { useEffect, useState } from 'react';
import { site } from '@/config/site';
import { cuentaAtras, instanteSesion, type CuentaAtras as Estado } from '@/lib/format';
import styles from './CuentaAtras.module.css';

type CuentaAtrasProps = {
  /** Fecha de la sesión («2026-11-25»); la hora y la zona salen de site.sesion. */
  fecha: string;
  /** Inyectable en tests. */
  ahora?: () => Date;
};

const plural = (n: number, uno: string, varios: string) => `${n} ${n === 1 ? uno : varios}`;

function textos(e: Estado): { cifra?: string; principal: string; detalle?: string } | null {
  const hora = site.sesion.hora;
  switch (e.tipo) {
    case 'dias':
      return {
        cifra: String(e.dias),
        principal: 'días para la próxima sesión',
        detalle: e.horas > 0 ? `y ${plural(e.horas, 'hora', 'horas')}` : undefined,
      };
    case 'manana':
      return { principal: '¡Mañana nos vemos!', detalle: `A las ${hora}` };
    case 'hoy':
      return {
        principal: '¡Es hoy!',
        detalle: `Faltan ${e.horas > 0 ? `${plural(e.horas, 'hora', 'horas')} y ` : ''}${plural(e.minutos, 'minuto', 'minutos')} · a las ${hora}`,
      };
    case 'en_marcha':
      return { principal: 'La sesión está en marcha', detalle: 'Nos vemos en la librería' };
    case 'pasada':
      return null;
  }
}

/**
 * Cuenta atrás hasta la próxima sesión, calculada en el navegador con la fecha y hora actuales
 * (hora de Madrid). Se actualiza cada minuto. Antes de montarse no pinta nada (web estática).
 */
export function CuentaAtras({ fecha, ahora = () => new Date() }: CuentaAtrasProps) {
  const [momento, setMomento] = useState<Date | null>(null);

  useEffect(() => {
    setMomento(ahora());
    const id = window.setInterval(() => setMomento(ahora()), 60_000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo al montar
  }, []);

  const sesion = instanteSesion(fecha, site.sesion.hora, site.sesion.zona);
  if (!momento || !sesion) return null;
  const t = textos(cuentaAtras(sesion, momento, site.sesion.zona));
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
