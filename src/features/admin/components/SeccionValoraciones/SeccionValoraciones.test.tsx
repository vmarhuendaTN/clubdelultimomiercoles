import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { ToastProvider } from '@/components/ui';
import { SeccionValoraciones } from './SeccionValoraciones';

const api = vi.hoisted(() => ({ listarValoraciones: vi.fn(), guardarValoraciones: vi.fn() }));
vi.mock('../../services/api', () => api);

const DATOS = {
  ok: true,
  lecturas: [
    {
      id: 'l1',
      titulo: 'Sinsonte',
      autor: 'Walter Tevis',
      estado: 'leido',
      fecha_sesion: '2026-10-28',
      orden: '25',
    },
    {
      id: 'l2',
      titulo: 'El secreto',
      autor: 'Donna Tartt',
      estado: 'leido',
      fecha_sesion: '2026-09-30',
      orden: '24',
    },
  ],
  inscritas: [
    { id: 'i1', nombre: 'Marta', apellidos: 'Ruiz', activa: 'si', club: '1' },
    { id: 'i2', nombre: 'Luis', apellidos: 'Pérez', activa: 'si', club: '2' },
    { id: 'i3', nombre: 'Eva', apellidos: 'Sanz', activa: 'no', club: '1' },
  ],
  valoraciones: [
    {
      id: 'v1',
      creado_en: '',
      lectura_id: 'l1',
      titulo: 'Sinsonte',
      autor: '',
      inscrita_id: 'i1',
      nombre: 'Marta',
      apellidos: 'Ruiz',
      nota: '8',
    },
    {
      id: 'v2',
      creado_en: '',
      lectura_id: 'l2',
      titulo: 'El secreto',
      autor: '',
      inscrita_id: 'i1',
      nombre: 'Marta',
      apellidos: 'Ruiz',
      nota: '9',
    },
  ],
};

const pintar = (club: '' | '1' | '2' = '') =>
  render(
    <ToastProvider>
      <SeccionValoraciones sesion="s1" alCaducar={vi.fn()} club={club} />
    </ToastProvider>,
  );

describe('SeccionValoraciones', () => {
  beforeEach(() => {
    Object.values(api).forEach((f) => f.mockReset());
    api.listarValoraciones.mockResolvedValue(DATOS);
    api.guardarValoraciones.mockResolvedValue({ ok: true });
  });

  it('apunta notas de la lectura más reciente y envía solo los cambios', async () => {
    pintar();
    await waitFor(() => expect(screen.getByLabelText('Marta Ruiz')).toHaveValue('8'));
    expect(screen.queryByLabelText('Eva Sanz')).toBeNull(); // de baja y sin nota
    fireEvent.change(screen.getByLabelText('Luis Pérez'), { target: { value: '6,5' } });
    expect(screen.getByText('7,3')).toBeInTheDocument(); // media en directo
    expect(screen.getByText(/1 sin guardar/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Guardar notas' }));
    expect(
      await screen.findByText(/Notas guardadas: media 7,3 con 2 valoraciones/),
    ).toBeInTheDocument();
    expect(api.guardarValoraciones).toHaveBeenCalledWith('s1', {
      lectura_id: 'l1',
      notas: [{ inscrita_id: 'i2', nota: '6,5' }],
    });
  });

  it('no deja guardar notas fuera de 0 a 10', async () => {
    pintar();
    fireEvent.change(await screen.findByLabelText('Luis Pérez'), { target: { value: '12' } });
    expect(screen.getByText('De 0 a 10')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Guardar notas' })).toBeDisabled();
  });

  it('muestra medias por libro y por persona', async () => {
    pintar();
    await screen.findByLabelText('Marta Ruiz');
    fireEvent.click(screen.getByRole('tab', { name: 'Por libro' }));
    const libros = screen.getByRole('list', { name: 'Valoraciones por libro' });
    expect(within(libros).getByRole('heading', { name: 'Sinsonte' })).toBeInTheDocument();
    expect(within(libros).getByLabelText('Media 9')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: 'Por persona' }));
    const personas = screen.getByRole('list', { name: 'Valoraciones por persona' });
    expect(within(personas).getByLabelText('Media 8,5')).toBeInTheDocument();
  });

  it('con un club elegido solo apunta a sus personas', async () => {
    pintar('2');
    expect(await screen.findByLabelText('Luis Pérez')).toBeInTheDocument();
    expect(screen.queryByLabelText('Marta Ruiz')).toBeNull();
  });

  it('con los dos clubs compara sus medias por libro', async () => {
    pintar();
    await screen.findByLabelText('Marta Ruiz');
    fireEvent.click(screen.getByRole('tab', { name: 'Por libro' }));
    expect(screen.getAllByText('Club 1: 8 · Club 2: —')[0]).toBeInTheDocument();
  });

  it('Intro pasa a la siguiente persona', async () => {
    pintar();
    const luis = await screen.findByLabelText('Luis Pérez');
    luis.focus();
    fireEvent.keyDown(luis, { key: 'Enter' });
    expect(screen.getByLabelText('Marta Ruiz')).toHaveFocus();
  });
});
