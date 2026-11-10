import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ToastProvider } from '@/components/ui';
import { PublicarAhora } from './PublicarAhora';

const api = vi.hoisted(() => ({ estadoPublicacion: vi.fn(), publicar: vi.fn() }));
vi.mock('../../services/api', () => api);

const pintar = () =>
  render(
    <ToastProvider>
      <PublicarAhora sesion="s1" alCaducar={vi.fn()} />
    </ToastProvider>,
  );

describe('PublicarAhora', () => {
  beforeEach(() => Object.values(api).forEach((f) => f.mockReset()));

  it('publica y lo confirma', async () => {
    api.estadoPublicacion.mockResolvedValue({ ok: true, configurado: true, ultima: null });
    api.publicar.mockResolvedValue({ ok: true });
    pintar();
    fireEvent.click(screen.getByRole('button', { name: 'Publicar ahora' }));
    expect(await screen.findByText(/se actualizará en unos 3 minutos/)).toBeInTheDocument();
    expect(api.publicar).toHaveBeenCalledWith('s1');
  });

  it('sin token de GitHub, explica qué falta y no deja publicar', async () => {
    api.estadoPublicacion.mockResolvedValue({ ok: true, configurado: false });
    pintar();
    expect(await screen.findByText(/GH_DISPATCH_TOKEN/)).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Publicar ahora' })).toBeDisabled(),
    );
  });

  it('muestra la última publicación con su enlace', async () => {
    api.estadoPublicacion.mockResolvedValue({
      ok: true,
      configurado: true,
      ultima: {
        estado: 'completed',
        resultado: 'failure',
        creada_en: '2026-11-10T18:00:00Z',
        url: 'https://github.com/x',
      },
    });
    pintar();
    expect(await screen.findByText(/falló/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver detalles en GitHub' })).toHaveAttribute(
      'href',
      'https://github.com/x',
    );
  });
});
