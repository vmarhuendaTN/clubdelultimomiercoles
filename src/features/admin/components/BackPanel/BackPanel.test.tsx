import { fireEvent, render, screen, within } from '@testing-library/react';
import { ToastProvider } from '@/components/ui';
import { BackPanel } from './BackPanel';

const sesion = vi.hoisted(() => ({ estado: { tipo: 'fuera' } as unknown, salir: vi.fn() }));
vi.mock('../../hooks/use-sesion-equipo', () => ({
  useSesionEquipo: () => ({ estado: sesion.estado, entrarConGoogle: vi.fn(), salir: sesion.salir }),
}));
const api = vi.hoisted(() => ({
  estadoPublicacion: vi.fn().mockResolvedValue({ ok: true, configurado: true, ultima: null }),
  listarLecturas: vi.fn().mockResolvedValue({ ok: true, lecturas: [] }),
  listarPropuestas: vi.fn().mockResolvedValue({ ok: true, propuestas: [] }),
  listarTintero: vi.fn().mockResolvedValue({ ok: true, tintero: [] }),
  listarVotacion: vi.fn().mockResolvedValue({ ok: true, candidatas: [], votos: [] }),
  listarEquipo: vi.fn().mockResolvedValue({ ok: true, equipo: [] }),
  listarInscritas: vi.fn().mockResolvedValue({ ok: true, inscritas: [], sinInscribir: [] }),
  listarValoraciones: vi
    .fn()
    .mockResolvedValue({ ok: true, valoraciones: [], lecturas: [], inscritas: [] }),
  estadoScript: vi.fn().mockResolvedValue({ ok: true, version: 13 }),
  diagnostico: vi.fn().mockResolvedValue({ ok: true, version: 13, faltan: [], libros: 'ok' }),
}));
vi.mock('../../services/api', () => api);

const pintar = () =>
  render(
    <ToastProvider>
      <BackPanel />
    </ToastProvider>,
  );

describe('BackPanel', () => {
  it('sin sesión muestra la entrada con Google', () => {
    sesion.estado = { tipo: 'fuera' };
    pintar();
    expect(screen.getByRole('heading', { name: 'Panel del club' })).toBeInTheDocument();
    expect(screen.getByText(/pestaña Equipo/)).toBeInTheDocument();
  });

  it('una editora ve todas las secciones en un solo nivel, salvo Equipo', async () => {
    sesion.estado = {
      tipo: 'dentro',
      sesion: 's1',
      persona: { email: 'ines@example.com', nombre: 'Inés', rol: 'editora' },
    };
    pintar();
    expect(screen.getByText(/Hola, Inés/)).toBeInTheDocument();
    const menu = screen.getByRole('navigation', { name: 'Secciones del panel' });
    expect(
      within(menu)
        .getAllByRole('button')
        .map((b) => b.textContent),
    ).toEqual([
      'Lecturas',
      'Propuestas',
      'Quién propone',
      'Votación',
      'Tintero',
      'Archivo',
      'Inscritas',
      'Valoraciones',
    ]);
    expect(within(menu).getByRole('button', { name: 'Lecturas' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(await screen.findByText(/no tiene lecturas/)).toBeInTheDocument();
    fireEvent.click(within(menu).getByRole('button', { name: 'Propuestas' }));
    expect(screen.getByRole('heading', { level: 2, name: 'Propuestas' })).toBeInTheDocument();
    expect(await screen.findByText(/Todavía no hay lecturas propuestas/)).toBeInTheDocument();
    expect(window.localStorage.getItem('club:panel-seccion')).toBe('propuestas');
  });

  it('en el móvil, el selector abre la lista completa de secciones', async () => {
    sesion.estado = {
      tipo: 'dentro',
      sesion: 's1',
      persona: { email: 'ines@example.com', nombre: 'Inés', rol: 'editora' },
    };
    window.localStorage.removeItem('club:panel-seccion');
    pintar();
    fireEvent.click(screen.getByRole('button', { name: /Cambiar de sección/ }));
    const hoja = screen.getByRole('navigation', { name: 'Secciones del panel (móvil)' });
    fireEvent.click(within(hoja).getByRole('button', { name: 'Inscritas' }));
    expect(screen.getByRole('heading', { level: 2, name: 'Inscritas' })).toBeInTheDocument();
    expect(screen.getByLabelText('Club')).toBeInTheDocument();
  });

  it('una administradora ve también Equipo, y puede salir', async () => {
    sesion.estado = {
      tipo: 'dentro',
      sesion: 's1',
      persona: { email: 'yo@example.com', nombre: '', rol: 'admin' },
    };
    pintar();
    const menu = screen.getByRole('navigation', { name: 'Secciones del panel' });
    fireEvent.click(within(menu).getByRole('button', { name: 'Equipo' }));
    expect(await screen.findByRole('heading', { name: 'Añadir al equipo' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Salir' }));
    expect(sesion.salir).toHaveBeenCalled();
  });
});
