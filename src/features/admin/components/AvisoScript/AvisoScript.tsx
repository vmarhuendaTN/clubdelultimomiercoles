'use client';

import { useEffect, useState } from 'react';
import { VERSION_SCRIPT } from '@/lib/apps-script';
import { diagnostico, estadoScript } from '../../services/api';
import styles from './AvisoScript.module.css';

type AvisoScriptProps = { sesion: string; esAdmin: boolean };

type Problemas = { versionHoja?: number; faltan: string[]; libros?: string };

/**
 * Avisa en el panel si la hoja tiene un script más antiguo que la web (y, para las
 * administradoras, si faltan propiedades o falla Google Libros). Sin problemas, no se ve.
 */
export function AvisoScript({ sesion, esAdmin }: AvisoScriptProps) {
  const [problemas, setProblemas] = useState<Problemas | null>(null);

  useEffect(() => {
    let vivo = true;
    void (async () => {
      const estado = await estadoScript();
      if (!estado.ok) return;
      const version = Number(estado.version ?? 0);
      if (version < VERSION_SCRIPT) {
        if (vivo) setProblemas({ versionHoja: version, faltan: [] });
        return;
      }
      if (!esAdmin) return;
      const d = await diagnostico(sesion);
      if (!vivo || !d.ok) return;
      const libros = d.libros === 'ok' ? undefined : d.libros;
      if (d.faltan.length || libros) setProblemas({ faltan: d.faltan, libros });
    })();
    return () => {
      vivo = false;
    };
  }, [sesion, esAdmin]);

  if (!problemas) return null;

  return (
    <div className={styles.aviso} role="status">
      <h2 className={styles.titulo}>Hay que revisar el script de la hoja</h2>
      {problemas.versionHoja !== undefined && (
        <p>
          La hoja tiene la versión {problemas.versionHoja || 'antigua'} del script y la web necesita
          la {VERSION_SCRIPT}. Hasta que se actualice, propuestas, tintero, votación y archivo
          pueden fallar. Pega el <code>apps-script/Code.gs</code> del repositorio en Extensiones ›
          Apps Script, guarda e implementa como <strong>Nueva versión</strong> (Implementar ›
          Gestionar implementaciones › lápiz). Guía en la pestaña Instrucciones de la hoja.
        </p>
      )}
      {problemas.faltan.length > 0 && (
        <p>
          Faltan propiedades del script: <strong>{problemas.faltan.join(', ')}</strong>
          {'. '}Se añaden en Apps Script › Configuración del proyecto › Propiedades del script.
        </p>
      )}
      {problemas.libros && <p>Buscador de Google Libros: {problemas.libros}</p>}
    </div>
  );
}
