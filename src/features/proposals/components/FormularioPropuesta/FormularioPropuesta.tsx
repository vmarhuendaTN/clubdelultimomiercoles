'use client';

import { useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { Button, Input, Select, TextArea } from '@/components/ui';
import { site } from '@/config/site';
import type { DatosPropuesta } from '../../services/enviar-propuesta';
import { MESES, aniosPosibles } from '../../services/periodo';
import styles from './FormularioPropuesta.module.css';

const VACIA: DatosPropuesta = {
  nombre: '',
  apellidos: '',
  grupo: '',
  mes: '',
  anio: '',
  lectura_1: '',
  lectura_2: '',
  lectura_3: '',
  tintero: '',
  motivo: '',
};

type Campo = keyof DatosPropuesta;
type Errores = Partial<Record<Campo, string>>;

const OBLIGATORIOS: Record<Exclude<Campo, 'tintero' | 'motivo'>, string> = {
  nombre: 'Escribe tu nombre.',
  apellidos: 'Escribe tus apellidos.',
  grupo: 'Dinos de qué grupo eres.',
  mes: 'Elige el mes.',
  anio: 'Elige el año.',
  lectura_1: 'Escribe tu primera lectura.',
  lectura_2: 'Escribe tu segunda lectura.',
  lectura_3: 'Escribe tu tercera lectura.',
};

const capitalizar = (t: string) => t.charAt(0).toUpperCase() + t.slice(1);
const conVacia = (opciones: { value: string; label: string }[]) => [
  { value: '', label: 'Elige…' },
  ...opciones,
];

type FormularioPropuestaProps = {
  onEnviar: (datos: DatosPropuesta) => void;
  enviando: boolean;
  /** Error al enviar (red, código…), se anuncia encima del botón. */
  error?: string;
};

function Grupo({ legend, children }: { legend: string; children: ReactNode }) {
  return (
    <fieldset className={styles.grupo}>
      <legend className={styles.legend}>{legend}</legend>
      {children}
    </fieldset>
  );
}

/** Las mismas preguntas que el antiguo Google Form de propuestas, con el aspecto de la web. */
export function FormularioPropuesta({ onEnviar, enviando, error }: FormularioPropuestaProps) {
  const [datos, setDatos] = useState<DatosPropuesta>(VACIA);
  const [errores, setErrores] = useState<Errores>({});
  const meses = useMemo(
    () => conVacia(MESES.map((m) => ({ value: m, label: capitalizar(m) }))),
    [],
  );
  const anios = useMemo(() => conVacia(aniosPosibles().map((a) => ({ value: a, label: a }))), []);
  const grupos = site.gruposClub;

  const campo = (nombre: Campo) => ({
    value: datos[nombre],
    error: errores[nombre],
    onChange: (e: { target: { value: string } }) => {
      setDatos((d) => ({ ...d, [nombre]: e.target.value }));
      setErrores((er) => ({ ...er, [nombre]: undefined }));
    },
  });

  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const nuevos: Errores = {};
    for (const [nombre, mensaje] of Object.entries(OBLIGATORIOS)) {
      if (!datos[nombre as Campo].trim()) nuevos[nombre as Campo] = mensaje;
    }
    setErrores(nuevos);
    if (Object.keys(nuevos).length === 0) onEnviar(datos);
  }

  return (
    <form className={styles.formulario} onSubmit={enviar} noValidate>
      <Grupo legend="Sobre ti">
        <div className={styles.dos}>
          <Input
            label="Nombre"
            autoComplete="given-name"
            maxLength={60}
            required
            {...campo('nombre')}
          />
          <Input
            label="Apellidos"
            autoComplete="family-name"
            maxLength={80}
            required
            {...campo('apellidos')}
          />
        </div>
        {grupos.length > 0 ? (
          <Select
            label="¿De qué grupo eres?"
            opciones={conVacia(grupos.map((g) => ({ value: g, label: g })))}
            required
            {...campo('grupo')}
          />
        ) : (
          <Input label="¿De qué grupo eres?" maxLength={60} required {...campo('grupo')} />
        )}
      </Grupo>

      <Grupo legend="¿Para qué sesión?">
        <div className={styles.dos}>
          <Select label="Mes" opciones={meses} required {...campo('mes')} />
          <Select label="Año" opciones={anios} required {...campo('anio')} />
        </div>
      </Grupo>

      <Grupo legend="Tus tres lecturas">
        <Input
          label="Lectura 1"
          ayuda="Título y autor o autora."
          maxLength={200}
          required
          {...campo('lectura_1')}
        />
        <Input label="Lectura 2" maxLength={200} required {...campo('lectura_2')} />
        <Input label="Lectura 3" maxLength={200} required {...campo('lectura_3')} />
      </Grupo>

      <TextArea
        label="Lecturas en el tintero que te gustaría hacer"
        ayuda="Opcional. Otras que te apetecen para más adelante."
        maxLength={2000}
        rows={3}
        {...campo('tintero')}
      />
      <TextArea
        label="¿Por qué te interesan? (opcional)"
        maxLength={2000}
        rows={3}
        {...campo('motivo')}
      />

      {error && (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      )}
      <div>
        <Button type="submit" disabled={enviando}>
          {enviando ? 'Enviando…' : 'Enviar propuesta'}
        </Button>
      </div>
    </form>
  );
}
