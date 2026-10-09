'use client';

import { useState } from 'react';
import {
  BottomSheet,
  Button,
  Input,
  PasswordField,
  SegmentedControl,
  useToast,
} from '@/components/ui';
import styles from './StyleGuide.module.css';

const filtros = [
  { value: 'leidos', label: 'Leídos' },
  { value: 'proximo', label: 'Próximo' },
  { value: 'propuestas', label: 'Propuestas' },
] as const;
type Filtro = (typeof filtros)[number]['value'];

const textosFiltro: Record<Filtro, string> = {
  leidos: '25 libros leídos desde que empezó el club.',
  proximo: 'Próxima sesión: miércoles 25 de noviembre · 19:30.',
  propuestas: 'Aún no hay propuestas. ¡Escribe al club!',
};

export function SegmentedDemo() {
  const [filtro, setFiltro] = useState<Filtro>('leidos');
  return (
    <div className="stack">
      <SegmentedControl
        id="estilo-filtro"
        label="Filtrar lecturas"
        segments={filtros}
        value={filtro}
        onChange={setFiltro}
      />
      <div
        id="estilo-filtro-panel"
        role="tabpanel"
        aria-labelledby={`estilo-filtro-tab-${filtro}`}
        className={styles.panel}
      >
        {textosFiltro[filtro]}
      </div>
    </div>
  );
}

export function SheetDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="secundario" onClick={() => setOpen(true)}>
        Abrir hoja
      </Button>
      <BottomSheet
        open={open}
        onClose={() => setOpen(false)}
        titulo="Filtrar por año"
        acciones={
          <>
            <Button anchoCompleto onClick={() => setOpen(false)}>
              Aplicar
            </Button>
            <Button anchoCompleto variant="secundario" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
          </>
        }
      >
        <p>
          Las hojas suben desde abajo en móvil y son un diálogo centrado en escritorio. Esc cierra.
        </p>
      </BottomSheet>
    </>
  );
}

export function ToastDemo() {
  const { mostrar } = useToast();
  return (
    <div className="cluster">
      <Button variant="secundario" size="sm" onClick={() => mostrar('Cambios publicados', 'exito')}>
        Aviso de éxito
      </Button>
      <Button
        variant="secundario"
        size="sm"
        onClick={() => mostrar('No se pudo sincronizar', 'error')}
      >
        Aviso de error
      </Button>
      <Button
        variant="secundario"
        size="sm"
        onClick={() => mostrar('La próxima sesión es en dos semanas')}
      >
        Aviso informativo
      </Button>
    </div>
  );
}

export function FormDemo() {
  const [error, setError] = useState<string>();
  return (
    <form
      className={`stack ${styles.formulario}`}
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        const email = new FormData(e.currentTarget).get('email');
        setError(
          typeof email === 'string' && email.includes('@')
            ? undefined
            : 'Escribe un email válido, por ejemplo nombre@ejemplo.com',
        );
      }}
    >
      <Input
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        inputMode="email"
        error={error}
      />
      <PasswordField
        label="Contraseña"
        name="password"
        autoComplete="current-password"
        ayuda="Mínimo 8 caracteres."
      />
      <Input label="Campo deshabilitado" disabled defaultValue="No editable" />
      <Button type="submit" anchoCompleto>
        Entrar
      </Button>
    </form>
  );
}
