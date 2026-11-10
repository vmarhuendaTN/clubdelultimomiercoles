import { fireEvent, render, screen } from '@testing-library/react';
import { ToastProvider } from '@/components/ui';
import type { Propuesta } from '../../types';
import { SeccionPropuestas } from './SeccionPropuestas';

const api = vi.hoisted(() => ({
  listarPropuestas: vi.fn(),
  guardarPropuesta: vi.fn(),
  guardarLectura: vi.fn(),
}));
vi.mock('../../services/api', () => api);

const PROPUESTAS: Propuesta[] = [
  {
    id: 'p1',
    creado_en: '2026-11-01T10:00:00Z',
    titulo: 'La península de las casas vacías',
    autor: 'David Uclés',
    propuesto_por: 'Marta',
    motivo: 'Porque sí.',
    google_books_id: 'gb1234567',
    estado: 'nueva',
    nota_equipo: '',
  },
  {
    id: 'p2',
    creado_en: '2026-10-01T10:00:00Z',
    titulo: 'Tea Rooms',
    autor: 'Luisa Carnés',
    propuesto_por: 'Luis',
    motivo: '',
    google_books_id: '',
    estado: 'descartada',
    nota_equipo: '',
  },
];

const pintar = () =>
  render(
    <ToastProvider>
      <SeccionPropuestas sesion="s1" alCaducar={vi.fn()} />
    </ToastProvider>,
  );

describe('SeccionPropuestas', () => {
  beforeEach(() => {
    Object.values(api).forEach((f) => f.mockReset());
    api.listarPropuestas.mockResolvedValue({ ok: true, propuestas: PROPUESTAS });
  });

  it('muestra las propuestas con quién las hizo y filtra por estado', async () => {
    pintar();
    expect(await screen.findByText('La península de las casas vacías')).toBeInTheDocument();
    expect(screen.getByText(/Propuesta de Marta/)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Mostrar'), { target: { value: 'descartada' } });
    expect(screen.getByText('1 propuesta')).toBeInTheDocument();
    expect(screen.queryByText('La península de las casas vacías')).toBeNull();
  });

  it('cambiar el estado lo guarda en la hoja', async () => {
    api.guardarPropuesta.mockResolvedValue({ ok: true, propuesta: {} });
    pintar();
    const select = await screen.findByLabelText('Estado de «La península de las casas vacías»');
    fireEvent.change(select, { target: { value: 'en_votacion' } });
    expect(await screen.findByText(/en votación\./)).toBeInTheDocument();
    expect(api.guardarPropuesta).toHaveBeenCalledWith('s1', {
      id: 'p1',
      estado: 'en_votacion',
      nota_equipo: '',
    });
  });

  it('«Añadir a lecturas» abre el editor con los datos de la propuesta', async () => {
    pintar();
    await screen.findByText('La península de las casas vacías');
    fireEvent.click(screen.getAllByRole('button', { name: 'Añadir a lecturas' })[0]!);
    expect(screen.getByRole('heading', { name: 'Nueva lectura' })).toBeInTheDocument();
    expect(screen.getByLabelText(/^Título/)).toHaveValue('La península de las casas vacías');
    expect(screen.getByText('gb1234567')).toBeInTheDocument();
  });
});
