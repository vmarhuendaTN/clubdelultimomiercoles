'use client';

import { useState, type FormEvent } from 'react';
import { Button, Input, TextArea } from '@/components/ui';
import { site } from '@/config/site';
import {
  enlaceSolicitud,
  validarSolicitud,
  type ErroresSolicitud,
  type Solicitud,
} from '../../services/solicitud';
import styles from './JoinForm.module.css';

const VACIA: Solicitud = {
  nombre: '',
  apellidos: '',
  telefono: '',
  descripcion: '',
  deParteDe: '',
};

/**
 * «Quiero ser del club»: prepara un email al club con los datos de la persona.
 * La web no guarda nada: el mensaje se envía desde la aplicación de correo de quien lo rellena.
 */
export function JoinForm() {
  const [datos, setDatos] = useState<Solicitud>(VACIA);
  const [errores, setErrores] = useState<ErroresSolicitud>({});
  const [preparada, setPreparada] = useState(false);

  const campo = (clave: keyof Solicitud) => ({
    value: datos[clave],
    error: errores[clave],
    onChange: (e: { target: { value: string } }) => {
      setDatos((d) => ({ ...d, [clave]: e.target.value }));
      setErrores((er) => ({ ...er, [clave]: undefined }));
    },
  });

  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const encontrados = validarSolicitud(datos);
    setErrores(encontrados);
    const primero = Object.keys(encontrados)[0];
    if (primero) {
      evento.currentTarget.querySelector<HTMLElement>(`[name="${primero}"]`)?.focus();
      return;
    }
    window.location.href = enlaceSolicitud(site.email, datos);
    setPreparada(true);
  }

  return (
    <form onSubmit={enviar} className={styles.formulario} noValidate>
      <div className={styles.fila}>
        <Input
          label="Nombre"
          name="nombre"
          autoComplete="given-name"
          required
          {...campo('nombre')}
        />
        <Input
          label="Apellidos"
          name="apellidos"
          autoComplete="family-name"
          required
          {...campo('apellidos')}
        />
      </div>
      <Input
        label="Teléfono de contacto"
        name="telefono"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        required
        {...campo('telefono')}
      />
      <TextArea
        label="Cuéntanos algo de ti"
        name="descripcion"
        ayuda="Qué te gusta leer, por qué te apetece unirte…"
        required
        {...campo('descripcion')}
      />
      <Input
        label="¿Vienes de parte de alguien? (opcional)"
        name="deParteDe"
        autoComplete="off"
        {...campo('deParteDe')}
      />
      <div className={styles.acciones}>
        <Button type="submit" icono="externo">
          Preparar el email
        </Button>
      </div>
      <p className={styles.nota} role="status">
        {preparada
          ? `Se ha abierto tu correo con la solicitud lista: solo falta enviarla. ¿No se ha abierto? Escríbenos a ${site.email}.`
          : 'Al pulsar se abrirá tu aplicación de correo con el mensaje preparado para enviarlo al club. La web no guarda tus datos.'}
      </p>
    </form>
  );
}
