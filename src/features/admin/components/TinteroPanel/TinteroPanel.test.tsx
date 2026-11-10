import { fireEvent, render, screen } from '@testing-library/react';
import { ToastProvider } from '@/components/ui';
import type { LibroTintero } from '../../types';
import { TinteroPanel } from './TinteroPanel';

const api = vi.hoisted(() => ({
  listarTintero: vi.fn(),
  recomendarTintero: vi.fn(),
  guardarEnTintero: vi.fn(),
}));
vi.mock('../../services/api', () => api);

const base = { visible: 'si', nota: '', recomendada: '' };
const TINTERO: LibroTintero[] = [
  { ...base, id: '1', titulo: 'Circe', autor: 'Madeline Miller', recomendada: 'si' },
  { ...base, id: '2', titulo: 'Betty', autor: 'Tiffany McDaniel' },
  { ...base, id: '3', titulo: 'Oculto', autor: 'Nadie', visible: 'no' },
];

const pintar = (esAdmin = true) =>
  render(
    <ToastProvider>
      <TinteroPanel sesion="s1" esAdmin={esAdmin} alCaducar={vi.fn()} />
    </ToastProvider>,
  );

describe('TinteroPanel', () => {
  beforeEach(() => {
    api.listarTintero.mockReset().mockResolvedValue({ ok: true, tintero: TINTERO });
    api.recomendarTintero.mockReset().mockResolvedValue({ ok: true });
    api.guardarEnTintero.mockReset();
  });

  it('cuenta las visibles y solo ofrece recomendar las que faltan', async () => {
    pintar();
    expect(await screen.findByText('2 lecturas en el tintero')).toBeInTheDocument();
    expect(screen.getByText('Circe, Madeline Miller')).toBeInTheDocument();
    const select = screen.getByLabelText('Recomendar una lectura del tintero');
    expect([...select.querySelectorAll('option')].map((o) => o.textContent)).toEqual([
      'Elige una lectura…',
      'Betty, Tiffany McDaniel',
    ]);
  });

  it('una admin recomienda y deja de recomendar', async () => {
    pintar();
    fireEvent.change(await screen.findByLabelText('Recomendar una lectura del tintero'), {
      target: { value: '2' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Recomendar' }));
    expect(await screen.findByText(/«Betty» aparece ahora/)).toBeInTheDocument();
    expect(api.recomendarTintero).toHaveBeenCalledWith('s1', '2', true);
    fireEvent.click(
      screen.getByRole('button', { name: 'Dejar de recomendar Circe, Madeline Miller' }),
    );
    expect(await screen.findByText(/«Circe» ya no está recomendada/)).toBeInTheDocument();
  });

  it('una editora ve las recomendadas pero no puede cambiarlas', async () => {
    pintar(false);
    expect(await screen.findByText('Circe, Madeline Miller')).toBeInTheDocument();
    expect(screen.queryByLabelText('Recomendar una lectura del tintero')).toBeNull();
    expect(screen.queryByRole('button', { name: /Dejar de recomendar/ })).toBeNull();
  });

  it('añade una lectura al tintero', async () => {
    api.guardarEnTintero.mockResolvedValue({
      ok: true,
      libro: { ...base, id: '9', titulo: 'Piranesi', autor: 'Susanna Clarke' },
    });
    pintar(false);
    await screen.findByText('2 lecturas en el tintero');
    fireEvent.change(screen.getByLabelText('Título'), { target: { value: 'Piranesi' } });
    fireEvent.change(screen.getByLabelText('Autor o autora'), {
      target: { value: 'Susanna Clarke' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Añadir' }));
    expect(await screen.findByText('«Piranesi» está ya en el tintero.')).toBeInTheDocument();
    expect(api.guardarEnTintero).toHaveBeenCalledWith('s1', {
      titulo: 'Piranesi',
      autor: 'Susanna Clarke',
    });
    expect(screen.getByText('3 lecturas en el tintero')).toBeInTheDocument();
  });
});
