import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ToastProvider } from '@/components/ui';
import type { Recomendacion } from '../../types';
import { RecomendacionesSesion } from './RecomendacionesSesion';

const api = vi.hoisted(() => ({
  listarRecomendaciones: vi.fn(),
  guardarRecomendacion: vi.fn(),
  quitarRecomendacion: vi.fn(),
}));
vi.mock('../../services/api', () => api);

const base = { nota: '', creado_por: 'ines@example.com' };
const LISTA: Recomendacion[] = [
  { ...base, id: 'r1', sesion: '2027-01', titulo: 'Circe', autor: 'Madeline Miller' },
  { ...base, id: 'r2', sesion: '2027-03', titulo: 'Betty', autor: 'Tiffany McDaniel' },
];
const HOY = new Date(2026, 11, 3);

const pintar = (esAdmin = true, periodoInicial?: string) =>
  render(
    <ToastProvider>
      <RecomendacionesSesion
        sesion="s1"
        esAdmin={esAdmin}
        alCaducar={vi.fn()}
        periodoInicial={periodoInicial}
        hoy={HOY}
      />
    </ToastProvider>,
  );

describe('RecomendacionesSesion', () => {
  beforeEach(() => {
    api.listarRecomendaciones.mockReset().mockResolvedValue({ ok: true, recomendaciones: LISTA });
    api.guardarRecomendacion.mockReset();
    api.quitarRecomendacion.mockReset().mockResolvedValue({ ok: true });
  });

  it('abre en el mes que viene y enseña solo las de esa sesión', async () => {
    pintar();
    expect(await screen.findByText('Circe, Madeline Miller')).toBeInTheDocument();
    expect(screen.queryByText('Betty, Tiffany McDaniel')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Mes')).toHaveValue('enero');
    expect(screen.getByLabelText('Año')).toHaveValue('2027');
    fireEvent.change(screen.getByLabelText('Mes'), { target: { value: 'marzo' } });
    expect(screen.getByText('Betty, Tiffany McDaniel')).toBeInTheDocument();
  });

  it('ofrece diez años para no tener que actualizarlo', async () => {
    pintar(true, '2027-03');
    await screen.findByText('Betty, Tiffany McDaniel');
    expect(screen.getByLabelText('Año').querySelectorAll('option')).toHaveLength(10);
  });

  it('recomienda una lectura para la sesión elegida', async () => {
    api.guardarRecomendacion.mockResolvedValue({
      ok: true,
      recomendacion: {
        ...base,
        id: 'r3',
        sesion: '2027-01',
        titulo: 'Lo que el viento',
        autor: '',
      },
    });
    pintar();
    await screen.findByText('Circe, Madeline Miller');
    fireEvent.change(screen.getByLabelText('Título'), { target: { value: 'Lo que el viento' } });
    fireEvent.click(screen.getByRole('button', { name: 'Recomendar' }));
    await waitFor(() =>
      expect(api.guardarRecomendacion).toHaveBeenCalledWith('s1', {
        sesion: '2027-01',
        titulo: 'Lo que el viento',
        autor: '',
      }),
    );
    expect(await screen.findByText('Lo que el viento')).toBeInTheDocument();
  });

  it('quita una recomendación', async () => {
    pintar();
    fireEvent.click(await screen.findByRole('button', { name: 'Quitar Circe, Madeline Miller' }));
    await waitFor(() => expect(api.quitarRecomendacion).toHaveBeenCalledWith('s1', 'r1'));
    await waitFor(() =>
      expect(screen.queryByText('Circe, Madeline Miller')).not.toBeInTheDocument(),
    );
  });

  it('el equipo ve las recomendaciones, pero no las cambia', async () => {
    pintar(false);
    expect(await screen.findByText('Circe, Madeline Miller')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Recomendar' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Quitar/ })).not.toBeInTheDocument();
  });
});
