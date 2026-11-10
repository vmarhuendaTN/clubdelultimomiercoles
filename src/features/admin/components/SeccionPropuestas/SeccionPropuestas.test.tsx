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

const base = { tintero: '', motivo: '', nota_equipo: '' };
const PROPUESTAS: Propuesta[] = [
  {
    ...base,
    id: 'p1',
    creado_en: '2026-11-01T10:00:00Z',
    nombre: 'Marta',
    apellidos: 'Ruiz',
    grupo: 'Miércoles',
    mes: 'enero',
    anio: '2027',
    lectura_1: 'La península de las casas vacías',
    lectura_2: 'Tea Rooms',
    lectura_3: 'Circe',
    tintero: 'Piranesi',
    motivo: 'Porque sí.',
    estado: 'nueva',
  },
  {
    ...base,
    id: 'p2',
    creado_en: '2026-10-01T10:00:00Z',
    nombre: 'Luis',
    apellidos: 'Gómez',
    grupo: 'Miércoles',
    mes: 'noviembre',
    anio: '2026',
    lectura_1: 'Maniac',
    lectura_2: 'Betty',
    lectura_3: 'Reunión',
    estado: 'descartada',
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
    expect(await screen.findByRole('heading', { name: 'Marta Ruiz' })).toBeInTheDocument();
    expect(screen.getByText('Grupo Miércoles · para enero de 2027')).toBeInTheDocument();
    expect(screen.getByText('La península de las casas vacías')).toBeInTheDocument();
    expect(screen.getByText('Piranesi')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Mostrar'), { target: { value: 'descartada' } });
    expect(screen.getByText('1 propuesta')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Marta Ruiz' })).toBeNull();
  });

  it('cambiar el estado lo guarda en la hoja', async () => {
    api.guardarPropuesta.mockResolvedValue({ ok: true, propuesta: {} });
    pintar();
    const select = await screen.findByLabelText('Estado de la propuesta de Marta Ruiz');
    fireEvent.change(select, { target: { value: 'en_votacion' } });
    expect(await screen.findByText('Propuesta de Marta Ruiz: en votación.')).toBeInTheDocument();
    expect(api.guardarPropuesta).toHaveBeenCalledWith('s1', {
      id: 'p1',
      estado: 'en_votacion',
      nota_equipo: '',
    });
  });

  it('cada lectura propuesta se puede añadir a lecturas', async () => {
    pintar();
    fireEvent.click(await screen.findByRole('button', { name: 'Añadir «Tea Rooms» a lecturas' }));
    expect(screen.getByRole('heading', { name: 'Nueva lectura' })).toBeInTheDocument();
    expect(screen.getByLabelText(/^Título/)).toHaveValue('Tea Rooms');
    expect(screen.getByLabelText('Estado')).toHaveValue('propuesta');
  });
});
