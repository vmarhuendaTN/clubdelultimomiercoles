import { fireEvent, render, screen } from '@testing-library/react';
import { ToastProvider } from '@/components/ui';
import { SeccionEquipo } from './SeccionEquipo';

const api = vi.hoisted(() => ({
  listarEquipo: vi.fn(),
  guardarEnEquipo: vi.fn(),
  quitarDeEquipo: vi.fn(),
}));
vi.mock('../../services/api', () => api);

const EQUIPO = [
  { email: 'yo@example.com', nombre: 'Victoria', rol: 'admin' },
  { email: 'ines@example.com', nombre: 'Inés', rol: 'editora' },
];

const pintar = () =>
  render(
    <ToastProvider>
      <SeccionEquipo sesion="s1" miEmail="yo@example.com" alCaducar={vi.fn()} />
    </ToastProvider>,
  );

describe('SeccionEquipo', () => {
  beforeEach(() => {
    Object.values(api).forEach((f) => f.mockReset());
    api.listarEquipo.mockResolvedValue({ ok: true, equipo: EQUIPO });
  });

  it('lista el equipo y no deja quitarte a ti misma', async () => {
    pintar();
    expect(await screen.findByText('Inés')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Quitar a Inés' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Quitar a Victoria' })).toBeNull();
  });

  it('valida el email y añade a alguien', async () => {
    api.guardarEnEquipo.mockResolvedValue({ ok: true });
    pintar();
    await screen.findByText('Inés');
    fireEvent.click(screen.getByRole('button', { name: 'Añadir' }));
    expect(screen.getByText(/Escribe un email válido/)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText(/Email de Google/), {
      target: { value: ' Nueva@Example.com ' },
    });
    fireEvent.change(screen.getByLabelText('Nombre'), { target: { value: 'Nueva' } });
    fireEvent.click(screen.getByRole('button', { name: 'Añadir' }));
    expect(await screen.findByText('Nueva ya puede entrar al panel.')).toBeInTheDocument();
    expect(api.guardarEnEquipo).toHaveBeenCalledWith('s1', {
      email: 'nueva@example.com',
      nombre: 'Nueva',
      rol: 'editora',
    });
  });

  it('quitar pide confirmación', async () => {
    api.quitarDeEquipo.mockResolvedValue({ ok: true });
    pintar();
    fireEvent.click(await screen.findByRole('button', { name: 'Quitar a Inés' }));
    expect(screen.getByText(/dejará de poder entrar/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Quitar' }));
    expect(await screen.findByText('Inés ya no tiene acceso.')).toBeInTheDocument();
    expect(api.quitarDeEquipo).toHaveBeenCalledWith('s1', 'ines@example.com');
  });
});
