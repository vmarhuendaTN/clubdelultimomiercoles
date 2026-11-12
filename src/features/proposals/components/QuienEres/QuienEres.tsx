'use client';

import { useEffect } from 'react';
import { Input, Select } from '@/components/ui';
import { site } from '@/config/site';
import type { EstadoPersonas } from '../../hooks/use-personas-club';
import { etiquetaPersona, NO_ESTOY, personaRecordada } from '../../services/personas';
import styles from './QuienEres.module.css';

export type DatosQuien = {
  /** Id de la persona elegida, «otra» o vacío. */
  persona: string;
  nombre: string;
  apellidos: string;
  grupo: string;
};

export type ErroresQuien = Partial<Record<keyof DatosQuien, string>>;

type QuienEresProps = {
  personas: EstadoPersonas;
  valor: DatosQuien;
  onCambiar: (campo: keyof DatosQuien, valor: string) => void;
  errores: ErroresQuien;
  /** Pregunta también el club (al proponer). */
  conClub?: boolean;
};

const conVacia = (opciones: { value: string; label: string }[], texto = 'Elige…') => [
  { value: '', label: texto },
  ...opciones,
];

/**
 * «¿Quién eres?»: con la lista del club, cada uno elige su nombre y todo lo que envía queda unido
 * a su ficha (sin erratas ni variantes). Si no está en la lista, escribe su nombre como siempre.
 */
export function QuienEres({
  personas,
  valor,
  onCambiar,
  errores,
  conClub = false,
}: QuienEresProps) {
  const lista = personas.tipo === 'lista' ? personas.personas : null;

  // Recuerda quién eras la última vez en este navegador.
  useEffect(() => {
    if (!lista || valor.persona) return;
    const recordada = personaRecordada();
    if (lista.some((p) => p.id === recordada)) onCambiar('persona', recordada);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo cuando llega la lista
  }, [lista]);

  const aMano = !lista || valor.persona === NO_ESTOY;
  return (
    <div className={styles.quien}>
      {personas.tipo === 'cargando' && (
        <p className={styles.texto} role="status">
          Cargando la lista del club…
        </p>
      )}
      {lista && (
        <Select
          label="¿Quién eres?"
          opciones={conVacia(
            [
              ...lista.map((p) => ({ value: p.id, label: etiquetaPersona(p) })),
              { value: NO_ESTOY, label: 'No estoy en la lista' },
            ],
            'Elige tu nombre…',
          )}
          value={valor.persona}
          onChange={(e) => onCambiar('persona', e.target.value)}
          error={errores.persona}
          ayuda="Así lo que envías queda unido a tu ficha del club."
          required
        />
      )}
      {personas.tipo !== 'cargando' && aMano && (
        <>
          <div className={styles.dos}>
            <Input
              label="Nombre"
              autoComplete="given-name"
              maxLength={60}
              required
              value={valor.nombre}
              error={errores.nombre}
              onChange={(e) => onCambiar('nombre', e.target.value)}
            />
            <Input
              label="Apellidos"
              autoComplete="family-name"
              maxLength={80}
              required
              value={valor.apellidos}
              error={errores.apellidos}
              onChange={(e) => onCambiar('apellidos', e.target.value)}
            />
          </div>
          {conClub && (
            <Select
              label="¿De qué club eres?"
              opciones={conVacia(site.gruposClub.map((g) => ({ value: g, label: g })))}
              required
              value={valor.grupo}
              error={errores.grupo}
              onChange={(e) => onCambiar('grupo', e.target.value)}
            />
          )}
        </>
      )}
    </div>
  );
}

/** Errores de «¿Quién eres?» según lo elegido (sin lista, nombre a mano obligatorio). */
export function validarQuien(
  valor: DatosQuien,
  personas: EstadoPersonas,
  conClub: boolean,
): ErroresQuien {
  const errores: ErroresQuien = {};
  if (personas.tipo === 'lista' && !valor.persona) errores.persona = 'Elige tu nombre.';
  const aMano = personas.tipo !== 'lista' || valor.persona === NO_ESTOY;
  if (aMano) {
    if (!valor.nombre.trim()) errores.nombre = 'Escribe tu nombre.';
    if (!valor.apellidos.trim()) errores.apellidos = 'Escribe tus apellidos.';
    if (conClub && !valor.grupo.trim()) errores.grupo = 'Dinos de qué club eres.';
  }
  return errores;
}
