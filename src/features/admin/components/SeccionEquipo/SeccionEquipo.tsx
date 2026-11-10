'use client';

import { useState, type FormEvent } from 'react';
import { BottomSheet, Button, Input, Pill, Select, useToast } from '@/components/ui';
import { mensajeDeError } from '@/lib/apps-script';
import { useCarga } from '../../hooks/use-carga';
import { guardarEnEquipo, listarEquipo, quitarDeEquipo } from '../../services/api';
import { ROLES, etiqueta } from '../../services/etiquetas';
import type { MiembroEquipo, Rol } from '../../types';
import { EstadoCarga } from '../EstadoCarga';
import styles from './SeccionEquipo.module.css';

type SeccionEquipoProps = { sesion: string; miEmail: string; alCaducar: () => void };

const VACIO: MiembroEquipo = { email: '', nombre: '', rol: 'editora' };

/** Quién puede entrar al panel (solo administradoras). */
export function SeccionEquipo({ sesion, miEmail, alCaducar }: SeccionEquipoProps) {
  const toast = useToast();
  const { carga, recargar } = useCarga(() => listarEquipo(sesion), alCaducar);
  const [nuevo, setNuevo] = useState<MiembroEquipo>(VACIO);
  const [errorEmail, setErrorEmail] = useState<string>();
  const [ocupado, setOcupado] = useState(false);
  const [aQuitar, setAQuitar] = useState<MiembroEquipo | null>(null);

  async function ejecutar(accion: () => ReturnType<typeof guardarEnEquipo>, exito: string) {
    setOcupado(true);
    const r = await accion();
    setOcupado(false);
    if (!r.ok) {
      if (r.error === 'sesion_no_valida') alCaducar();
      toast.mostrar(mensajeDeError(r.error, r.detalle), 'error');
      return false;
    }
    toast.mostrar(exito, 'exito');
    await recargar();
    return true;
  }

  async function anadir(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(nuevo.email.trim())) {
      setErrorEmail('Escribe un email válido (el de su cuenta de Google).');
      return;
    }
    const ok = await ejecutar(
      () => guardarEnEquipo(sesion, { ...nuevo, email: nuevo.email.trim().toLowerCase() }),
      `${nuevo.nombre || nuevo.email} ya puede entrar al panel.`,
    );
    if (ok) setNuevo(VACIO);
  }

  async function quitar(m: MiembroEquipo) {
    const ok = await ejecutar(
      () => quitarDeEquipo(sesion, m.email),
      `${m.nombre || m.email} ya no tiene acceso.`,
    );
    if (ok) setAQuitar(null);
  }

  return (
    <div className={styles.seccion}>
      {carga.tipo === 'cargando' && <EstadoCarga tipo="cargando" texto="Cargando el equipo…" />}
      {carga.tipo === 'error' && (
        <EstadoCarga tipo="error" error={carga.error} onReintentar={() => void recargar()} />
      )}
      {carga.tipo === 'lista' && (
        <ul className={styles.lista} aria-label="Personas del equipo">
          {carga.datos.equipo.map((m) => (
            <li key={m.email} className={styles.fila}>
              <span className={styles.datos}>
                <span className={styles.nombre}>{m.nombre || m.email}</span>
                <span className={styles.email}>{m.email}</span>
              </span>
              <Pill variant={m.rol === 'admin' ? 'mostaza' : 'neutro'}>
                {etiqueta(ROLES, m.rol)}
              </Pill>
              {m.email !== miEmail && (
                <Button
                  variant="sencillo"
                  size="sm"
                  onClick={() => setAQuitar(m)}
                  aria-label={`Quitar a ${m.nombre || m.email}`}
                >
                  Quitar
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}

      <form className={styles.formulario} onSubmit={(e) => void anadir(e)} noValidate>
        <h3 className={styles.subtitulo}>Añadir al equipo</h3>
        <Input
          label="Email de Google"
          type="email"
          autoComplete="off"
          value={nuevo.email}
          onChange={(e) => {
            setNuevo({ ...nuevo, email: e.target.value });
            setErrorEmail(undefined);
          }}
          error={errorEmail}
          required
        />
        <Input
          label="Nombre"
          value={nuevo.nombre}
          onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })}
        />
        <Select
          label="Rol"
          opciones={ROLES}
          value={nuevo.rol}
          onChange={(e) => setNuevo({ ...nuevo, rol: e.target.value as Rol })}
          ayuda="Las administradoras además gestionan el equipo."
        />
        <div>
          <Button type="submit" icono="anadir" disabled={ocupado}>
            Añadir
          </Button>
        </div>
      </form>

      <BottomSheet
        open={aQuitar !== null}
        onClose={() => setAQuitar(null)}
        titulo="Quitar del equipo"
        acciones={
          <>
            <Button variant="secundario" onClick={() => setAQuitar(null)}>
              Cancelar
            </Button>
            <Button onClick={() => aQuitar && void quitar(aQuitar)} disabled={ocupado}>
              Quitar
            </Button>
          </>
        }
      >
        <p>
          {aQuitar?.nombre || aQuitar?.email} dejará de poder entrar al panel. Puedes volver a
          añadirla cuando quieras.
        </p>
      </BottomSheet>
    </div>
  );
}
