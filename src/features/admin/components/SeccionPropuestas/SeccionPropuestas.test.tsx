import { fireEvent, render, screen, within } from '@testing-library/react';
import { ToastProvider } from '@/components/ui';
import type { Propuesta } from '../../types';
import { SeccionPropuestas } from './SeccionPropuestas';

const api = vi.hoisted(() => ({
  listarTintero: vi.fn(),
  listarPropuestas: vi.fn(),
  guardarPropuesta: vi.fn(),
  guardarLectura: vi.fn(),
}));
vi.mock('../../services/api', () => api);

const base = { tintero: '', motivo: '', nota_equipo: '', grupo: 'Miércoles' };
const PROPUESTAS: Propuesta[] = [
  {
    ...base,
    id: 'p1',
    creado_en: '2026-11-01T10:00:00Z',
    nombre: 'Marta',
    apellidos: 'Ruiz',
    mes: 'enero',
    anio: '2027',
    lectura_1: 'Circe, Madeline Miller',
    lectura_2: 'Tea Rooms',
    lectura_3: 'Betty',
    tintero: 'Piranesi, Susanna Clarke',
    estado: 'nueva',
  },
  {
    ...base,
    id: 'p2',
    creado_en: '2026-11-02T10:00:00Z',
    nombre: 'Luis',
    apellidos: 'Gómez',
    mes: 'enero',
    anio: '2027',
    lectura_1: 'Circe',
    lectura_2: 'Maniac',
    lectura_3: 'Reunión',
    estado: 'nueva',
  },
  {
    ...base,
    id: 'p3',
    creado_en: '2026-09-01T10:00:00Z',
    nombre: 'Ana',
    apellidos: 'Sanz',
    mes: 'noviembre',
    anio: '2026',
    lectura_1: 'Maniac',
    lectura_2: 'Hamnet',
    lectura_3: 'Klara y el sol',
    estado: 'descartada',
  },
];

const pintar = () =>
  render(
    <ToastProvider>
      <SeccionPropuestas sesion="s1" esAdmin alCaducar={vi.fn()} />
    </ToastProvider>,
  );

describe('SeccionPropuestas', () => {
  beforeEach(() => {
    Object.values(api).forEach((f) => f.mockReset());
    api.listarPropuestas.mockResolvedValue({ ok: true, propuestas: PROPUESTAS });
    api.listarTintero.mockResolvedValue({ ok: true, tintero: [] });
  });

  it('abre en la sesión más reciente con sus cifras y la clasificación', async () => {
    pintar();
    expect(await screen.findByLabelText('Sesión')).toHaveValue('2027-01');
    expect(screen.getByText('Personas', { selector: 'span' }).previousSibling).toHaveTextContent(
      '2',
    );
    expect(screen.getByText('Coincidencias').previousSibling).toHaveTextContent('1');
    const ranking = screen.getByRole('heading', { name: 'Los más propuestos' }).closest('section')!;
    const primero = within(ranking).getAllByRole('listitem')[0]!;
    expect(primero).toHaveTextContent('Circe');
    expect(primero).toHaveTextContent('2 personas · 6 puntos');
    expect(screen.getByText('También en Noviembre de 2026')).toBeInTheDocument();
    expect(screen.getByText('Piranesi, Susanna Clarke')).toBeInTheDocument();
  });

  it('al cambiar de sesión cambian las cifras', async () => {
    pintar();
    fireEvent.change(await screen.findByLabelText('Sesión'), { target: { value: '2026-11' } });
    expect(screen.getByText('Personas', { selector: 'span' }).previousSibling).toHaveTextContent(
      '1',
    );
  });

  it('en Personas se cambia el estado y se guarda en la hoja', async () => {
    api.guardarPropuesta.mockResolvedValue({ ok: true, propuesta: {} });
    pintar();
    await screen.findByLabelText('Sesión');
    fireEvent.click(screen.getByRole('tab', { name: 'Personas' }));
    fireEvent.change(screen.getByLabelText('Estado de la propuesta de Marta Ruiz'), {
      target: { value: 'en_votacion' },
    });
    expect(await screen.findByText('Propuesta de Marta Ruiz: en votación.')).toBeInTheDocument();
    expect(api.guardarPropuesta).toHaveBeenCalledWith('s1', {
      id: 'p1',
      estado: 'en_votacion',
      nota_equipo: '',
    });
  });

  it('desde la clasificación se pasa un libro a Lecturas con título y autor', async () => {
    pintar();
    fireEvent.click(
      await screen.findByRole('button', { name: 'Añadir «Circe, Madeline Miller» a lecturas' }),
    );
    const hoja = screen.getByRole('dialog');
    expect(within(hoja).getByLabelText(/^Título/)).toHaveValue('Circe');
    expect(within(hoja).getByLabelText(/^Autor/)).toHaveValue('Madeline Miller');
    expect(within(hoja).getByLabelText('Estado')).toHaveValue('proximo');
  });

  it('copia el resumen para compartirlo', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    pintar();
    fireEvent.click(await screen.findByRole('button', { name: 'Copiar resumen' }));
    expect(await screen.findByText(/Resumen copiado/)).toBeInTheDocument();
    expect(writeText.mock.calls[0]?.[0]).toMatch(/^Propuestas · Enero de 2027/);
  });

  it('el tintero tiene su propia vista', async () => {
    pintar();
    await screen.findByLabelText('Sesión');
    fireEvent.click(screen.getByRole('tab', { name: 'Tintero' }));
    expect(await screen.findByRole('heading', { name: 'Tintero' })).toBeInTheDocument();
  });

  it('sin propuestas lo dice', async () => {
    api.listarPropuestas.mockResolvedValue({ ok: true, propuestas: [] });
    pintar();
    expect(await screen.findByText(/Todavía no hay lecturas propuestas/)).toBeInTheDocument();
  });
});
