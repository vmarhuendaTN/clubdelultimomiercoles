import { render, screen } from '@testing-library/react';
import type * as VotacionModulo from '../../services/votacion';
import { PaginaRonda } from './PaginaRonda';

const votacion = vi.hoisted(() => ({ cargarVotacion: vi.fn() }));
vi.mock('../../services/votacion', async (original) => ({
  ...(await original<typeof VotacionModulo>()),
  ...votacion,
}));

describe('PaginaRonda', () => {
  beforeEach(() => {
    window.localStorage.setItem('club:codigo-propuestas', 'bien');
    votacion.cargarVotacion.mockReset();
  });

  it('/votar/ sin votación abierta lo explica', async () => {
    votacion.cargarVotacion.mockResolvedValue({ ok: true, votacion: null });
    render(<PaginaRonda modo="votar" />);
    expect(screen.getByRole('heading', { level: 1, name: 'Votación' })).toBeInTheDocument();
    expect(await screen.findByText(/no hay ninguna votación abierta/)).toBeInTheDocument();
    expect(screen.queryByRole('tab')).toBeNull();
  });

  it('/votar/ con votación abierta muestra solo el formulario de voto', async () => {
    votacion.cargarVotacion.mockResolvedValue({
      ok: true,
      votacion: { sesion: '2027-01', candidatas: [{ id: 'a', titulo: 'Circe', autor: '' }] },
    });
    render(<PaginaRonda modo="votar" />);
    expect(await screen.findByRole('button', { name: 'Enviar mi voto' })).toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: 'Proponer' })).toBeNull();
  });

  it('/proponer/ muestra solo el formulario de propuestas', async () => {
    render(<PaginaRonda modo="proponer" />);
    expect(screen.getByRole('heading', { level: 1, name: 'Propuestas' })).toBeInTheDocument();
    expect(await screen.findByLabelText(/^Lectura 1/)).toBeInTheDocument();
    expect(votacion.cargarVotacion).not.toHaveBeenCalled();
  });
});
