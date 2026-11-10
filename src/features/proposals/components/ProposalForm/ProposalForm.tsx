'use client';

import { useEffect, useId, useState } from 'react';
import { Button, Icon } from '@/components/ui';
import { mensajeDeError } from '@/lib/apps-script';
import { codigoRecordado, olvidarCodigo, recordarCodigo } from '../../services/codigo-recordado';
import { enviarPropuesta, type DatosPropuesta } from '../../services/enviar-propuesta';
import { CodigoClub } from '../CodigoClub';
import { FormularioPropuesta } from '../FormularioPropuesta';
import styles from './ProposalForm.module.css';

const TITULO = 'Propón la próxima lectura';

type Paso =
  | { tipo: 'codigo'; error?: string }
  | { tipo: 'formulario'; codigo: string }
  | { tipo: 'enviada'; codigo: string; nombre: string; periodo: string };

/**
 * «Propón la próxima lectura»: formulario propio de la web, protegido con el código del club.
 * Las propuestas llegan a la pestaña Propuestas de la hoja y se gestionan desde /back.
 */
export function ProposalForm() {
  const tituloId = useId();
  const [paso, setPaso] = useState<Paso>({ tipo: 'codigo' });
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string>();
  // Clave para vaciar el formulario al proponer otra.
  const [vuelta, setVuelta] = useState(0);

  useEffect(() => {
    const codigo = codigoRecordado();
    if (codigo) setPaso({ tipo: 'formulario', codigo });
  }, []);

  async function enviar(codigo: string, datos: DatosPropuesta) {
    setEnviando(true);
    setError(undefined);
    const r = await enviarPropuesta(datos, codigo);
    setEnviando(false);
    if (r.ok) {
      setPaso({
        tipo: 'enviada',
        codigo,
        nombre: datos.nombre.trim(),
        periodo: `${datos.mes} de ${datos.anio}`,
      });
    } else if (r.error === 'codigo_incorrecto') {
      olvidarCodigo();
      setPaso({ tipo: 'codigo', error: 'El código del club ha cambiado. Escribe el nuevo.' });
    } else {
      setError(mensajeDeError(r.error, r.detalle));
    }
  }

  return (
    <section aria-labelledby={tituloId} className={styles.seccion}>
      <h2 id={tituloId} className={styles.titulo}>
        {TITULO}
      </h2>

      {paso.tipo === 'codigo' && (
        <CodigoClub
          errorInicial={paso.error}
          onCorrecto={(codigo) => {
            recordarCodigo(codigo);
            setPaso({ tipo: 'formulario', codigo });
          }}
        />
      )}

      {paso.tipo === 'formulario' && (
        <>
          <p className={styles.texto}>
            ¿Qué te gustaría leer con el club? Propón tres lecturas y las tendremos en cuenta para
            la próxima sesión.
          </p>
          <FormularioPropuesta
            key={vuelta}
            enviando={enviando}
            error={error}
            onEnviar={(datos) => void enviar(paso.codigo, datos)}
          />
        </>
      )}

      {paso.tipo === 'enviada' && (
        <div className={styles.gracias} role="status">
          <span className={styles.check} aria-hidden="true">
            <Icon name="exito" />
          </span>
          <p className={styles.mensaje}>
            ¡Gracias, {paso.nombre}! Hemos recibido tus lecturas para {paso.periodo}. Las veremos en
            la próxima sesión.
          </p>
          <Button
            variant="secundario"
            onClick={() => {
              setVuelta((v) => v + 1);
              setPaso({ tipo: 'formulario', codigo: paso.codigo });
            }}
          >
            Proponer otra
          </Button>
        </div>
      )}
    </section>
  );
}
