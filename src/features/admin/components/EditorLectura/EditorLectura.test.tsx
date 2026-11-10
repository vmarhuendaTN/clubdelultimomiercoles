import { fireEvent, render, screen } from '@testing-library/react';
import { ToastProvider } from '@/components/ui';
import { LECTURA_VACIA } from '../FormularioLectura';
import { EditorLectura } from './EditorLectura';

const api = vi.hoisted(() => ({ guardarLectura: vi.fn() }));
vi.mock('../../services/api', () => api);

beforeAll(() => {
  // jsdom no implementa <dialog>.
  HTMLDialogElement.prototype.showModal ??= function (this: HTMLDialogElement) {
    this.open = true;
  };
  HTMLDialogElement.prototype.close ??= function (this: HTMLDialogElement) {
    this.open = false;
  };
});

function pintar(onGuardada = vi.fn(), alCaducar = vi.fn()) {
  render(
    <ToastProvider>
      <EditorLectura
        lectura={{ ...LECTURA_VACIA, titulo: 'Leviatán', autor: 'Paul Auster' }}
        sesion="s1"
        onCerrar={vi.fn()}
        onGuardada={onGuardada}
        alCaducar={alCaducar}
      />
    </ToastProvider>,
  );
  return { onGuardada, alCaducar };
}

describe('EditorLectura', () => {
  beforeEach(() => api.guardarLectura.mockReset());

  it('guarda en la hoja y avisa de que hay que publicar', async () => {
    const guardada = { ...LECTURA_VACIA, id: 'x1', titulo: 'Leviatán', autor: 'Paul Auster' };
    api.guardarLectura.mockResolvedValue({ ok: true, lectura: guardada });
    const { onGuardada } = pintar();
    expect(screen.getByRole('heading', { name: 'Nueva lectura' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));
    expect(await screen.findByText(/Publicar ahora/)).toBeInTheDocument();
    expect(api.guardarLectura).toHaveBeenCalledWith(
      's1',
      expect.objectContaining({ titulo: 'Leviatán' }),
    );
    expect(onGuardada).toHaveBeenCalledWith(guardada);
  });

  it('si el script rechaza los datos, muestra su explicación', async () => {
    api.guardarLectura.mockResolvedValue({
      ok: false,
      error: 'datos_no_validos',
      detalle: 'Fecha no válida.',
    });
    const { onGuardada } = pintar();
    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));
    expect(await screen.findByText('Fecha no válida.')).toBeInTheDocument();
    expect(onGuardada).not.toHaveBeenCalled();
  });

  it('si la sesión caducó, avisa al panel', async () => {
    api.guardarLectura.mockResolvedValue({ ok: false, error: 'sesion_no_valida' });
    const { alCaducar } = pintar();
    fireEvent.click(screen.getByRole('button', { name: 'Guardar' }));
    await screen.findByText(/sesión ha caducado/);
    expect(alCaducar).toHaveBeenCalled();
  });
});
