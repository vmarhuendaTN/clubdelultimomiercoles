import { fireEvent, render, screen, within } from '@testing-library/react';
import { ToastProvider } from '@/components/ui';
import { SeccionInscritas } from './SeccionInscritas';

const api = vi.hoisted(() => ({
  listarInscritas: vi.fn(),
  guardarInscrita: vi.fn(),
  vincularPersona: vi.fn(),
}));
vi.mock('../../services/api', () => api);

const MARTA = {
  id: 'i1',
  nombre: 'Marta',
  apellidos: 'Ruiz',
  telefono: '+34 600 00 00 00',
  email: 'marta@example.com',
  alta: '2026-11-11',
  activa: 'si',
  participaciones_auto: '2',
  ajuste: '1',
  participaciones: '3',
  notas: '',
  club: '1',
};

const pintar = (club: '' | '1' | '2' = '') =>
  render(
    <ToastProvider>
      <SeccionInscritas sesion="s1" alCaducar={vi.fn()} club={club} />
    </ToastProvider>,
  );

describe('SeccionInscritas', () => {
  beforeEach(() => {
    Object.values(api).forEach((f) => f.mockReset());
    api.listarInscritas.mockResolvedValue({
      ok: true,
      inscritas: [MARTA, { ...MARTA, id: 'i2', nombre: 'Luis', activa: 'no' }],
      sinInscribir: [{ nombre: 'Ana', apellidos: 'García', participaciones: '1', club: '2' }],
    });
    api.guardarInscrita.mockResolvedValue({ ok: true });
  });

  it('lista las inscritas activas con contacto y participaciones', async () => {
    pintar();
    const lista = await screen.findByRole('list', { name: 'Inscritas' });
    expect(within(lista).getByText('Marta Ruiz')).toBeInTheDocument();
    expect(within(lista).getByText('3 participaciones')).toBeInTheDocument();
    expect(within(lista).getByRole('link', { name: '+34 600 00 00 00' })).toHaveAttribute(
      'href',
      'tel:+34600000000',
    );
    expect(within(lista).queryByText('Luis Ruiz')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /De baja/ }));
    expect(await screen.findByText('Luis Ruiz')).toBeInTheDocument();
  });

  it('inscribe a quien ha propuesto con su nombre ya puesto', async () => {
    pintar();
    fireEvent.click(await screen.findByRole('button', { name: /Sin inscribir/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Inscribir a Ana García' }));
    fireEvent.change(screen.getByLabelText('Teléfono'), { target: { value: '600 11 22 33' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));
    expect(await screen.findByText('Ana García ya está inscrita.')).toBeInTheDocument();
    expect(api.guardarInscrita).toHaveBeenCalledWith(
      's1',
      expect.objectContaining({
        nombre: 'Ana',
        apellidos: 'García',
        telefono: '600 11 22 33',
        club: '2',
      }),
    );
  });

  it('valida email y ajuste antes de guardar', async () => {
    pintar();
    fireEvent.click(await screen.findByRole('button', { name: 'Editar a Marta Ruiz' }));
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'marta' } });
    fireEvent.change(screen.getByLabelText(/Ajuste/), { target: { value: 'dos' } });
    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));
    expect(await screen.findByText('Escribe un email válido.')).toBeInTheDocument();
    expect(screen.getByText(/Un número entero/)).toBeInTheDocument();
    expect(api.guardarInscrita).not.toHaveBeenCalled();
  });

  it('filtra por el club elegido en el panel', async () => {
    api.listarInscritas.mockResolvedValue({
      ok: true,
      inscritas: [MARTA, { ...MARTA, id: 'i2', nombre: 'Rosa', club: '2' }],
      sinInscribir: [],
    });
    pintar('1');
    const lista = await screen.findByRole('list', { name: 'Inscritas' });
    expect(within(lista).getByText('Marta Ruiz')).toBeInTheDocument();
    expect(within(lista).queryByText('Rosa Ruiz')).toBeNull();
  });

  it('vincula con un clic a quien escribió su nombre con erratas', async () => {
    api.listarInscritas.mockResolvedValue({
      ok: true,
      inscritas: [MARTA],
      sinInscribir: [
        {
          nombre: 'marta',
          apellidos: 'ruís',
          participaciones: '1',
          sugerida_id: 'i1',
          sugerida_nombre: 'Marta Ruiz',
        },
      ],
    });
    api.vincularPersona.mockResolvedValue({ ok: true, unidas: 2 });
    pintar();
    fireEvent.click(await screen.findByRole('button', { name: /Sin inscribir/ }));
    expect(screen.getByText('¿Es Marta Ruiz?')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Vincular a marta ruís con Marta Ruiz' }));
    expect(await screen.findByText(/2 envíos unidos a su ficha/)).toBeInTheDocument();
    expect(api.vincularPersona).toHaveBeenCalledWith('s1', {
      nombre: 'marta',
      apellidos: 'ruís',
      inscrita_id: 'i1',
    });
  });

  it('vincula con otra inscrita eligiéndola de la lista', async () => {
    api.listarInscritas.mockResolvedValue({
      ok: true,
      inscritas: [MARTA],
      sinInscribir: [{ nombre: 'Martita', apellidos: '', participaciones: '1' }],
    });
    api.vincularPersona.mockResolvedValue({ ok: true, unidas: 1 });
    pintar();
    fireEvent.click(await screen.findByRole('button', { name: /Sin inscribir/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Vincular a Martita con otra inscrita' }));
    fireEvent.change(screen.getByLabelText('Es la misma persona que…'), {
      target: { value: 'i1' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Vincular' }));
    expect(await screen.findByText(/Martita es Marta Ruiz: 1 envío unido/)).toBeInTheDocument();
  });
});
