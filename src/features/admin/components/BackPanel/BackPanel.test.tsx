import { fireEvent, render, screen } from '@testing-library/react';
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
  estadoScript: vi.fn().mockResolvedValue({ ok: true, version: 10 }),
  diagnostico: vi.fn().mockResolvedValue({ ok: true, version: 10, faltan: [], libros: 'ok' }),
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

  it('una editora ve Lecturas, Propuestas e Inscritas, pero no Equipo', async () => {
    sesion.estado = {
      tipo: 'dentro',
      sesion: 's1',
      persona: { email: 'ines@example.com', nombre: 'Inés', rol: 'editora' },
    };
    pintar();
    expect(screen.getByText(/Hola, Inés/)).toBeInTheDocument();
    expect(screen.getAllByRole('tab').map((t) => t.textContent)).toEqual([
      'Lecturas',
      'Propuestas',
      'Inscritas',
    ]);
    expect(await screen.findByText(/no tiene lecturas/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: 'Propuestas' }));
    expect(await screen.findByText(/Todavía no hay lecturas propuestas/)).toBeInTheDocument();
  });

  it('una administradora ve también Equipo, y puede salir', async () => {
    sesion.estado = {
      tipo: 'dentro',
      sesion: 's1',
      persona: { email: 'yo@example.com', nombre: '', rol: 'admin' },
    };
    pintar();
    fireEvent.click(screen.getByRole('tab', { name: 'Equipo' }));
    expect(await screen.findByRole('heading', { name: 'Añadir al equipo' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Salir' }));
    expect(sesion.salir).toHaveBeenCalled();
  });
});
