import { fireEvent, render, screen } from '@testing-library/react';
import { ToastProvider } from '@/components/ui';
import type { LecturaHoja } from '../../types';
import { RecomendadasAdmin } from './RecomendadasAdmin';

const api = vi.hoisted(() => ({ listarLecturas: vi.fn(), recomendarLectura: vi.fn() }));
vi.mock('../../services/api', () => api);

const base = {
  orden: '',
  fecha_sesion: '',
  isbn: '',
  google_books_id: '',
  portada_manual: '',
  descripcion_manual: '',
  nota_club: '',
  visible: 'si',
  revisar: '',
};
const LECTURAS: LecturaHoja[] = [
  {
    ...base,
    id: '1',
    titulo: 'Circe',
    autor: 'Madeline Miller',
    estado: 'por_clasificar',
    recomendada: 'si',
  },
  { ...base, id: '2', titulo: 'Betty', autor: 'Tiffany McDaniel', estado: 'por_clasificar' },
  { ...base, id: '3', titulo: 'Sinsonte', autor: 'Walter Tevis', estado: 'proximo' },
];

const pintar = () =>
  render(
    <ToastProvider>
      <RecomendadasAdmin sesion="s1" alCaducar={vi.fn()} />
    </ToastProvider>,
  );

describe('RecomendadasAdmin', () => {
  beforeEach(() => {
    api.listarLecturas.mockReset().mockResolvedValue({ ok: true, lecturas: LECTURAS });
    api.recomendarLectura.mockReset().mockResolvedValue({ ok: true });
  });

  it('muestra las recomendadas y solo ofrece las del tintero que faltan', async () => {
    pintar();
    expect(await screen.findByText('Circe, Madeline Miller')).toBeInTheDocument();
    const opciones = screen.getAllByRole('option').map((o) => o.textContent);
    expect(opciones).toEqual(['Elige una lectura…', 'Betty, Tiffany McDaniel']);
  });

  it('recomienda la elegida en el desplegable', async () => {
    pintar();
    const select = await screen.findByLabelText('Recomendar una lectura del tintero');
    fireEvent.change(select, { target: { value: '2' } });
    fireEvent.click(screen.getByRole('button', { name: 'Recomendar' }));
    expect(await screen.findByText(/«Betty» aparece ahora/)).toBeInTheDocument();
    expect(api.recomendarLectura).toHaveBeenCalledWith('s1', '2', true);
    expect(
      screen.getByRole('button', { name: 'Dejar de recomendar Betty, Tiffany McDaniel' }),
    ).toBeInTheDocument();
  });

  it('deja de recomendar con la ×', async () => {
    pintar();
    fireEvent.click(
      await screen.findByRole('button', { name: 'Dejar de recomendar Circe, Madeline Miller' }),
    );
    expect(await screen.findByText(/«Circe» ya no está recomendada/)).toBeInTheDocument();
    expect(api.recomendarLectura).toHaveBeenCalledWith('s1', '1', false);
  });
});
